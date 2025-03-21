import EventEmitter from "node:events";
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

  inputSchema?: ZodType<I>;

  outputSchema?: ZodType<O>;

  includeInputInOutput?: boolean;

  tools?: (Agent | FunctionAgentFn)[];

  disableLogging?: boolean;

  memory?: AgentMemory | AgentMemoryOptions | true;
}

export abstract class Agent<
  I extends Message = Message,
  O extends Message = Message,
> extends EventEmitter {
  constructor({ inputSchema, outputSchema, ...options }: AgentOptions<I, O>) {
    super();

    this.name = options.name || this.constructor.name;
    this.description = options.description;

    if (
      (inputSchema && !(inputSchema instanceof ZodObject)) ||
      (outputSchema && !(outputSchema instanceof ZodObject))
    ) {
      throw new Error("inputSchema must be a Zod object");
    }
    this.inputSchema = (inputSchema || z.object({})).passthrough() as unknown as ZodType<I>;
    this.outputSchema = (outputSchema || z.object({})).passthrough() as unknown as ZodType<O>;

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
            ? new AgentMemory({ enable: options.memory })
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

  readonly inputSchema: ZodType<I>;

  readonly outputSchema: ZodType<O>;

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
  attach(context: Context) {
    this.memory?.attach(context);

    for (const topic of orArrayToArray(this.subscribeTopic).concat(this.topic)) {
      context.subscribe(topic, async ({ message }) => {
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

  async call(input: I | string, context?: Context): Promise<O> {
    if (!this.process) throw new Error("Agent must implement process method");

    const _input = typeof input === "string" ? createMessage(input) : input;

    const parsedInput = this.inputSchema.parse(_input) as I;

    logger.debug("Call agent %s start with input: %O", this.name, input);

    const result = this.process(parsedInput, context)
      .then((output) => {
        const parsedOutput = this.outputSchema.parse(output) as O;
        return this.includeInputInOutput ? { ...parsedInput, ...parsedOutput } : parsedOutput;
      })
      .then((output) => {
        this.memory?.addMemory({ role: "user", content: _input });
        this.memory?.addMemory({
          role: "agent",
          content: replaceTransferAgentToName(output),
          source: this.name,
        });
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

  abstract process(input: I, context?: Context): Promise<O | TransferAgentOutput>;

  async shutdown() {
    this.memory?.detach();
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
