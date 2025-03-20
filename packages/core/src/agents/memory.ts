import type { Context } from "../execution-engine/context.js";
import { orArrayToArray } from "../utils/type-utils.js";
import type { Message } from "./agent.js";

export interface AgentMemoryOptions {
  /**
   * Enable memory, default is true
   */
  enable?: boolean;

  subscribeTopic?: string | string[];

  maxMemoriesInChat?: number;
}

export interface Memory {
  role: "user" | "agent";
  content: Message;
  source?: string;
}

export class AgentMemory {
  constructor(options: AgentMemoryOptions) {
    this.enable = options.enable ?? true;
    this.subscribeTopic = options.subscribeTopic;
    this.maxMemoriesInChat = options.maxMemoriesInChat;
  }

  enable?: boolean;

  subscribeTopic?: string | string[];

  maxMemoriesInChat?: number;

  memories: Memory[] = [];

  addMemory(memory: Memory) {
    this.memories.push(memory);
  }

  attach(context: Context) {
    for (const topic of orArrayToArray(this.subscribeTopic)) {
      context.subscribe(topic, ({ role, message, source }) => {
        this.addMemory({ role, source, content: message });
      });
    }
  }
}
