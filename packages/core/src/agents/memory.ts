import type { Context } from "../execution-engine/context.js";
import type { Unsubscribe } from "../execution-engine/message-queue.js";
import { orArrayToArray } from "../utils/type-utils.js";
import type { Message } from "./agent.js";

export interface AgentMemoryOptions {
  /**
   * Enable memory, default is true
   */
  enabled?: boolean;

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
    this.enabled = options.enabled ?? true;
    this.subscribeTopic = options.subscribeTopic;
    this.maxMemoriesInChat = options.maxMemoriesInChat;
  }

  enabled?: boolean;

  subscribeTopic?: string | string[];

  maxMemoriesInChat?: number;

  memories: Memory[] = [];

  private subscriptions: Unsubscribe[] = [];

  addMemory(memory: Memory) {
    if (this.memories.at(-1)?.content === memory.content) return;
    // TODO: save all memories into database instead of in-memory
    this.memories.push(memory);
  }

  attach(context: Context) {
    for (const topic of orArrayToArray(this.subscribeTopic)) {
      const sub = context.subscribe(topic, ({ role, message, source }) => {
        this.addMemory({ role, source, content: message });
      });

      this.subscriptions.push(sub);
    }
  }

  detach() {
    for (const sub of this.subscriptions) {
      sub();
    }
    this.subscriptions = [];
  }
}
