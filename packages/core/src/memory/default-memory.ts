import equal from "fast-deep-equal";
import { type Memory, MemoryAgent, type MemoryAgentOptions, newMemoryId } from "./memory.js";
import { MemoryRecorder, type MemoryRecorderInput, type MemoryRecorderOutput } from "./recorder.js";
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
} from "./retriever.js";

export const DEFAULT_MAX_MEMORY_COUNT = 10;

export interface DefaultMemoryOptions extends Partial<MemoryAgentOptions> {}

export class DefaultMemory extends MemoryAgent {
  constructor(options: DefaultMemoryOptions = {}) {
    super({
      ...options,
      autoUpdate: options.autoUpdate ?? true,
    });

    if (!this.recorder) this.recorder = new DefaultMemoryRecorder(this);
    if (!this.retriever) this.retriever = new DefaultMemoryRetriever(this);
  }

  storage: Memory[] = [];

  async search(options: { limit?: number } = {}): Promise<{ result: Memory[] }> {
    const { limit = DEFAULT_MAX_MEMORY_COUNT } = options;
    const result = limit < 0 ? this.storage.slice(limit) : this.storage.slice(0, limit);
    return { result };
  }

  async create(memory: Pick<Memory, "content">): Promise<{ result: Memory }> {
    const m: Memory = {
      ...memory,
      id: newMemoryId(),
      createdAt: new Date().toISOString(),
    };
    this.storage.push(m);
    return { result: m };
  }
}

class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(public readonly memory: DefaultMemory) {
    super({});
  }

  async process(input: MemoryRetrieverInput): Promise<MemoryRetrieverOutput> {
    const { result } = await this.memory.search(input);
    return { memories: result };
  }
}

class DefaultMemoryRecorder extends MemoryRecorder {
  constructor(public readonly memory: DefaultMemory) {
    super({});
  }

  async process(input: MemoryRecorderInput): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const content of input.content) {
      const {
        result: [last],
      } = await this.memory.search({ limit: -1 });
      if (!equal(last?.content, content)) {
        const { result } = await this.memory.create({ content });
        newMemories.push(result);
      }
    }

    return {
      memories: newMemories,
    };
  }
}
