import { inspect } from "node:util";
import { ZodObject, type ZodType, z } from "zod";
import type { Context } from "../execution-engine/context.js";
import type { MessagePayload, Unsubscribe } from "../execution-engine/message-queue.js";
import type { AgentMemory } from "../memory/memory.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { logger } from "../utils/logger.js";
import {
  type Nullish,
  type PromiseOrValue,
  checkArguments,
  createAccessorArray,
  orArrayToArray,
} from "../utils/type-utils.js";
import {
  type TransferAgentOutput,
  replaceTransferAgentToName,
  transferToAgentOutput,
} from "./types.js";

export type Message = Record<string, unknown>;

export type SubscribeTopic = string | string[];

export type PublishTopic<O extends Message> =
  | string
  | string[]
  | ((output: O) => PromiseOrValue<Nullish<string | string[]>>);

export interface AgentOptions<I extends Message = Message, O extends Message = Message> {
  subscribeTopic?: SubscribeTopic;

  publishTopic?: PublishTopic<O>;

  name?: string;

  description?: string;

  inputSchema?: AgentInputOutputSchema<I>;

  outputSchema?: AgentInputOutputSchema<O>;

  includeInputInOutput?: boolean;

  tools?: (Agent | FunctionAgentFn)[];

  disableEvents?: boolean;

  memory?: AgentMemory | AgentMemory[];
}

export const agentOptionsSchema: ZodObject<{
  [key in keyof AgentOptions]: ZodType<AgentOptions[key]>;
}> = z.object({
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  publishTopic: z
    .union([z.string(), z.array(z.string()), z.custom<PublishTopic<Message>>()])
    .optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  inputSchema: z.custom<AgentInputOutputSchema>().optional(),
  outputSchema: z.custom<AgentInputOutputSchema>().optional(),
  includeInputInOutput: z.boolean().optional(),
  tools: z.array(z.union([z.custom<Agent>(), z.custom<FunctionAgentFn>()])).optional(),
  disableEvents: z.boolean().optional(),
  memory: z.union([z.custom<AgentMemory>(), z.array(z.custom<AgentMemory>())]).optional(),
});

export abstract class Agent<I extends Message = Message, O extends Message = Message> {
  constructor({ inputSchema, outputSchema, ...options }: AgentOptions<I, O>) {
    this.name = options.name || this.constructor.name;
    this.description = options.description;

    if (inputSchema) checkAgentInputOutputSchema(inputSchema);
    if (outputSchema) checkAgentInputOutputSchema(outputSchema);
    this._inputSchema = inputSchema;
    this._outputSchema = outputSchema;
    this.includeInputInOutput = options.includeInputInOutput;
    this.subscribeTopic = options.subscribeTopic;
    this.publishTopic = options.publishTopic as PublishTopic<Message>;
    if (options.tools?.length) this.tools.push(...options.tools.map(functionToAgent));
    this.disableEvents = options.disableEvents;

    if (Array.isArray(options.memory)) {
      this.memories.push(...options.memory);
    } else if (options.memory) {
      this.memories.push(options.memory);
    }
  }

  readonly memories: AgentMemory[] = [];

  readonly name: string;

  /**
   * Default topic this agent will subscribe to
   */
  get topic(): string {
    return `$agent_${this.name}`;
  }

  readonly description?: string;

  private readonly _inputSchema?: AgentInputOutputSchema<I>;

  private readonly _outputSchema?: AgentInputOutputSchema<O>;

  get inputSchema(): ZodType<I> {
    const s = this._inputSchema;
    const schema = typeof s === "function" ? s(this) : s || z.object({});
    checkAgentInputOutputSchema(schema);
    return schema.passthrough() as unknown as ZodType<I>;
  }

  get outputSchema(): ZodType<O> {
    const s = this._outputSchema;
    const schema = typeof s === "function" ? s(this) : s || z.object({});
    checkAgentInputOutputSchema(schema);
    return schema.passthrough() as unknown as ZodType<O>;
  }

  readonly includeInputInOutput?: boolean;

  readonly subscribeTopic?: SubscribeTopic;

  readonly publishTopic?: PublishTopic<Message>;

  readonly tools = createAccessorArray<Agent>([], (arr, name) => arr.find((t) => t.name === name));

  private disableEvents?: boolean;

  private subscriptions: Unsubscribe[] = [];

  /**
   * Attach agent to context:
   * - subscribe to topic and call process method when message received
   * - subscribe to memory topic if memory is enabled
   * @param context Context to attach
   */
  attach(context: Pick<Context, "subscribe">) {
    for (const memory of this.memories) {
      memory.attach(context);
    }

    for (const topic of orArrayToArray(this.subscribeTopic).concat(this.topic)) {
      this.subscriptions.push(context.subscribe(topic, (payload) => this.onMessage(payload)));
    }
  }

  async onMessage({ message, context }: MessagePayload) {
    try {
      await context.call(this, message);
    } catch (error) {
      context.emit("agentFailed", { agent: this, error });
    }
  }

  addTool<I extends Message, O extends Message>(tool: Agent<I, O> | FunctionAgentFn<I, O>) {
    this.tools.push(typeof tool === "function" ? functionToAgent(tool) : tool);
  }

  get isCallable(): boolean {
    return !!this.process;
  }

  private checkContextStatus(context: Context) {
    if (context) {
      const { status } = context;
      if (status === "timeout") {
        throw new Error(`ExecutionEngine for agent ${this.name} has timed out`);
      }
    }
  }

  private async newDefaultContext() {
    return import("../execution-engine/context.js").then((m) => new m.ExecutionContext());
  }

  async call(input: I | string, context?: Context): Promise<O> {
    const ctx: Context = context ?? (await this.newDefaultContext());
    const message = typeof input === "string" ? createMessage(input) : input;

    logger.core("Call agent %s started with input: %O", this.name, input);
    if (!this.disableEvents) ctx.emit("agentStarted", { agent: this, input: message });

    try {
      const parsedInput = checkArguments(
        `Agent ${this.name} input`,
        this.inputSchema,
        message,
      ) as I;

      this.preprocess(parsedInput, ctx);

      this.checkContextStatus(ctx);

      const output = await this.process(parsedInput, ctx)
        .then((output) => {
          const parsedOutput = checkArguments(
            `Agent ${this.name} output`,
            this.outputSchema,
            output,
          ) as O;
          return this.includeInputInOutput ? { ...parsedInput, ...parsedOutput } : parsedOutput;
        })
        .then((output) => {
          this.postprocess(parsedInput, output, ctx);
          return output;
        });

      logger.core("Call agent %s succeed with output: %O", this.name, input);
      if (!this.disableEvents) ctx.emit("agentSucceed", { agent: this, output });

      return output;
    } catch (error) {
      logger.core("Call agent %s failed with error: %O", this.name, error);
      if (!this.disableEvents) ctx.emit("agentFailed", { agent: this, error });
      throw error;
    }
  }

  protected checkUsageAgentCalls(context: Context) {
    const { limits, usage } = context;
    if (limits?.maxAgentCalls && usage.agentCalls >= limits.maxAgentCalls) {
      throw new Error(`Exceeded max agent calls ${usage.agentCalls}/${limits.maxAgentCalls}`);
    }

    usage.agentCalls++;
  }

  protected preprocess(_: I, context: Context) {
    this.checkContextStatus(context);
    this.checkUsageAgentCalls(context);
  }

  protected postprocess(input: I, output: O, context: Context) {
    this.checkContextStatus(context);

    for (const memory of this.memories) {
      if (memory.autoUpdate) {
        memory.record(
          {
            content: [
              { role: "user", content: input },
              { role: "agent", content: replaceTransferAgentToName(output), source: this.name },
            ],
          },
          context,
        );
      }
    }
  }

  abstract process(input: I, context: Context): Promise<O | TransferAgentOutput>;

  async shutdown() {
    for (const sub of this.subscriptions) {
      sub();
    }
    this.subscriptions = [];

    for (const m of this.memories) {
      m.shutdown();
    }
  }

  [inspect.custom]() {
    return this.name;
  }
}

export type AgentInputOutputSchema<I extends Message = Message> =
  | ZodType<I>
  | ((agent: Agent) => ZodType<I>);

function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType,
): asserts schema is ZodObject<{ [key in keyof I]: ZodType<I[key]> }>;
function checkAgentInputOutputSchema<I extends Message>(
  schema: (agent: Agent) => ZodType<I>,
): asserts schema is (agent: Agent) => ZodType;
function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType | ((agent: Agent) => ZodType<I>),
): asserts schema is ZodObject<{ [key in keyof I]: ZodType<I[key]> }> | ((agent: Agent) => ZodType);
function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType | ((agent: Agent) => ZodType<I>),
): asserts schema is
  | ZodObject<{ [key in keyof I]: ZodType<I[key]> }>
  | ((agent: Agent) => ZodType) {
  if (!(schema instanceof ZodObject) && typeof schema !== "function") {
    throw new Error("schema must be a zod object or function return a zod object ");
  }
}

export interface FunctionAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  fn?: FunctionAgentFn<I, O>;
}

export class FunctionAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  static from<I extends Message, O extends Message>(
    options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>,
  ): FunctionAgent<I, O> {
    return typeof options === "function" ? functionToAgent(options) : new FunctionAgent(options);
  }

  constructor(options: FunctionAgentOptions<I, O>) {
    super(options);
    this.fn = options.fn ?? ((() => ({})) as unknown as FunctionAgentFn<I, O>);
  }

  fn: FunctionAgentFn<I, O>;

  async process(input: I, context: Context) {
    const result = await this.fn(input, context);

    if (result instanceof Agent) {
      return transferToAgentOutput(result);
    }

    return result;
  }
}

export type FunctionAgentFn<I extends Message = Message, O extends Message = Message> = (
  input: I,
  context: Context,
) => O | Promise<O> | Agent | Promise<Agent>;

function functionToAgent<I extends Message, O extends Message>(
  agent: FunctionAgentFn<I, O>,
): FunctionAgent<I, O>;
function functionToAgent<T extends Agent>(agent: T): T;
function functionToAgent<T extends Agent>(agent: T | FunctionAgentFn): T | FunctionAgent;
function functionToAgent<T extends Agent>(agent: T | FunctionAgentFn): T | FunctionAgent {
  if (typeof agent === "function") {
    return FunctionAgent.from({ name: agent.name, fn: agent });
  }
  return agent;
}
