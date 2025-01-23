import type {
  RuntimeOutputVariable,
  RuntimeOutputVariablesSchema,
} from "@aigne/agent-v1";
import type { Agent } from "../api/agent";

export function getOutputVariableInitialValue<T extends RuntimeOutputVariable>(
  agent: Agent,
  output: T,
): RuntimeOutputVariablesSchema[T] | undefined {
  if (!agent.outputVariables) return undefined;

  return agent.outputVariables.find((i) => i.name === output)
    ?.initialValue as any;
}
