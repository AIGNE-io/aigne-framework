import EventEmitter from "node:events";
import { ZodObject, type ZodType, z } from "zod";
import type { Context } from "../execution-engine/context.js";
import { userInput } from "../prompt/prompt-builder.js";
import { logger } from "../utils/logger.js";
import { createAccessorArray } from "../utils/type-utils.js";
import { type TransferAgentOutput, transferToAgentOutput } from "./types.js";

export type AgentInput = Record<string, unknown>;

export type AgentOutput = Record<string, unknown> & Partial<TransferAgentOutput>;

export type SubscribeTopic = string | string[];

export type PublishTopic<O extends AgentOutput = AgentOutput> =
  | string
  | string[]
  | ((output: O) => string | string[] | Promise<string | string[]>);

export interface AgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> {
  subscribeTopic?: SubscribeTopic;

  publishTopic?: PublishTopic<O>;

  name?: string;

  description?: string;

  inputSchema?: ZodType<I>;

  outputSchema?: ZodType<O>;

  includeInputInOutput?: boolean;

  tools?: (Agent | FunctionAgentFn)[];

  disableLogging?: boolean;
}

export abstract class Agent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
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
    this.publishTopic = options.publishTopic as PublishTopic<AgentOutput>;
    if (options.tools?.length) this.tools.push(...options.tools.map(functionToAgent));
    this.disableLogging = options.disableLogging;
  }

  readonly name: string;

  readonly description?: string;

  readonly inputSchema: ZodType<I>;

  readonly outputSchema: ZodType<O>;

  readonly includeInputInOutput?: boolean;

  readonly subscribeTopic?: SubscribeTopic;

  readonly publishTopic?: PublishTopic<AgentOutput>;

  readonly tools = createAccessorArray<Agent>([], (arr, name) => arr.find((t) => t.name === name));

  private disableLogging?: boolean;

  addTool<I extends AgentInput, O extends AgentOutput>(tool: Agent<I, O> | FunctionAgentFn<I, O>) {
    this.tools.push(typeof tool === "function" ? functionToAgent(tool) : tool);
  }

  get isCallable(): boolean {
    return !!this.process;
  }

  async call(input: I | string, context?: Context): Promise<O> {
    if (!this.process) throw new Error("Agent must implement process method");

    const _input = typeof input === "string" ? userInput(input) : input;

    const parsedInput = this.inputSchema.parse(_input) as I;

    const result = this.process(parsedInput, context).then((output) => {
      const parsedOutput = this.outputSchema.parse(output) as O;

      return this.includeInputInOutput ? { ...parsedInput, ...parsedOutput } : parsedOutput;
    });

    return logger.debug.spinner(
      result,
      `Call agent ${this.name}`,
      (output) => logger.debug("input: %O\noutput: %O", input, output),
      { disabled: this.disableLogging },
    );
  }

  abstract process(input: I, context?: Context): Promise<O>;

  async shutdown() {}
}

export interface FunctionAgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends AgentOptions<I, O> {
  fn?: FunctionAgentFn<I, O>;
}

export class FunctionAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>,
  ): FunctionAgent<I, O> {
    return typeof options === "function" ? functionToAgent(options) : new FunctionAgent(options);
  }

  constructor(options: FunctionAgentOptions<I, O>) {
    super(options);
    this.fn = options.fn ?? ((() => ({})) as unknown as FunctionAgentFn<I, O>);
  }

  fn: FunctionAgentFn<I, O>;

  async process(input: I, context?: Context): Promise<O> {
    const result = await this.fn(input, context);

    if (result instanceof Agent) {
      return transferToAgentOutput(result) as O;
    }

    return result;
  }
}

export type FunctionAgentFn<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> = (input: I, context?: Context) => O | Promise<O> | Agent | Promise<Agent>;

function functionToAgent<I extends AgentInput, O extends AgentOutput>(
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
