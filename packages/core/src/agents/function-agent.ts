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
  function: (input: I) => O | Promise<O> | Agent | Promise<Agent>;
}

export class FunctionAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options:
      | FunctionAgentOptions<I, O>
      | FunctionAgentOptions<I, O>["function"],
  ): FunctionAgent<I, O> {
    if (typeof options === "function") {
      return new FunctionAgent({ function: options });
    }

    return new FunctionAgent(options);
  }

  constructor(public options: FunctionAgentOptions<I, O>) {
    super(options);
  }

  async process(input: I): Promise<O> {
    const result = await this.options.function(input);
    if (result instanceof Agent) {
      return transferToAgentOutput(result) as O;
    }
    return result;
  }
}
