export interface ContextUsage {
  promptTokens: number;
  completionTokens: number;
  agentCalls: number;
}

export function newEmptyContextUsage(): ContextUsage {
  return {
    promptTokens: 0,
    completionTokens: 0,
    agentCalls: 0,
  };
}

export interface ContextLimits {
  maxTokens?: number;
  maxAgentCalls?: number;
  timeout?: number;
}
