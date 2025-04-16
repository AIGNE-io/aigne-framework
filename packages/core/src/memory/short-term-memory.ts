import { AgentMemory, type AgentMemoryOptions, type Memory } from "./memory.js";
import { MemoryRecorder, type MemoryRecorderInput, type MemoryRecorderOutput } from "./recorder.js";
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
} from "./retriever.js";

export const DEFAULT_MAX_HISTORY_MESSAGES = 10;

export interface ShortTermMemoryOptions extends AgentMemoryOptions {
  maxMemoriesInChat?: number;
}

export class ShortTermMemory extends AgentMemory {
  constructor(options: ShortTermMemoryOptions) {
    const memories: Memory[] = [];

    super({
      ...options,
      recorder: options.recorder ?? new ShortTermMemoryRecorder({ memories }),
      retriever: options.retriever ?? new ShortTermMemoryRetriever({ memories }),
    });

    this.memories = memories;
  }

  memories: Memory[];
}

export class ShortTermMemoryRetriever extends MemoryRetriever {
  constructor(public readonly options: { memories: Memory[] }) {
    super({});
  }

  async process(input: MemoryRetrieverInput): Promise<MemoryRetrieverOutput> {
    const k = input.k ?? DEFAULT_MAX_HISTORY_MESSAGES;
    const memories = this.options.memories.slice(-k);
    return { memories };
  }
}

export class ShortTermMemoryRecorder extends MemoryRecorder {
  constructor(public readonly options: { memories: Memory[] }) {
    super({});
  }

  async process(input: MemoryRecorderInput): Promise<MemoryRecorderOutput> {
    const newMemories: Memory[] = [];

    for (const m of input.messages) {
      if (this.options.memories.at(-1)?.content === m.content) continue;
      // TODO: save all memories into database instead of in-memory,
      // and give every memory a unique id to avoid duplication
      this.options.memories.push(m);
      newMemories.push(m);
    }

    return {
      memories: newMemories,
    };
  }
}
