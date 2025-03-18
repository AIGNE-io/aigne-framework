import type { Agent, AgentOutput } from "./agent.js";

export const transferAgentOutputKey = "$transferAgentTo";

export interface TransferAgentOutput extends Record<string, unknown> {
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

export function isTransferAgentOutput(output: AgentOutput): output is TransferAgentOutput {
  return transferAgentOutputKey in output;
}
