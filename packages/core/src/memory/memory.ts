import { v7 } from "uuid";
import { type ZodType, z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type Message,
} from "../agents/agent.js";
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

/**
 * A specialized agent responsible for managing, storing, and retrieving memories within the agent system.
 *
 * MemoryAgent serves as a bridge between application logic and memory storage/retrieval mechanisms.
 * It delegates the actual memory operations to specialized recorder and retriever agents that
 * are attached as skills. This agent doesn't directly process messages like other agents but
 * instead provides memory management capabilities to the system.
 */
export class MemoryAgent extends Agent {
  /**
   * Creates a new MemoryAgent instance.
   */
  constructor(options: MemoryAgentOptions) {
    checkArguments("MemoryAgent", memoryAgentOptionsSchema, options);
    super({
      subscribeTopic: options.subscribeTopic,
      skills: options.skills,
    });

    this.recorder = options.recorder;
    this.retriever = options.retriever;
    this.autoUpdate = options.autoUpdate;
  }

  private _retriever?: MemoryRetriever;

  /**
   * Agent used for retrieving memories from storage.
   *
   * This retriever is automatically added to the agent's skills when set.
   * Setting a new retriever will remove any previously set retriever from skills.
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
   * Agent used for recording and storing new memories.
   *
   * This recorder is automatically added to the agent's skills when set.
   * Setting a new recorder will remove any previously set recorder from skills.
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
   * Controls whether to automatically update the memory when agent call completes.
   *
   * When true, the agent will automatically record any relevant information
   * after completing operations, creating a history of interactions.
   */
  autoUpdate?: boolean;

  /**
   * Indicates whether this agent can be directly called.
   *
   * MemoryAgent is designed to be used as a supporting component rather than
   * being directly invoked for processing, so this returns false.
   */
  get isCallable(): boolean {
    return false;
  }

  /**
   * The standard message processing method required by the Agent interface.
   *
   * MemoryAgent doesn't directly process messages like other agents, so this method
   * throws an error when called. Use the specialized retrieve() and record() methods instead.
   */
  async process(_input: Message, _options: AgentInvokeOptions): Promise<Message> {
    throw new Error("Method not implemented.");
  }

  /**
   * Retrieves memories based on the provided input criteria.
   *
   * Delegates the actual retrieval operation to the configured retriever agent.
   *
   * @param input - The retrieval parameters (can include search terms, limits, etc.)
   * @param context - The execution context
   * @returns A promise resolving to the retrieved memories
   * @throws Error - If no retriever has been initialized
   */
  async retrieve(input: MemoryRetrieverInput, context: Context): Promise<MemoryRetrieverOutput> {
    if (!this.retriever) throw new Error("MemoryAgent retriever not initialized");
    return context.invoke(this.retriever, input);
  }

  /**
   * Records new memories based on the provided input content.
   *
   * Delegates the actual recording operation to the configured recorder agent.
   *
   * @param input - The content to be recorded as memories
   * @param context - The execution context
   * @returns A promise resolving to the recorded memories
   * @throws Error - If no recorder has been initialized
   */
  async record(input: MemoryRecorderInput, context: Context): Promise<MemoryRecorderOutput> {
    if (!this.recorder) throw new Error("MemoryAgent recorder not initialized");
    return context.invoke(this.recorder, input);
  }

  override async onMessage({ role, source, message, context }: MessagePayload): Promise<void> {
    this.record({ content: [{ role, source, content: message }] }, context);
  }
}

const memoryAgentOptionsSchema: ZodType<MemoryAgentOptions> = z.object({
  retriever: z.custom<MemoryRetriever>().optional(),
  recorder: z.custom<MemoryRecorder>().optional(),
  autoUpdate: z.boolean().optional(),
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.array(z.custom<Agent>()).optional(),
});
