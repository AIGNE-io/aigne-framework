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
import { flat, isRecord, pick } from "@aigne/core/utils/type-utils.js";
import {
  DefaultMemoryStorage,
  type DefaultMemoryStorageOptions,
} from "./default-memory-storage/index.js";
import { MemoryStorage } from "./storage.js";

const DEFAULT_RETRIEVE_MEMORY_COUNT = 10;

export interface DefaultMemoryOptions
  extends Partial<MemoryAgentOptions>,
    Omit<DefaultMemoryRecorderOptions, "storage" | keyof AgentOptions>,
    Omit<DefaultMemoryRetrieverOptions, "storage" | keyof AgentOptions> {
  storage?: MemoryStorage | DefaultMemoryStorageOptions;
}

export class DefaultMemory extends MemoryAgent {
  constructor(options: DefaultMemoryOptions = {}) {
    const storage =
      options.storage instanceof MemoryStorage
        ? options.storage
        : new DefaultMemoryStorage(options.storage);

    super({
      ...options,
      recorder: options.recorder ?? new DefaultMemoryRecorder({ ...options, storage }),
      retriever:
        options.retriever ??
        new DefaultMemoryRetriever({
          ...options,
          retrieveRecentMemoryCount:
            options.retrieveRecentMemoryCount ??
            Math.ceil(options.retrieveMemoryCount ?? DEFAULT_RETRIEVE_MEMORY_COUNT) / 2,
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
  retrieveMemoryCount?: number;
  retrieveRecentMemoryCount?: number;
  inputKey?: string | string[];
  outputKey?: string | string[];
  getSearchPattern?: DefaultMemoryRetriever["getSearchPattern"];
  formatMessage?: DefaultMemoryRetriever["formatMessage"];
  formatMemory?: DefaultMemoryRetriever["formatMemory"];
}

export class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(options: DefaultMemoryRetrieverOptions) {
    super(options);
    this.storage = options.storage;
    this.retrieveMemoryCount = options.retrieveMemoryCount;
    this.retrieveRecentMemoryCount = options.retrieveRecentMemoryCount;
    this.inputKey = flat(options.inputKey);
    this.outputKey = flat(options.outputKey);
    if (options.getSearchPattern) this.getSearchPattern = options.getSearchPattern;
    if (options.formatMessage) this.formatMessage = options.formatMessage;
    if (options.formatMemory) this.formatMemory = options.formatMemory;
  }

  private storage: MemoryStorage;

  private retrieveMemoryCount?: number;

  private retrieveRecentMemoryCount?: number;

  private inputKey?: string[];

  private outputKey?: string[];

  private getSearchPattern = (search: MemoryRetrieverInput["search"]): string | undefined => {
    if (!search || typeof search === "string") return search;

    const obj = search && this.inputKey ? pick(search, this.inputKey) : search;

    return Object.values(obj)
      .map((v) => (typeof v === "string" ? v : undefined))
      .join("\n");
  };

  private formatMessage = (content: unknown, key?: string[]): unknown => {
    if (!isRecord(content)) return content;

    const obj = !key?.length ? content : pick(content, key);

    return Object.values(obj)
      .map((v) => (typeof v === "string" ? v : undefined))
      .join("\n");
  };

  private formatMemory = (content: unknown): unknown => {
    if (isRecord(content) && "input" in content && "output" in content) {
      return {
        input: this.formatMessage(content.input, this.inputKey),
        output: this.formatMessage(content.output, this.outputKey),
        source: content.source,
      };
    }

    return content;
  };

  override async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    const limit = input.limit ?? this.retrieveMemoryCount ?? DEFAULT_RETRIEVE_MEMORY_COUNT;
    const search = this.getSearchPattern(input.search);
    const recentLimit = this.retrieveRecentMemoryCount;

    const [recent, related] = await Promise.all([
      // Query latest messages
      !recentLimit
        ? <Memory[]>[]
        : this.storage
            .search({ limit: recentLimit, orderBy: ["createdAt", "desc"] }, options)
            .then(({ result }) => result.reverse()),
      // Query related messages
      !input.search
        ? <Memory[]>[]
        : this.storage.search({ ...input, search, limit }, options).then(({ result }) => result),
    ]);

    const recentSet = new Set(recent.map((i) => i.id));
    const memories = related
      // Filter out recent memories from related results
      .filter((i) => !recentSet.has(i.id))
      .concat(recent)
      .slice(-limit);

    return {
      memories: memories.map((i) => ({
        ...i,
        content: this.formatMemory(i.content),
      })),
    };
  }
}

export interface DefaultMemoryRecorderOptions
  extends AgentOptions<MemoryRecorderInput, MemoryRecorderOutput> {
  storage: MemoryStorage;
  inputKey?: string | string[];
  outputKey?: string | string[];
}

export class DefaultMemoryRecorder extends MemoryRecorder {
  constructor(options: DefaultMemoryRecorderOptions) {
    super(options);
    this.storage = options.storage;
    this.inputKey = flat(options.inputKey);
    this.outputKey = flat(options.outputKey);
  }

  private storage: MemoryStorage;

  private inputKey?: string[];

  private outputKey?: string[];

  override async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const item of input.content) {
      const { result } = await this.storage.create(
        {
          content: {
            input:
              item.input && this.inputKey?.length ? pick(item.input, this.inputKey) : item.input,
            output:
              item.output && this.outputKey?.length
                ? pick(item.output, this.outputKey)
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
