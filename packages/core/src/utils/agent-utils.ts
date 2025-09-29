import type { AgentHooks } from "../agents/agent.ts";
import type { AIGNECLIAgent, AIGNECLIAgents } from "../aigne/type.js";

const priorities: NonNullable<AgentHooks["priority"]>[] = ["high", "medium", "low"];

export function sortHooks(hooks: AgentHooks[]): AgentHooks[] {
  return hooks
    .slice(0)
    .sort(({ priority: a = "low" }, { priority: b = "low" }) =>
      a === b ? 0 : priorities.indexOf(a) - priorities.indexOf(b),
    );
}

export interface CLIAgent<T> {
  agent?: T;
  name?: string;
  alias?: string[];
  description?: string;
  commands?: CLIAgent<T>[];
}

export function mapCliAgent<A, O>(
  { agent, commands, ...input }: CLIAgent<A>,
  transform: (input: A) => O,
): CLIAgent<O> {
  return {
    ...input,
    agent: agent ? transform(agent) : undefined,
    commands: commands?.map((item) => mapCliAgent(item, transform)),
  };
}

export function findCliAgent(cli: AIGNECLIAgents, parent: string[], name: string) {
  let currentAgents: AIGNECLIAgent[] = cli.agents ?? [];
  for (const name of parent) {
    const found = currentAgents.find((i) => (i.name || i.agent?.name) === name);
    if (!found) throw new Error(`Agent ${name} not found in parent path ${parent.join(" -> ")}`);
    if (found.commands) currentAgents = found.commands;
    else currentAgents = [];
  }
  return currentAgents.find((i) => (i.name || i.agent?.name) === name)?.agent;
}
