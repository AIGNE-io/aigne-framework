import type { Agent, Message } from "./agent.js";

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
