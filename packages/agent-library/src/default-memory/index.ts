import {
  type AgentInvokeOptions,
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
import equal from "fast-deep-equal";
import {
  DefaultMemoryStorage,
  type DefaultMemoryStorageOptions,
} from "./default-memory-storage/index.js";
import { MemoryStorage } from "./storage.js";

const DEFAULT_RETRIEVE_MEMORY_COUNT = 10;

export interface DefaultMemoryOptions extends Partial<MemoryAgentOptions> {
  storage?: MemoryStorage | DefaultMemoryStorageOptions;
}

export class DefaultMemory extends MemoryAgent {
  constructor(options: DefaultMemoryOptions = {}) {
    super({
      ...options,
      autoUpdate: options.autoUpdate ?? true,
    });

    this.storage =
      options.storage instanceof MemoryStorage
        ? options.storage
        : new DefaultMemoryStorage(options.storage);

    if (!this.recorder) this.recorder = new DefaultMemoryRecorder(this);
    if (!this.retriever) this.retriever = new DefaultMemoryRetriever(this);
  }

  storage: MemoryStorage;
}

class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(public readonly memory: DefaultMemory) {
    super({});
  }

  async process(
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRetrieverOutput> {
    const { result } = await this.memory.storage.search(
      { ...input, limit: input.limit ?? DEFAULT_RETRIEVE_MEMORY_COUNT },
      options,
    );
    return { memories: result };
  }
}

class DefaultMemoryRecorder extends MemoryRecorder {
  constructor(public readonly memory: DefaultMemory) {
    super({});
  }

  async process(
    input: MemoryRecorderInput,
    options: AgentInvokeOptions,
  ): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const content of input.content) {
      const {
        result: [last],
      } = await this.memory.storage.search({ limit: 1 }, options);
      if (!equal(last?.content, content)) {
        const { result } = await this.memory.storage.create({ content }, options);
        newMemories.push(result);
      }
    }

    return {
      memories: newMemories,
    };
  }
}
