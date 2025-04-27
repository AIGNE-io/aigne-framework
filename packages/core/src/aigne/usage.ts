export interface ContextUsage {
  inputTokens: number;
  outputTokens: number;
  agentCalls: number;
}

export function newEmptyContextUsage(): ContextUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    agentCalls: 0,
  };
}

export interface ContextLimits {
  maxTokens?: number;
  maxAgentInvokes?: number;
  timeout?: number;
}
