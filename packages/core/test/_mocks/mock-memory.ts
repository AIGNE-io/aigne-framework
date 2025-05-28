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
} from "@aigne/core";
import equal from "fast-deep-equal";
import { v7 } from "uuid";

export interface MockMemoryOptions extends Partial<MemoryAgentOptions> {}

export class MockMemory extends MemoryAgent {
  constructor(options: MockMemoryOptions = {}) {
    super({
      ...options,
      autoUpdate: options.autoUpdate ?? true,
    });

    if (!this.recorder) this.recorder = new DefaultMemoryRecorder(this);
    if (!this.retriever) this.retriever = new DefaultMemoryRetriever(this);
  }

  storage: Memory[] = [];
}

class DefaultMemoryRetriever extends MemoryRetriever {
  constructor(public readonly memory: MockMemory) {
    super({});
  }

  async process(input: MemoryRetrieverInput): Promise<MemoryRetrieverOutput> {
    const memories = this.memory.storage.slice(-(input.limit || this.memory.storage.length));
    return { memories };
  }
}

class DefaultMemoryRecorder extends MemoryRecorder {
  constructor(public readonly memory: MockMemory) {
    super({});
  }

  async process(input: MemoryRecorderInput): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const content of input.content) {
      const last = this.memory.storage.at(-1);
      if (!equal(last?.content, content)) {
        const memory: Memory = { id: v7(), content, createdAt: new Date().toISOString() };
        this.memory.storage.push(memory);
        newMemories.push(memory);
      }
    }

    return {
      memories: newMemories,
    };
  }
}
