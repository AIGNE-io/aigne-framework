/**
 * @hidden
 */
export interface ContextUsage {
  inputTokens: number;
  outputTokens: number;
  aigneHubCredits: number;
  creditPrefix?: "$" | "€" | "¥";
  agentCalls: number;
  duration: number;
  /** Number of tokens written to cache (first time caching) */
  cacheCreationInputTokens: number;
  /** Number of tokens read from cache (cache hit) */
  cacheReadInputTokens: number;
}

/**
 * @hidden
 */
export function newEmptyContextUsage(): ContextUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    aigneHubCredits: 0,
    agentCalls: 0,
    duration: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  };
}

/**
 * @hidden
 */
export interface ContextLimits {
  maxTokens?: number;
  maxAgentInvokes?: number;
  timeout?: number;
}

export function mergeContextUsage(usage: ContextUsage, additional: Partial<ContextUsage>) {
  if (additional.inputTokens) usage.inputTokens += additional.inputTokens;
  if (additional.outputTokens) usage.outputTokens += additional.outputTokens;
  if (additional.aigneHubCredits) usage.aigneHubCredits += additional.aigneHubCredits;
  if (additional.agentCalls) usage.agentCalls += additional.agentCalls;
  if (additional.duration) usage.duration += additional.duration;
  if (additional.cacheCreationInputTokens)
    usage.cacheCreationInputTokens += additional.cacheCreationInputTokens;
  if (additional.cacheReadInputTokens)
    usage.cacheReadInputTokens += additional.cacheReadInputTokens;
}
