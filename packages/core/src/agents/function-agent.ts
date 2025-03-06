import type { Context } from "../execution-engine/context";
import {
  Agent,
  type AgentInput,
  type AgentOptions,
  type AgentOutput,
} from "./agent";
import { transferToAgentOutput } from "./types";

export interface FunctionAgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends AgentOptions {
  fn: FunctionAgentFn<I, O>;
}

export class FunctionAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options: FunctionAgentOptions<I, O> | FunctionAgentOptions<I, O>["fn"],
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
