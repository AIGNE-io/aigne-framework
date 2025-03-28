import { type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn, type Message } from "../agents/agent.js";
import { checkArguments } from "../utils/type-utils.js";
import type { Context, Runnable } from "./context.js";

export function sequential(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  checkArguments("sequential", agentArraySchema, agents);
  let _agents = [...agents];

  return async (input: Message, context: Context) => {
    const output: Message = {};

    // Clone the agents to run, so that we can update the agents list during the loop
    const agentsToRun = [..._agents];
    _agents = [];

    for (const agent of agentsToRun) {
      const [o, transferToAgent] = await context.call(
        agent,
        { ...input, ...output },
        { returnActiveAgent: true },
      );
      Object.assign(output, o);
      _agents.push(transferToAgent);
    }

    return output;
  };
}

export function parallel(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  checkArguments("parallel", agentArraySchema, agents);
  let _agents = [...agents];

  return async (input: Message, context: Context) => {
    const result = await Promise.all(
      _agents.map((agent) => context.call(agent, input, { returnActiveAgent: true })),
    );

    _agents = result.map((i) => i[1]);
    const outputs = result.map((i) => i[0]);

    return Object.assign({}, ...outputs);
  };
}

const agentArraySchema = z.array(
  z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]),
);
