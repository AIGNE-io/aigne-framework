import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, resolve } from "node:path";
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
import { stringify } from "yaml";
import { z } from "zod";
import { exists, expandHome } from "../utils/fs.js";

export const MEMORY_FILE_NAME = "memory.yaml";

/**
 * Configuration options for the FSMemory class.
 */
export interface FSMemoryOptions extends Partial<MemoryAgentOptions> {
  /**
   * The root directory where memory files will be stored.
   * Can be absolute or relative path. Relative paths are resolved from the current working directory.
   * Home directory prefix (~) will be expanded appropriately.
   */
  rootDir: string;

  /**
   * Optional configuration for the memory retriever agent.
   * Controls how memories are retrieved from the file system.
   */
  retrieverOptions?: Partial<FSMemoryRetrieverOptions>;

  /**
   * Optional configuration for the memory recorder agent.
   * Controls how memories are recorded to the file system.
   */
  recorderOptions?: Partial<FSMemoryRecorderOptions>;
}

/**
 * A memory implementation that stores and retrieves memories using the file system.
 * FSMemory provides persistent storage of agent memories as files in a specified directory.
 *
 * @example
 * Here is an example of how to use the FSMemory class:
 * {@includeCode ../../test/fs-memory/fs-memory.test.ts#example-fs-memory-simple}
 */
export class FSMemory extends MemoryAgent {
  /**
   * Creates a new FSMemory instance.
   */
  constructor(options: FSMemoryOptions) {
    let rootDir = normalize(expandHome(options.rootDir));
    rootDir = isAbsolute(rootDir) ? rootDir : resolve(process.cwd(), rootDir);
    const memoryFileName = join(rootDir, MEMORY_FILE_NAME);

    super({
      ...options,
      recorder:
        options.recorder ??
        new FSMemoryRecorder({
          memoryFileName,
          ...options.recorderOptions,
        }),
      retriever:
        options.retriever ??
        new FSMemoryRetriever({
          memoryFileName,
          ...options.retrieverOptions,
        }),
      autoUpdate: options.autoUpdate ?? true,
    });
  }
}

interface FSMemoryRetrieverOptions
  extends AIAgentOptions<FSMemoryRetrieverAgentInput, FSMemoryRetrieverAgentOutput> {
  memoryFileName: string;
}

interface FSMemoryRetrieverAgentInput extends MemoryRetrieverInput {
  allMemory: string;
}

interface FSMemoryRetrieverAgentOutput extends Message {
  memories: {
    content: string;
  }[];
}

class FSMemoryRetriever extends MemoryRetriever {
  constructor(public readonly options: FSMemoryRetrieverOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "fs_memory_retriever",
      description: "Retrieves memories from the file or directory.",
      ...options,
      instructions: options.instructions || DEFAULT_FS_MEMORY_RETRIEVER_INSTRUCTIONS,
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

  agent: AIAgent<FSMemoryRetrieverAgentInput, FSMemoryRetrieverAgentOutput>;

  override async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    if (!(await exists(this.options.memoryFileName))) return { memories: [] };

    const allMemory = await readFile(this.options.memoryFileName, "utf-8");

    const { memories } = await options.context.invoke(this.agent, { ...input, allMemory });
    const result: Memory[] = memories.map((memory) => ({
      id: newMemoryId(),
      content: memory.content,
      createdAt: new Date().toISOString(),
    }));
    return { memories: result };
  }
}

interface FSMemoryRecorderOptions
  extends AIAgentOptions<FSMemoryRecorderAgentInput, FSMemoryRecorderAgentOutput> {
  memoryFileName: string;
}

type FSMemoryRecorderAgentInput = MemoryRecorderInput;

interface FSMemoryRecorderAgentOutput extends Message {
  memories: {
    content: string;
  }[];
}

class FSMemoryRecorder extends MemoryRecorder {
  constructor(public readonly options: FSMemoryRecorderOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "fs_memory_recorder",
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

  agent: AIAgent<FSMemoryRecorderAgentInput, FSMemoryRecorderAgentOutput>;

  override async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const allMemory = (await exists(this.options.memoryFileName))
      ? await readFile(this.options.memoryFileName, "utf-8")
      : "";

    const { memories } = await options.context.invoke(this.agent, { ...input, allMemory });

    const raw = stringify(
      memories.map((i) => ({
        content: i.content,
      })),
    );

    await mkdir(dirname(this.options.memoryFileName), { recursive: true });
    await writeFile(this.options.memoryFileName, raw, "utf-8");

    return {
      memories: memories.map((i) => ({
        id: newMemoryId(),
        content: i.content,
        createdAt: new Date().toISOString(),
      })),
    };
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

const DEFAULT_FS_MEMORY_RETRIEVER_INSTRUCTIONS = `You retrieve only the most relevant memories for the current conversation.

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
