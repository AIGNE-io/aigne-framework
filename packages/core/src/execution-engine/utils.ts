import type { FunctionAgentFn, Message } from "../agents/agent.js";
import type { Context, Runnable } from "./context.js";

export function sequential(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  let agents = [..._agents];

  return async (input: Message, context?: Context) => {
    if (!context) throw new Error("Context is required for sequential agents");

    const output: Message = {};

    // Clone the agents to run, so that we can update the agents list during the loop
    const agentsToRun = [...agents];
    agents = [];

    for (const agent of agentsToRun) {
      const [o, transferToAgent] = await context.call(
        agent,
        { ...input, ...output },
        { returnActiveAgent: true },
      );
      Object.assign(output, o);
      agents.push(transferToAgent);
    }

    return output;
  };
}

export function parallel(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  let agents = [..._agents];

  return async (input: Message, context?: Context) => {
    if (!context) throw new Error("Context is required for parallel agents");

    const result = await Promise.all(
      agents.map((agent) => context.call(agent, input, { returnActiveAgent: true })),
    );

    agents = result.map((i) => i[1]);
    const outputs = result.map((i) => i[0]);

    return Object.assign({}, ...outputs);
  };
}
