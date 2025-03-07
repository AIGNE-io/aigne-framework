import EventEmitter from "node:events";
import { type ZodObject, z } from "zod";
import type { Context } from "../execution-engine/context";
import { userInput } from "../prompt/prompt-builder";
import { logger } from "../utils/logger";
import { type TransferAgentOutput, transferAgentOutputKey, transferToAgentOutput } from "./types";

export type AgentInput = Record<string, unknown>;

export type AgentOutput = Record<string, unknown> & Partial<TransferAgentOutput>;

export type SubscribeTopic = string | string[];

export type PublishTopic<O extends AgentOutput = AgentOutput> =
  | string
  | string[]
  | ((output: O) => string | string[] | Promise<string | string[]>);

export interface AgentOptions<
  _I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> {
  inputTopic?: SubscribeTopic;

  nextTopic?: PublishTopic<O>;

  name?: string;

  description?: string;

  inputSchema?: ZodObject<any>;

  outputSchema?: ZodObject<any>;

  includeInputInOutput?: boolean;

  tools?: (Agent | FunctionAgentFn)[];

  skills?: Agent[];
}

export abstract class Agent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends EventEmitter {
  constructor(options: AgentOptions<I, O>) {
    super();

    this.name = options.name || this.constructor.name;
    this.description = options.description;
    this.inputSchema = options.inputSchema || z.object({});
    this.outputSchema = options.outputSchema || z.object({});
    this.includeInputInOutput = options.includeInputInOutput;
    this.inputTopic = options.inputTopic;
    this.nextTopic = options.nextTopic;
    this.tools = (options.tools ?? []).map((tool) => {
      if (typeof tool === "function") {
        return FunctionAgent.from({ name: tool.name, fn: tool });
      }
      return tool;
    });
    this.skills = options.skills || [];
  }

  name: string;

  description?: string;

  inputSchema: ZodObject<any>;

  outputSchema: ZodObject<any>;

  includeInputInOutput?: boolean;

  inputTopic?: SubscribeTopic;

  nextTopic?: PublishTopic<any>;

  tools: Agent[];

  skills: Agent[];

  async call(input: I | string, context?: Context): Promise<O> {
    const _input = typeof input === "string" ? userInput(input) : input;

    const parsedInput = this.inputSchema.passthrough().parse(_input) as I;

    logger.debug(`Agent ${this.name} (${this.constructor.name}) start`, parsedInput);

    const output = await this.process(parsedInput, context);

    const parsedOutput = this.outputSchema.passthrough().parse(output) as O;

    const finalOutput = this.includeInputInOutput
      ? { ...parsedInput, ...parsedOutput }
      : parsedOutput;

    logger.debug(`Agent ${this.name} (${this.constructor.name}) end`, {
      ...finalOutput,
      [transferAgentOutputKey]: finalOutput[transferAgentOutputKey]?.agent?.name,
    });

    return finalOutput;
  }

  abstract process(input: I, context?: Context): Promise<O>;
}

export interface FunctionAgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends AgentOptions<I, O> {
  fn: FunctionAgentFn<I, O>;
}

export class FunctionAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>,
  ): FunctionAgent<I, O> {
    if (typeof options === "function") {
      return new FunctionAgent({ fn: options });
    }

    return new FunctionAgent(options);
  }

  constructor(options: FunctionAgentOptions<I, O>) {
    super(options);
    this.fn = options.fn;
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
