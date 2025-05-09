import { v7 } from "uuid";
import { type ZodType, z } from "zod";
import { Agent, type AgentOptions, type Message } from "../agents/agent.js";
import type { Context } from "../aigne/context.js";
import type { MessagePayload } from "../aigne/message-queue.js";
import { checkArguments, remove } from "../utils/type-utils.js";
import type { MemoryRecorder, MemoryRecorderInput, MemoryRecorderOutput } from "./recorder.js";
import type { MemoryRetriever, MemoryRetrieverInput, MemoryRetrieverOutput } from "./retriever.js";

export interface Memory {
  id: string;
  content: unknown;
  createdAt: string;
}

export const newMemoryId = () => v7();

export interface MemoryAgentOptions
  extends Partial<Pick<MemoryAgent, "recorder" | "retriever" | "autoUpdate">>,
    Pick<AgentOptions, "subscribeTopic" | "skills"> {}

export class MemoryAgent extends Agent {
  constructor(options: MemoryAgentOptions) {
    checkArguments("MemoryAgent", memoryAgentOptionsSchema, options);
    super({
      subscribeTopic: options.subscribeTopic,
      skills: options.skills,
    });

    this.subscribeTopic = options.subscribeTopic;
    this.recorder = options.recorder;
    this.retriever = options.retriever;
    this.autoUpdate = options.autoUpdate;
  }

  subscribeTopic?: string | string[];

  private _retriever?: MemoryRetriever;

  /**
   * Agent used for retrieving memories
   */
  get retriever(): MemoryRetriever | undefined {
    return this._retriever;
  }

  set retriever(value: MemoryRetriever | undefined) {
    if (this._retriever) remove(this.skills, [this._retriever]);

    this._retriever = value;
    if (value) this.skills.push(value);
  }

  private _recorder?: MemoryRecorder;

  /**
   * Agent used for recording new memories
   */
  get recorder(): MemoryRecorder | undefined {
    return this._recorder;
  }

  set recorder(value: MemoryRecorder | undefined) {
    if (this._recorder) remove(this.skills, [this._recorder]);

    this._recorder = value;
    if (value) this.skills.push(value);
  }

  /**
   * Whether to automatically update the memory when agent call completes
   */
  autoUpdate?: boolean;

  get isCallable(): boolean {
    return false;
  }

  async process(_input: Message, _context: Context): Promise<Message> {
    throw new Error("Method not implemented.");
  }

  async retrieve(input: MemoryRetrieverInput, context: Context): Promise<MemoryRetrieverOutput> {
    if (!this.retriever) throw new Error("MemoryAgent retriever no initialized");
    return context.invoke(this.retriever, input);
  }

  async record(input: MemoryRecorderInput, context: Context): Promise<MemoryRecorderOutput> {
    if (!this.recorder) throw new Error("MemoryAgent recorder no initialized");
    return context.invoke(this.recorder, input);
  }

  override async onMessage({ role, source, message, context }: MessagePayload): Promise<void> {
    this.record({ content: [{ role, source, content: message }] }, context);
  }
}

const memoryAgentOptionsSchema: ZodType<MemoryAgentOptions> = z.object({
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  retriever: z.custom<MemoryRetriever>(),
  recorder: z.custom<MemoryRecorder>(),
  autoUpdate: z.boolean().optional(),
});
