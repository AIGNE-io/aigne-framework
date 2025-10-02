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
  agents?: CLIAgent<T>[];
}

export function mapCliAgent<A, O>(
  { agent, agents, ...input }: CLIAgent<A>,
  transform: (input: A) => O,
): CLIAgent<O> {
  return {
    ...input,
    agent: agent ? transform(agent) : undefined,
    agents: agents?.map((item) => mapCliAgent(item, transform)),
  };
}

export function findCliAgent(cli: AIGNECLIAgents, parent: string[] | "*", name: string) {
  if (parent === "*") return findCliAgentRecursive(cli, name);

  let currentAgents: AIGNECLIAgent[] = cli.agents ?? [];
  for (const name of parent) {
    const found = currentAgents.find((i) => (i.name || i.agent?.name) === name);
    if (!found) throw new Error(`Agent ${name} not found in parent path ${parent.join(" -> ")}`);
    if (found.agents) currentAgents = found.agents;
    else currentAgents = [];
  }
  return currentAgents.find((i) => (i.name || i.agent?.name) === name)?.agent;
}

function findCliAgentRecursive(agents: AIGNECLIAgents, name: string) {
  if (agents.chat?.name === name) {
    return agents.chat;
  }

  if (agents.agents) {
    const queue = [...agents.agents];
    while (queue.length > 0) {
      const c = queue.shift();
      if (!c) break;
      if ((c.name || c.agent?.name) === name) {
        return c.agent;
      }
      if (c.agents) {
        queue.push(...c.agents);
      }
    }
  }
  return undefined;
}
