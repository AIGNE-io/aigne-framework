import { ZodObject, type ZodType, z } from "zod";
import type { Context } from "../execution-engine/context.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { logger } from "../utils/logger.js";
import {
  type Nullish,
  type PromiseOrValue,
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

  disableLogging?: boolean;

  memory?: AgentMemory | AgentMemoryOptions | true;
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
    this.disableLogging = options.disableLogging;
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

  private disableLogging?: boolean;

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
          context.emit("error", error);
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

  private checkContextStatus(context?: Context) {
    if (context) {
      const { status } = context;
      if (status === "timeout") throw new Error("ExecutionEngine is timeout");
    }
  }

  async call(input: I | string, context?: Context): Promise<O> {
    const _input = typeof input === "string" ? createMessage(input) : input;

    const parsedInput = this.inputSchema.parse(_input) as I;

    logger.debug("Call agent %s start with input: %O", this.name, input);

    this.preprocess(parsedInput, context);

    this.checkContextStatus(context);

    const result = this.process(parsedInput, context)
      .then((output) => {
        const parsedOutput = this.outputSchema.parse(output) as O;
        return this.includeInputInOutput ? { ...parsedInput, ...parsedOutput } : parsedOutput;
      })
      .then((output) => {
        this.postprocess(parsedInput, output, context);
        return output;
      });

    return logger.debug.spinner(
      result,
      `Call agent ${this.name}`,
      (output) =>
        logger.debug(
          "Call agent %s succeed with output: %O",
          this.name,
          replaceTransferAgentToName(output),
        ),
      { disabled: this.disableLogging },
    );
  }

  protected preprocess(_: I, context?: Context) {
    this.checkContextStatus(context);

    if (context) {
      const { limits, usage } = context;
      if (limits?.maxAgentCalls && usage.agentCalls >= limits.maxAgentCalls) {
        throw new Error(`Exceeded max agent calls ${usage.agentCalls}/${limits.maxAgentCalls}`);
      }

      usage.agentCalls++;
    }
  }

  protected postprocess(input: I, output: O, context?: Context) {
    this.checkContextStatus(context);

    this.memory?.addMemory({ role: "user", content: input });
    this.memory?.addMemory({
      role: "agent",
      content: replaceTransferAgentToName(output),
      source: this.name,
    });
  }

  abstract process(input: I, context?: Context): Promise<O | TransferAgentOutput>;

  async shutdown() {
    this.memory?.detach();
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

  async process(input: I, context?: Context) {
    const result = await this.fn(input, context);

    if (result instanceof Agent) {
      return transferToAgentOutput(result);
    }

    return result;
  }
}

export type FunctionAgentFn<I extends Message = Message, O extends Message = Message> = (
  input: I,
  context?: Context,
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
