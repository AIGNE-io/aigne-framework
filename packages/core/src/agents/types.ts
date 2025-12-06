import z, { type ZodType } from "zod";
import { type Agent, type AgentOptions, DEFAULT_INPUT_ACTION_GET, type Message } from "./agent.js";

export const transferAgentOutputKey = "$transferAgentTo";

export interface TransferAgentOutput extends Message {
  [transferAgentOutputKey]: {
    agent: Agent;
  };
}

export function transferToAgentOutput(agent: Agent): TransferAgentOutput {
  return {
    [transferAgentOutputKey]: {
      agent,
    },
  };
}

export function isTransferAgentOutput(output: Message): output is TransferAgentOutput {
  return !!(output[transferAgentOutputKey] as TransferAgentOutput)?.agent;
}

export function replaceTransferAgentToName(output: Message): Message {
  if (isTransferAgentOutput(output)) {
    return {
      ...output,
      [transferAgentOutputKey]: output[transferAgentOutputKey].agent.name,
    };
  }

  return output;
}

export type GetterSchema<I extends Record<string, unknown>> = Partial<{
  [key in keyof I]: { [DEFAULT_INPUT_ACTION_GET]: string } | I[key];
}>;

export function getterSchema<T extends ZodType>(schema: T) {
  return z.union([
    schema,
    z.object({
      [DEFAULT_INPUT_ACTION_GET]: z.string(),
    }),
  ]);
}

export interface AgentClass {
  new (...args: any[]): Agent<any, any>;
  load<I extends Message = any, O extends Message = any>(options: {
    filepath: string;
    parsed: AgentOptions;
    [key: string]: any;
  }): Promise<Agent<I, O>>;
}
