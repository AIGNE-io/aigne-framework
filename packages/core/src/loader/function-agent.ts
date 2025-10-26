import type { FunctionAgentFn } from "../agents/agent.js";

export function codeToFunctionAgentFn(code: string): FunctionAgentFn {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

  return new AsyncFunction("input", "options", code) as FunctionAgentFn;
}
