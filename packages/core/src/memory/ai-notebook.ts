import { mkdirSync } from "node:fs";
import { readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { z } from "zod";
import { Agent, type AgentOptions, FunctionAgent, type Message } from "../agents/agent.js";
import { AIAgent, type AIAgentOptions } from "../agents/ai-agent.js";
import type { Context } from "../aigne/context.js";
import { type Memory, MemoryAgent, type MemoryAgentOptions } from "./memory.js";
import { MemoryRecorder, type MemoryRecorderInput, type MemoryRecorderOutput } from "./recorder.js";
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
} from "./retriever.js";

export interface AINotebookOptions extends Partial<MemoryAgentOptions> {
  rootDir: string;
  retrieverOptions?: AINotebookRetrieverOptions;
  recorderOptions?: AINotebookRecorderOptions;
}

export class AINotebook extends MemoryAgent {
  constructor(options: AINotebookOptions) {
    let rootDir = normalize(expandHome(options.rootDir));
    rootDir = isAbsolute(rootDir) ? rootDir : resolve(process.cwd(), rootDir);
    mkdirSync(rootDir, { recursive: true });

    const skills = [...new FilesystemAgent({ rootDir }).skills, ...(options.skills ?? [])];

    super({
      ...options,
      skills,
      autoUpdate: options.autoUpdate ?? true,
    });

    this.recorder =
      options.recorder ??
      new AINotebookRecorder({
        ...options.recorderOptions,
        skills: [...skills, ...(options.recorderOptions?.skills ?? [])],
      });
    this.retriever =
      options.retriever ??
      new AINotebookRetriever({
        ...options.retrieverOptions,
        skills: [...skills, ...(options.retrieverOptions?.skills ?? [])],
      });
  }
}

interface AINotebookRetrieverOptions
  extends AIAgentOptions<AINotebookRetrieverAgentInput, AINotebookRetrieverAgentOutput> {}

interface AINotebookRetrieverAgentInput extends MemoryRetrieverInput {}

interface AINotebookRetrieverAgentOutput extends Message {
  memories: {
    filename: string;
    content: string;
  }[];
}

class AINotebookRetriever extends MemoryRetriever {
  constructor(public readonly options: AINotebookRetrieverOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "AI_Notebook_Retriever",
      description: "Retrieves memories from the AI notebook.",
      ...options,
      instructions: options.instructions || DEFAULT_AI_NOTEBOOK_RETRIEVER_INSTRUCTIONS,
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

  agent: AIAgent<AINotebookRetrieverAgentInput, AINotebookRetrieverAgentOutput>;

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

interface AINotebookRecorderOptions
  extends AIAgentOptions<AINotebookRecorderAgentInput, AINotebookRecorderAgentOutput> {}

type AINotebookRecorderAgentInput = MemoryRecorderInput;

interface AINotebookRecorderAgentOutput extends Message {
  memories: {
    filename: string;
    content: string;
  }[];
}

class AINotebookRecorder extends MemoryRecorder {
  constructor(public readonly options: AINotebookRecorderOptions) {
    super({});
    this.agent = AIAgent.from({
      name: "AI_Notebook_Recorder",
      description: "Records memories in files by AI agent",
      ...options,
      instructions: options.instructions || DEFAULT_AI_NOTEBOOK_RECORDER_INSTRUCTIONS,
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

  agent: AIAgent<AINotebookRecorderAgentInput, AINotebookRecorderAgentOutput>;

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

const DEFAULT_AI_NOTEBOOK_RECORDER_INSTRUCTIONS = `\
You are a Memory Management System responsible for creating, updating, and maintaining structured memory files based on conversations. Your role is to detect important information and manage memory files accordingly.

## Process:

1. Use readDir(".") to list existing memory files
2. Analyze the conversation to extract new information
3. Decide whether to:
   - Create new files for new information
   - Update existing files with additional information
   - Delete outdated files when appropriate

## File Organization:

- Create focused memory files with descriptive names (e.g., "preference_food_20230615.txt")
- Use categories and dates in filenames to aid future retrieval
- Keep content concise and factual

## Information Categories:

- Personal Preferences (food, entertainment, products)
- Personal Details (names, relationships, dates)
- Plans & Intentions (events, trips, goals)
- Service Preferences (dining, travel, hobbies)
- Health Information (dietary restrictions, fitness)
- Professional Details (job, career goals)
- General Information (books, movies, interests)

## Implementation Steps:

1. Use readDir(".") to see existing files
2. Carefully analyze if the conversation contains ANY significant information worth recording
3. If no valuable information is found, return an empty memories array: { "memories": [] }
4. For new worthwhile information, create appropriate files with writeFile
5. For updates to existing information, first read file with readFile, then update with writeFile
6. For obsolete information, remove files with rm
7. Avoid recording trivial, temporary, or low-value information
8. Maintain the original language of the conversation
9. Return the created or updated memory files in the required format

## Conversation:

{{content}}
`;

const DEFAULT_AI_NOTEBOOK_RETRIEVER_INSTRUCTIONS = `\
You are a Memory Retrieval Specialist designed to efficiently search through stored memories. Your goal is to find the most relevant information based on user queries while being resource-efficient.

## Process:

1. Use readDir to list all files in the specified directory
2. Analyze file names to identify potentially relevant files based on the search query
   - Look for dates, keywords, categories in filenames
   - If no search query is provided, select recent files or ones with general importance
3. Read ONLY the selected relevant files using readFile
4. Match the search query against the content of the files you've read
5. Return relevant memories in the required format

## Response Format:

Return a JSON object with a "memories" key containing an array of memory objects:
{
  "memories": [
    {
      "filename": "preference_food_20230615.txt",
      "content": "The user prefers vegetarian food and particularly enjoys Italian cuisine."
    }
  ]
}

If no memories are found, return: { "memories": [] }

Important:
- Only read files that are likely relevant based on their filenames
- Track which files you've already read to avoid reading the same file multiple times
- Prioritize by relevance if a limit is specified
- Preserve the original language of memories
- Return complete memory entries, not fragments

## Search Query

<search>
{{search}}
</search>
`;

export interface FilesystemAgentOptions extends AgentOptions {
  rootDir: string;
}

export class FilesystemAgent extends Agent {
  constructor({ rootDir, ...options }: FilesystemAgentOptions) {
    super({
      ...options,
      skills: [
        ...(options.skills ?? []),
        FunctionAgent.from({
          name: "readDir",
          description: "Read a directory and return the list of files",
          inputSchema: z.object({
            path: z.string().describe("Path to the directory, use . or / for current directory"),
          }),
          outputSchema: z.object({
            result: z
              .array(
                z.object({
                  path: z.string().describe("Path to the file"),
                  type: z.enum(["file", "directory"]).describe("Type of the file"),
                }),
              )
              .describe("List all files in the directory recursively, including subdirectories"),
          }),
          process: async ({ path }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            const files = await readdir(p, { recursive: true, withFileTypes: true });
            return {
              result: files.map((i) => ({
                path: relative(rootDir, join(i.parentPath, i.name)),
                type: i.isDirectory() ? "directory" : "file",
              })),
            };
          },
        }),
        FunctionAgent.from({
          name: "readFile",
          description: "Read a file and return its content",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
          }),
          outputSchema: z.object({
            result: z.string().describe("Content of the file"),
          }),
          process: async ({ path }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            const content = await readFile(p, "utf-8");
            return { result: content };
          },
        }),
        FunctionAgent.from({
          name: "writeFile",
          description: "Write content to a file",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
            content: z.string().describe("Content to write to the file"),
          }),
          outputSchema: z.object({
            result: z.string().describe("Confirmation message"),
          }),
          process: async ({ path, content }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            await writeFile(p, content);
            return { result: `File ${path} written successfully` };
          },
        }),
        FunctionAgent.from({
          name: "rm",
          description: "Delete a file or directory",
          inputSchema: z.object({
            path: z.string().describe("Path to the file"),
            recursive: z.boolean().optional().default(false).describe("Delete recursively"),
          }),
          outputSchema: z.object({
            result: z.string().describe("Confirmation message"),
          }),
          process: async ({ path, recursive }) => {
            const p = join(rootDir, path);
            await validatePath(p, [rootDir]);

            await rm(p, { recursive, force: true });
            return { result: `File ${path} deleted successfully` };
          },
        }),
      ],
    });
  }

  get isCallable(): boolean {
    return false;
  }

  async process(_input: Message, _context: Context): Promise<Message> {
    throw new Error("Not implemented");
  }
}

function expandHome(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return join(homedir(), filepath.slice(1));
  }
  return filepath;
}

async function validatePath(requestedPath: string, allowedDirs: string[]): Promise<string> {
  const allowedDirectories = allowedDirs.map((dir) => normalize(resolve(expandHome(dir))));

  const expandedPath = expandHome(requestedPath);
  const absolute = isAbsolute(expandedPath)
    ? resolve(expandedPath)
    : resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalize(absolute);

  // Check if path is within allowed directories
  const isAllowed = allowedDirectories.some((dir) => normalizedRequested.startsWith(dir));
  if (!isAllowed) {
    throw new Error(
      `Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(", ")}`,
    );
  }

  // Handle symlinks by checking their real path
  try {
    const realPath = await realpath(absolute);
    const normalizedReal = normalize(realPath);
    const isRealPathAllowed = allowedDirectories.some((dir) => normalizedReal.startsWith(dir));
    if (!isRealPathAllowed) {
      throw new Error("Access denied - symlink target outside allowed directories");
    }
    return realPath;
  } catch {
    // For new files that don't exist yet, verify parent directory
    const parentDir = dirname(absolute);
    try {
      const realParentPath = await realpath(parentDir);
      const normalizedParent = normalize(realParentPath);
      const isParentAllowed = allowedDirectories.some((dir) => normalizedParent.startsWith(dir));
      if (!isParentAllowed) {
        throw new Error("Access denied - parent directory outside allowed directories");
      }
      return absolute;
    } catch {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
}
