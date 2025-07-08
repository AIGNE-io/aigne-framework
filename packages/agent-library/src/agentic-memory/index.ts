import {
  type AgentInvokeOptions,
  type AgentOptions,
  AIAgent,
  type Memory,
  MemoryAgent,
  type MemoryAgentOptions,
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  type Message,
  type PromptBuilder,
} from "@aigne/core";
import { flat, pick } from "@aigne/core/utils/type-utils.js";
import { z } from "zod";
import {
  DefaultMemoryStorage,
  type DefaultMemoryStorageOptions,
} from "../default-memory/default-memory-storage/index.js";
import {
  DefaultMemoryRetriever,
  type DefaultMemoryRetrieverOptions,
} from "../default-memory/index.js";
import { MemoryStorage } from "../default-memory/storage.js";
import { DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS } from "./prompt.js";

export interface AgenticMemoryOptions
  extends Partial<MemoryAgentOptions>,
    Omit<AgenticMemoryRecorderOptions, "storage" | keyof AgentOptions>,
    Omit<AgenticMemoryRetrieverOptions, "storage" | keyof AgentOptions> {
  storage?: MemoryStorage | DefaultMemoryStorageOptions;
}

export class AgenticMemory extends MemoryAgent {
  constructor(options: AgenticMemoryOptions = {}) {
    const storage =
      options.storage instanceof MemoryStorage
        ? options.storage
        : new DefaultMemoryStorage(options.storage);

    super({
      ...options,
      recorder: options.recorder ?? new AgenticMemoryRecorder({ ...options, storage }),
      retriever: options.retriever ?? new AgenticMemoryRetriever({ ...options, storage }),
      autoUpdate: options.autoUpdate ?? true,
    });

    this.storage = storage;
  }

  storage: MemoryStorage;
}

export interface AgenticMemoryRetrieverOptions extends DefaultMemoryRetrieverOptions {}

export class AgenticMemoryRetriever extends DefaultMemoryRetriever {}

export interface AgenticMemoryRecorderOptions
  extends AgentOptions<MemoryRecorderInput, MemoryRecorderOutput> {
  storage: MemoryStorage;
  instructions?: string | PromptBuilder;
  agent?: AIAgent<AgenticMemoryExtractorInput, AgenticMemoryExtractorOutput>;
  inputKey?: string | string[];
  outputKey?: string | string[];
}

export interface AgenticMemoryExtractorInput extends Message {
  content: unknown;
}

export interface AgenticMemoryExtractorOutput extends Message {
  newMemories: {
    content: string;
  }[];
}

export class AgenticMemoryRecorder extends MemoryRecorder {
  constructor(options: AgenticMemoryRecorderOptions) {
    super(options);
    this.storage = options.storage;
    this.inputKey = flat(options.inputKey);
    this.outputKey = flat(options.outputKey);

    this.agent =
      options.agent ??
      AIAgent.from({
        name: "agentic_memory_extractor",
        description: "Records memories in files by AI agent",
        instructions: options.instructions || DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS,
        outputSchema: z.object({
          newMemories: z
            .array(
              z.object({
                content: z.string().describe("Content of the memory"),
              }),
            )
            .describe("Newly created memories"),
        }),
      });
  }

  private storage: MemoryStorage;

  private inputKey?: string[];

  private outputKey?: string[];

  private agent: AIAgent<AgenticMemoryExtractorInput, AgenticMemoryExtractorOutput>;

  override async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const agenticMemories = await options.context.invoke(this.agent, {
      content: input.content.map((item) => ({
        input: item.input && this.inputKey?.length ? pick(item.input, this.inputKey) : item.input,
        output:
          item.output && this.outputKey?.length ? pick(item.output, this.outputKey) : item.output,
        source: item.source,
      })),
    });

    const newMemories: Memory[] = [];

    for (const item of agenticMemories.newMemories) {
      const { result } = await this.storage.create({ content: item.content }, options);
      newMemories.push(result);
    }

    return {
      memories: newMemories,
    };
  }
}
