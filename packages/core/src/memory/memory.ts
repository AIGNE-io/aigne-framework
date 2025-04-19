import { type ZodType, z } from "zod";
import type { Message } from "../agents/agent.js";
import type { Context } from "../execution-engine/context.js";
import type { Unsubscribe } from "../execution-engine/message-queue.js";
import { checkArguments, orArrayToArray } from "../utils/type-utils.js";
import type { MemoryRecorder, MemoryRecorderInput, MemoryRecorderOutput } from "./recorder.js";
import type { MemoryRetriever, MemoryRetrieverInput, MemoryRetrieverOutput } from "./retriever.js";

export interface AgentMemoryOptions {
  subscribeTopic?: string | string[];

  /**
   * Agent used for retrieving memories
   */
  retriever?: MemoryRetriever;

  /**
   * Agent used for recording new memories
   */
  recorder?: MemoryRecorder;
}

export interface Memory {
  role: "user" | "agent";
  content: Message;
  source?: string;
}

export class AgentMemory {
  constructor(options: AgentMemoryOptions) {
    checkArguments("AgentMemory", agentMemoryOptionsSchema, options);

    this.subscribeTopic = options.subscribeTopic;
    this.recorder = options.recorder;
    this.retriever = options.retriever;
  }

  subscribeTopic?: string | string[];

  subscriptions: Unsubscribe[] = [];

  retriever?: MemoryRetriever;

  recorder?: MemoryRecorder;

  async retrieve(
    input: MemoryRetrieverInput,
    context: Context,
  ): Promise<MemoryRetrieverOutput | undefined> {
    if (!this.retriever) return undefined;

    return context.call(this.retriever, input);
  }

  async record(
    input: MemoryRecorderInput | Memory | Memory[],
    context: Context,
  ): Promise<MemoryRecorderOutput | undefined> {
    if (!this.recorder) return undefined;

    const i: MemoryRecorderInput = Array.isArray(input)
      ? { messages: input }
      : isMemoryRecordInput(input)
        ? input
        : { messages: [input] };

    return context.call(this.recorder, i);
  }

  attach(context: Pick<Context, "subscribe">) {
    for (const topic of orArrayToArray(this.subscribeTopic)) {
      const sub = context.subscribe(topic, ({ role, message, source, context }) => {
        this.record({ role, source, content: message }, context);
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

const agentMemoryOptionsSchema: ZodType<AgentMemoryOptions> = z.object({
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  retriever: z.any().optional(),
  recorder: z.any().optional(),
});

function isMemoryRecordInput(
  input: MemoryRecorderInput | Memory | Memory[],
): input is MemoryRecorderInput {
  return Array.isArray((input as MemoryRecorderInput).messages);
}
