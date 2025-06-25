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
} from "@aigne/core";
import { isRecord, pick } from "@aigne/core/utils/type-utils.js";
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
  messageKey?: string | string[];
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
          rememberFromMessageKey:
            options.recorderOptions?.rememberFromMessageKey ?? options.messageKey,
          storage,
        }),
      retriever:
        options.retriever ??
        new DefaultMemoryRetriever({
          ...options.retrieverOptions,
          retrieveFromMessageKey:
            options.retrieverOptions?.retrieveFromMessageKey ?? options.messageKey,
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
  retrieveFromMessageKey?: string | string[];
  getSearchPattern?: DefaultMemoryRetriever["getSearchPattern"];
  formatMessage?: DefaultMemoryRetriever["formatMessage"];
  formatMemory?: DefaultMemoryRetriever["formatMemory"];
}

class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(options: DefaultMemoryRetrieverOptions) {
    super(options);
    this.storage = options.storage;
    this.defaultRetrieveMemoryCount = options.defaultRetrieveMemoryCount;
    this.retrieveFromMessageKey = options.retrieveFromMessageKey;
    if (options.getSearchPattern) this.getSearchPattern = options.getSearchPattern;
    if (options.formatMessage) this.formatMessage = options.formatMessage;
    if (options.formatMemory) this.formatMemory = options.formatMemory;
  }

  private storage: MemoryStorage;

  private defaultRetrieveMemoryCount?: number;

  private retrieveFromMessageKey?: string | string[];

  private getSearchPattern = (search: MemoryRetrieverInput["search"]): string | undefined => {
    if (!search || typeof search === "string") return search;

    const obj =
      search && this.retrieveFromMessageKey ? pick(search, this.retrieveFromMessageKey) : search;

    return Object.values(obj)
      .map((v) => (typeof v === "string" ? v : undefined))
      .join("\n");
  };

  private formatMessage = (content: unknown): unknown => {
    if (!this.retrieveFromMessageKey || !isRecord(content)) return content;

    const obj = pick(content, this.retrieveFromMessageKey);

    return Object.values(obj)
      .map((v) => (typeof v === "string" ? v : undefined))
      .join("\n");
  };

  private formatMemory = (content: unknown): unknown => {
    if (!isRecord(content)) return content;
    if ("input" in content || "output" in content) {
      return {
        user: this.formatMessage(content.input),
        agent: this.formatMessage(content.output),
      };
    }
  };

  async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    const { result } = await this.storage.search(
      {
        ...input,
        search: this.getSearchPattern(input.search),
        limit: input.limit ?? this.defaultRetrieveMemoryCount ?? DEFAULT_RETRIEVE_MEMORY_COUNT,
      },
      options,
    );
    return { memories: result.map((i) => ({ ...i, content: this.formatMemory(i.content) })) };
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
            input:
              item.input && this.rememberFromMessageKey
                ? pick(item.input, this.rememberFromMessageKey)
                : item.input,
            output:
              item.output && this.rememberFromMessageKey
                ? pick(item.output, this.rememberFromMessageKey)
                : item.output,
            source: item.source,
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
}
