import { type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn, type Message } from "../agents/agent.js";
import { checkArguments } from "../utils/type-utils.js";
import type { Context, Runnable } from "./context.js";

export function sequential(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  checkArguments("sequential", agentArraySchema, _agents);
  let agents = [..._agents];

  return async (input: Message, context?: Context) => {
    if (!context)
      throw new Error(
        "Context is required for executing sequential agents. Please provide a valid context.",
      );

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
  checkArguments("parallel", agentArraySchema, _agents);
  let agents = [..._agents];

  return async (input: Message, context?: Context) => {
    if (!context)
      throw new Error(
        "Context is required for executing parallel agents. Please provide a valid context.",
      );

    const result = await Promise.all(
      agents.map((agent) => context.call(agent, input, { returnActiveAgent: true })),
    );

    agents = result.map((i) => i[1]);
    const outputs = result.map((i) => i[0]);

    return Object.assign({}, ...outputs);
  };
}

const agentArraySchema = z.array(
  z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]),
);
