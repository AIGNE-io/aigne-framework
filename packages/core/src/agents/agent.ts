import { inspect } from "node:util";
import { ZodObject, type ZodType, z } from "zod";
import type { Context } from "../execution-engine/context.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { logger } from "../utils/logger.js";
import {
  agentResponseStreamToObject,
  asyncGeneratorToReadableStream,
  isAsyncGenerator,
  objectToAgentResponseStream,
  onAgentResponseStreamEnd,
} from "../utils/stream-utils.js";
import {
  type Nullish,
  type PromiseOrValue,
  checkArguments,
  createAccessorArray,
  orArrayToArray,
} from "../utils/type-utils.js";
import { AgentMemory, type AgentMemoryOptions } from "./memory.js";
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

  memory?: AgentMemory | AgentMemoryOptions | true;
}

export interface AgentCallOptions {
  stream?: boolean;
}

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
    if (options.memory) {
      this.memory =
        options.memory instanceof AgentMemory
          ? options.memory
          : typeof options.memory === "boolean"
            ? new AgentMemory({ enabled: options.memory })
            : new AgentMemory(options.memory);
    }
  }

  readonly memory?: AgentMemory;

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

  /**
   * Attach agent to context:
   * - subscribe to topic and call process method when message received
   * - subscribe to memory topic if memory is enabled
   * @param context Context to attach
   */
  attach(context: Pick<Context, "subscribe">) {
    this.memory?.attach(context);

    for (const topic of orArrayToArray(this.subscribeTopic).concat(this.topic)) {
      context.subscribe(topic, async ({ message, context }) => {
        try {
          await context.call(this, message);
        } catch (error) {
          context.emit("agentFailed", { agent: this, error });
        }
      });
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

  async call(
    input: I | string,
    context: Context | undefined,
    options: AgentCallOptions & { stream: true },
  ): Promise<AgentResponseStream<O>>;
  async call(
    input: I | string,
    context?: Context,
    options?: AgentCallOptions & { stream?: false },
  ): Promise<O>;
  async call(
    input: I | string,
    context?: Context,
    options?: AgentCallOptions,
  ): Promise<AgentResponse<O>>;
  async call(
    input: I | string,
    context?: Context,
    options?: AgentCallOptions,
  ): Promise<AgentResponse<O>> {
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

      const response = await this.process(parsedInput, ctx, options);

      if (options?.stream) {
        const stream =
          response instanceof ReadableStream
            ? response
            : isAsyncGenerator(response)
              ? asyncGeneratorToReadableStream(response)
              : objectToAgentResponseStream(response);

        return onAgentResponseStreamEnd(
          stream,
          async (result) => {
            return await this.processAgentOutput(parsedInput, result, ctx);
          },
          (error) => {
            try {
              this.processAgentError(error, ctx);
            } catch (error) {
              return error;
            }
          },
        );
      }

      return await this.processAgentOutput(
        parsedInput,
        response instanceof ReadableStream
          ? await agentResponseStreamToObject(response)
          : isAsyncGenerator(response)
            ? await agentResponseStreamToObject(response)
            : response,
        ctx,
      );
    } catch (error) {
      this.processAgentError(error, ctx);
    }
  }

  private async processAgentOutput(input: I, output: O | TransferAgentOutput, context: Context) {
    const parsedOutput = checkArguments(
      `Agent ${this.name} output`,
      this.outputSchema,
      output,
    ) as O;

    const finalOutput = this.includeInputInOutput ? { ...input, ...parsedOutput } : parsedOutput;

    this.postprocess(input, finalOutput, context);

    logger.core("Call agent %s succeed with output: %O", this.name, finalOutput);
    if (!this.disableEvents) context.emit("agentSucceed", { agent: this, output: finalOutput });

    return finalOutput;
  }

  private processAgentError(error: Error, context: Context): never {
    logger.core("Call agent %s failed with error: %O", this.name, error);
    if (!this.disableEvents) context.emit("agentFailed", { agent: this, error });
    throw error;
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

    this.memory?.addMemory({ role: "user", content: input });
    this.memory?.addMemory({
      role: "agent",
      content: replaceTransferAgentToName(output),
      source: this.name,
    });
  }

  abstract process(
    input: I,
    context: Context,
    options?: AgentCallOptions,
  ): AgentProcessResult<O | TransferAgentOutput>;

  async shutdown() {
    this.memory?.detach();
  }

  [inspect.custom]() {
    return this.name;
  }
}

export type AgentResponse<T> = T | AgentResponseStream<T>;

export type AgentResponseStream<T> = ReadableStream<AgentResponseChunk<T>>;

export type AgentResponseChunk<T> = AgentResponseDelta<T>;

export interface AgentResponseDelta<T> {
  delta: {
    text?:
      | Partial<{
          [key in keyof T as Extract<T[key], string> extends string ? key : never]: string;
        }>
      | {
          [key: string]: string;
        };
    json?: Partial<T>;
  };
}

export type AgentProcessAsyncGenerator<O extends Message> = AsyncGenerator<
  AgentResponseChunk<O>,
  O | undefined | void
>;

export type AgentProcessResult<O extends Message> =
  | Promise<AgentResponse<O>>
  | AgentProcessAsyncGenerator<O>;

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

  async process(
    input: I,
    context: Context,
    options?: AgentCallOptions,
  ): Promise<AgentResponse<O | TransferAgentOutput>> {
    let result: O | TransferAgentOutput | Agent = await this.fn(input, context);

    if (result instanceof Agent) {
      result = transferToAgentOutput(result);
    }

    return options?.stream ? objectToAgentResponseStream(result) : result;
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
