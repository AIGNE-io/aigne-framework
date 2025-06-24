import {
  type AgentInvokeOptions,
  type AgentOptions,
  type Memory,
  MemoryAgent,
  type MemoryAgentOptions,
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  type Message,
} from "@aigne/core";
import {
  DefaultMemoryStorage,
  type DefaultMemoryStorageOptions,
} from "./default-memory-storage/index.js";
import { MemoryStorage } from "./storage.js";

const DEFAULT_RETRIEVE_MEMORY_COUNT = 10;

export interface DefaultMemoryOptions extends Partial<MemoryAgentOptions> {
  storage?: MemoryStorage | DefaultMemoryStorageOptions;
  recorderOptions?: Omit<DefaultMemoryRecorderOptions, "storage">;
  retrieverOptions?: Omit<DefaultMemoryRetrieverOptions, "storage">;
}

export class DefaultMemory extends MemoryAgent {
  constructor(options: DefaultMemoryOptions = {}) {
    const storage =
      options.storage instanceof MemoryStorage
        ? options.storage
        : new DefaultMemoryStorage(options.storage);

    super({
      ...options,
      recorder:
        options.recorder ??
        new DefaultMemoryRecorder({
          ...options.recorderOptions,
          storage,
        }),
      retriever:
        options.retriever ??
        new DefaultMemoryRetriever({
          ...options.retrieverOptions,
          storage,
        }),
      autoUpdate: options.autoUpdate ?? true,
    });

    this.storage = storage;
  }

  storage: MemoryStorage;
}

export interface DefaultMemoryRetrieverOptions
  extends AgentOptions<MemoryRetrieverInput, MemoryRetrieverOutput> {
  storage: MemoryStorage;
  defaultRetrieveMemoryCount?: number;
}

class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(options: DefaultMemoryRetrieverOptions) {
    super(options);
    this.storage = options.storage;
    this.defaultRetrieveMemoryCount = options.defaultRetrieveMemoryCount;
  }

  private storage: MemoryStorage;

  private defaultRetrieveMemoryCount?: number;

  async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    const { result } = await this.storage.search(
      {
        ...input,
        limit: input.limit ?? this.defaultRetrieveMemoryCount ?? DEFAULT_RETRIEVE_MEMORY_COUNT,
      },
      options,
    );
    return { memories: result };
  }
}

export interface DefaultMemoryRecorderOptions
  extends AgentOptions<MemoryRecorderInput, MemoryRecorderOutput> {
  storage: MemoryStorage;
  rememberFromMessageKey?: string | string[];
}

class DefaultMemoryRecorder extends MemoryRecorder {
  constructor(options: DefaultMemoryRecorderOptions) {
    super(options);
    this.storage = options.storage;
    this.rememberFromMessageKey = options.rememberFromMessageKey;
  }

  private storage: MemoryStorage;

  private rememberFromMessageKey?: string | string[];

  async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const item of input.content) {
      const { result } = await this.storage.create(
        {
          content: {
            ...item,
            content: this.processMemoryInput(item.content),
          },
        },
        options,
      );
      newMemories.push(result);
    }

    return {
      memories: newMemories,
    };
  }

  private processMemoryInput(content: Message) {
    const keys = Array.isArray(this.rememberFromMessageKey)
      ? this.rememberFromMessageKey
      : this.rememberFromMessageKey
        ? [this.rememberFromMessageKey]
        : [];
    if (!keys.length) return content;

    return Object.entries(content)
      .filter(([key]) => keys.includes(key))
      .map(([_, value]) => (typeof value === "string" ? value : JSON.stringify(value)))
      .join("\n");
  }
}
