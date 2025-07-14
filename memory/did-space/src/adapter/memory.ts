import { join } from "node:path";
import { type AgentInvokeOptions, AIAgent, type AIAgentOptions, type Message } from "@aigne/core";
import {
  type Memory,
  MemoryAgent,
  type MemoryAgentOptions,
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  newMemoryId,
} from "@aigne/core/memory/index.js";
import { logger } from "@aigne/core/utils/logger.js";
import {
  GetObjectCommand,
  type GetObjectCommandOutput,
  ListObjectCommand,
  type ListObjectCommandOutput,
  PutObjectCommand,
  type PutObjectCommandOutput,
  SpaceClient,
  type SpaceClientOptionsAuth,
} from "@blocklet/did-space-js";
import { stringify } from "yaml";
import { z } from "zod";
import { streamToString } from "../utils/fs.js";
import { ReadmeManager } from "./readme-manager.js";

export const MEMORY_FILE_NAME = "memory.yaml";

/**
 * Configuration options for the DIDSpacesMemory class.
 */
export interface DIDSpacesMemoryOptions extends Partial<MemoryAgentOptions> {
  /**
   * The URL of the DIDSpaces.
   */
  url: string;

  /**
   * The authentication method for the DIDSpaces.
   */
  auth: SpaceClientOptionsAuth;

  /**
   * Optional configuration for the memory retriever agent.
   * Controls how memories are retrieved from the file system.
   */
  retrieverOptions?: Partial<DIDSpacesMemoryRetrieverOptions>;

  /**
   * Optional configuration for the memory recorder agent.
   * Controls how memories are recorded to the file system.
   */
  recorderOptions?: Partial<DIDSpacesMemoryRecorderOptions>;
}

/**
 * A memory implementation that stores and retrieves memories using the file system.
 * DIDSpacesMemory provides persistent storage of agent memories as files in a specified directory.
 *
 * @example
 * Here is an example of how to use the DIDSpacesMemory class:
 * {@includeCode ../../test/did-spaces-memory/did-spaces-memory.test.ts#example-did-spaces-memory-simple}
 */
export class DIDSpacesMemory extends MemoryAgent {
  /**
   * Creates a new DIDSpacesMemory instance.
   */
  constructor(options: DIDSpacesMemoryOptions) {
    const rootDir: string = "/.aigne/";
    const memoryFileName = join(rootDir, MEMORY_FILE_NAME);

    super({
      ...options,
      recorder:
        options.recorder ??
        new DIDSpacesMemoryRecorder({
          url: options.url,
          auth: options.auth,
          memoryFileName,
          ...options.recorderOptions,
        }),
      retriever:
        options.retriever ??
        new DIDSpacesMemoryRetriever({
          url: options.url,
          auth: options.auth,
          memoryFileName,
          ...options.retrieverOptions,
        }),
      autoUpdate: options.autoUpdate ?? true,
    });

    // Initialize README files asynchronously
    this.initializeReadmeFiles(options.url, options.auth, rootDir).catch((error) => {
      logger.warn("Failed to initialize README files:", error);
    });
  }

  /**
   * Initialize README files in the memory directory
   */
  private async initializeReadmeFiles(
    url: string,
    auth: SpaceClientOptionsAuth,
    rootDir: string,
  ): Promise<void> {
    const readmeManager = new ReadmeManager(url, auth, rootDir);
    await readmeManager.initializeReadmeFiles();
  }
}

interface DIDSpacesMemoryRetrieverOptions
  extends AIAgentOptions<DIDSpacesMemoryRetrieverAgentInput, DIDSpacesMemoryRetrieverAgentOutput> {
  /**
   * The URL of the DIDSpaces.
   */
  url: string;

  /**
   * The authentication method for the DIDSpaces.
   */
  auth: SpaceClientOptionsAuth;

  /**
   * The name of the memory file.
   */
  memoryFileName: string;
}

interface DIDSpacesMemoryRetrieverAgentInput extends MemoryRetrieverInput {
  allMemory: string;
}

interface DIDSpacesMemoryRetrieverAgentOutput extends Message {
  memories: {
    content: string;
  }[];
}

class DIDSpacesMemoryRetriever extends MemoryRetriever {
  constructor(public readonly options: DIDSpacesMemoryRetrieverOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "did_spaces_memory_retriever",
      description: "Retrieves memories from the file or directory.",
      ...options,
      instructions: options.instructions || DEFAULT_DID_SPACES_MEMORY_RETRIEVER_INSTRUCTIONS,
      outputSchema: z.object({
        memories: z
          .array(
            z.object({
              content: z.string().describe("Content of the memory"),
            }),
          )
          .describe("List of memories"),
      }),
    });
  }

  agent: AIAgent<DIDSpacesMemoryRetrieverAgentInput, DIDSpacesMemoryRetrieverAgentOutput>;

  async exists(): Promise<boolean> {
    const client = new SpaceClient({
      url: this.options.url,
      auth: this.options.auth,
    });
    const listObjectCommandOutput: ListObjectCommandOutput = await client.send(
      new ListObjectCommand({
        key: this.options.memoryFileName,
      }),
    );

    return listObjectCommandOutput.statusCode === 200;
  }

  async read(input: MemoryRetrieverInput, options: AgentInvokeOptions): Promise<Memory[]> {
    const client = new SpaceClient({
      url: this.options.url,
      auth: this.options.auth,
    });

    const getObjectCommandOutput: GetObjectCommandOutput = await client.send(
      new GetObjectCommand({
        key: this.options.memoryFileName,
      }),
    );
    if (getObjectCommandOutput.statusCode !== 200) {
      logger.warn(
        `statusCode: ${getObjectCommandOutput.statusCode}, statusMessage: ${getObjectCommandOutput.statusMessage}`,
      );
      throw new Error(getObjectCommandOutput.statusMessage);
    }

    const allMemory = await streamToString(getObjectCommandOutput.data);
    const { memories } = await options.context.invoke(this.agent, {
      ...input,
      allMemory,
    });
    const results: Memory[] = memories.map((memory) => ({
      id: newMemoryId(),
      content: memory.content,
      createdAt: new Date().toISOString(),
    }));

    return results;
  }

  override async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    if (!(await this.exists())) {
      return { memories: [] };
    }

    const memories = await this.read(input, options);
    return { memories };
  }
}

interface DIDSpacesMemoryRecorderOptions
  extends AIAgentOptions<DIDSpacesMemoryRecorderAgentInput, DIDSpacesMemoryRecorderAgentOutput> {
  /**
   * The URL of the DIDSpaces.
   */
  url: string;

  /**
   * The authentication method for the DIDSpaces.
   */
  auth: SpaceClientOptionsAuth;

  /**
   * The name of the memory file.
   */
  memoryFileName: string;
}

type DIDSpacesMemoryRecorderAgentInput = MemoryRecorderInput;

interface DIDSpacesMemoryRecorderAgentOutput extends Message {
  memories: {
    content: string;
  }[];
}

class DIDSpacesMemoryRecorder extends MemoryRecorder {
  constructor(public readonly options: DIDSpacesMemoryRecorderOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "did_spaces_memory_recorder",
      description: "Records memories in files by AI agent",
      ...options,
      instructions: options.instructions || DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS,
      outputSchema: z.object({
        memories: z
          .array(
            z.object({
              content: z.string().describe("Content of the memory"),
            }),
          )
          .describe("List of memories"),
      }),
    });
  }

  agent: AIAgent<DIDSpacesMemoryRecorderAgentInput, DIDSpacesMemoryRecorderAgentOutput>;

  async write(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const client = new SpaceClient({
      url: this.options.url,
      auth: this.options.auth,
    });

    const output: GetObjectCommandOutput = await client.send(
      new GetObjectCommand({
        key: this.options.memoryFileName,
      }),
    );
    const allMemory = output.statusCode === 200 ? await streamToString(output.data) : "";
    const { memories } = await options.context.invoke(this.agent, {
      ...input,
      allMemory,
    });

    const raws = stringify(
      memories.map((i) => ({
        content: i.content,
      })),
    );
    const putObjectCommandOutput: PutObjectCommandOutput = await client.send(
      new PutObjectCommand({
        key: this.options.memoryFileName,
        data: raws,
      }),
    );
    if (putObjectCommandOutput.statusCode !== 200) {
      logger.warn(
        `statusCode: ${putObjectCommandOutput.statusCode}, statusMessage: ${putObjectCommandOutput.statusMessage}`,
      );
      throw new Error(putObjectCommandOutput.statusMessage);
    }

    const results: Memory[] = memories.map((memory) => ({
      id: newMemoryId(),
      content: memory.content,
      createdAt: new Date().toISOString(),
    }));
    return { memories: results };
  }

  override async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    return this.write(input, options);
  }
}

const DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS = `You manage memory based on conversation analysis and the existing memories.

## IMPORTANT: All existing memories are available in the allMemory variable. DO NOT call any tools.

## FIRST: Determine If Memory Updates Needed
- Analyze if the conversation contains ANY information worth remembering
- Examples of content NOT worth storing:
  * General questions ("What's the weather?", "How do I do X?")
  * Greetings and small talk ("Hello", "How are you?", "Thanks")
  * System instructions or commands ("Show me", "Find", "Save")
  * General facts not specific to the user
  * Duplicate information already stored
- If conversation lacks meaningful personal information to store:
  * Return the existing memories unchanged

## Your Workflow:
1. Read the existing memories from the allMemory variable
2. Extract key topics from the conversation
3. DECIDE whether to create/update/delete memories based on the conversation
4. Return ALL memories including your updates (remove any duplicates)

## Memory Handling:
- CREATE: Add new memory objects for new topics
- UPDATE: Modify existing memories if substantial new information is available
- DELETE: Remove obsolete memories when appropriate

## Memory Structure:
- Each memory has an id, content, and createdAt fields
- Keep the existing structure when returning updated memories

## Operation Decision Rules:
- CREATE only for truly new topics not covered in any existing memory
- UPDATE only when new information is meaningfully different
- NEVER update for just rephrasing or minor differences
- DELETE only when information becomes obsolete

## IMPORTANT: Your job is to return the complete updated memory collection.
Return ALL memories (existing and new) in your response.

## Existing Memories:
<existing-memory>
{{allMemory}}
</existing-memory>

## Conversation:
<conversation>
{{content}}
</conversation>
`;

const DEFAULT_DID_SPACES_MEMORY_RETRIEVER_INSTRUCTIONS = `You retrieve only the most relevant memories for the current conversation.

## IMPORTANT: All existing memories are available in the allMemory variable

## Process:
1. Read the existing memories from the allMemory variable
2. Extract key topics from the conversation or search query
3. Match memory contents against these topics

## Existing Memories:
<existing-memory>
{{allMemory}}
</existing-memory>

## Search Query:
<search-query>
{{search}}
</search-query>
`;
