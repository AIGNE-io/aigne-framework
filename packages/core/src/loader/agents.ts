import { FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import { ImageAgent } from "../agents/image-agent.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { TeamAgent } from "../agents/team-agent.js";
import { TransformAgent } from "../agents/transform-agent.js";
import type { AgentClass } from "../agents/types.ts";

export const builtinAgents: { [type: string]: AgentClass } = {
  ai: AIAgent,
  function: FunctionAgent,
  image: ImageAgent,
  mcp: MCPAgent,
  team: TeamAgent,
  transform: TransformAgent,
};
