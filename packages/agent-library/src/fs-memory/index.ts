import { isAbsolute, normalize, resolve } from "node:path";
import { AIAgent, type AIAgentOptions, type Context, type Message } from "@aigne/core";
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
} from "@aigne/core/memory/index.js";
import { z } from "zod";
import { FilesystemAgent } from "../filesystem/index.js";
import { expandHome } from "../filesystem/utils.js";

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
  retrieverOptions?: FSMemoryRetrieverOptions;

  /**
   * Optional configuration for the memory recorder agent.
   * Controls how memories are recorded to the file system.
   */
  recorderOptions?: FSMemoryRecorderOptions;
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

    const skills = [
      ...new FilesystemAgent({ rootDir }).skills,
      ...(options.skills ?? []),
      function currentTime() {
        return { currentTime: new Date().toISOString() };
      },
    ];

    super({
      ...options,
      skills,
      autoUpdate: options.autoUpdate ?? true,
    });

    this.recorder =
      options.recorder ??
      new FSMemoryRecorder({
        ...options.recorderOptions,
        skills: [...skills, ...(options.recorderOptions?.skills ?? [])],
      });
    this.retriever =
      options.retriever ??
      new FSMemoryRetriever({
        ...options.retrieverOptions,
        skills: [...skills, ...(options.retrieverOptions?.skills ?? [])],
      });
  }
}

interface FSMemoryRetrieverOptions
  extends AIAgentOptions<FSMemoryRetrieverAgentInput, FSMemoryRetrieverAgentOutput> {}

interface FSMemoryRetrieverAgentInput extends MemoryRetrieverInput {}

interface FSMemoryRetrieverAgentOutput extends Message {
  memories: {
    filename: string;
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
              filename: z.string().describe("Filename of the memory"),
              content: z.string().describe("Content of the memory"),
            }),
          )
          .describe("List of memories"),
      }),
    });
  }

  agent: AIAgent<FSMemoryRetrieverAgentInput, FSMemoryRetrieverAgentOutput>;

  async process(input: MemoryRetrieverInput, context: Context): Promise<MemoryRetrieverOutput> {
    const { memories } = await context.invoke(this.agent, input);
    const result: Memory[] = memories.map((memory) => ({
      id: memory.filename,
      content: memory.content,
      createdAt: new Date().toISOString(),
    }));
    return { memories: result };
  }
}

interface FSMemoryRecorderOptions
  extends AIAgentOptions<FSMemoryRecorderAgentInput, FSMemoryRecorderAgentOutput> {}

type FSMemoryRecorderAgentInput = MemoryRecorderInput;

interface FSMemoryRecorderAgentOutput extends Message {
  memories: {
    filename: string;
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
              filename: z.string().describe("Filename of the memory"),
              content: z.string().describe("Content of the memory"),
            }),
          )
          .describe("List of memories"),
      }),
    });
  }

  agent: AIAgent<FSMemoryRecorderAgentInput, FSMemoryRecorderAgentOutput>;

  async process(input: MemoryRecorderInput, context: Context): Promise<MemoryRecorderOutput> {
    const { memories } = await context.invoke(this.agent, input);

    return {
      memories: memories.map((i) => ({
        id: i.filename,
        content: i.content,
        createdAt: new Date().toISOString(),
      })),
    };
  }
}

const DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS = `You perform file system operations to manage memory files based on conversation analysis.

## FIRST: Determine If Memory Updates Needed
- BEFORE any file operations, analyze if the conversation contains ANY information worth remembering
- Examples of content NOT worth storing:
  * General questions ("What's the weather?", "How do I do X?")
  * Greetings and small talk ("Hello", "How are you?", "Thanks")
  * System instructions or commands ("Show me", "Find", "Save")
  * General facts not specific to the user
  * Duplicate information already stored
- If conversation lacks meaningful personal information to store:
  * IMMEDIATELY return { "memories": [] } without ANY file operations
  * DO NOT call readDir() or perform any other operations

## Your Workflow (ONLY if memory updates needed):
1. Call readDir(".") EXACTLY ONCE to list existing files
2. Extract key topics from the conversation
3. DECIDE whether to create/update/delete files based on the conversation
4. DIRECTLY PERFORM file operations - DO NOT return memory content

## Required File Operations:
- CREATE: Use writeFile("category_topic.txt", formatted_content) for new topics
- UPDATE: Use readFile() to check existing content, then writeFile() ONLY if substantially different
- DELETE: Use rm() for obsolete information

## File Naming:
- Format: "category_topic.txt" (e.g., "preference_color.txt")
- Categories: preference_*, personal_*, fact_*, plan_*, concept_*

## Content Format:
\`\`\`
---
created: [current_time()]
updated: [current_time()]
---

[Memory content]
\`\`\`

## Operation Decision Rules:
- CREATE only for truly new topics not covered in any existing file
- UPDATE only when new information is meaningfully different
- NEVER update for just rephrasing or minor differences
- DELETE only when information becomes obsolete

## IMPORTANT: Your job is to perform file operations, not return memory content.
After performing operations, JUST report which operations you performed.

## Conversation:
{{content}}`;

const DEFAULT_FS_MEMORY_RETRIEVER_INSTRUCTIONS = `You retrieve only the most relevant memory files for the current conversation.

## Process - DO ONLY ONCE:
1. Call readDir(".") EXACTLY ONCE at the beginning
2. Extract key topics from conversation
3. Match filenames against these topics - DO NOT READ ANY FILES YET
4. Select MAX 3 files with DIRECT topic matches
5. ONLY THEN read those specific files

## Filename Matching Rules:
- MUST have exact topic match (e.g., "color" in conversation → "preference_color.txt")
- IGNORE files with no clear topic alignment
- Category alone is NOT enough for relevance
- NO browsing or exploration - only precise matches

## Response:
- Return up to 3 most relevant memories
- Return empty array if no clear matches
- Format: { "memories": [{"filename": "...", "content": "..."}] }

## Search Query:
<search>
{{search}}
</search>
`;
