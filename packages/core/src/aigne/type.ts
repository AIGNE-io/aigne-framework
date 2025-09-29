import type { Agent } from "../agents/agent.ts";

export interface AIGNECLIAgents {
  chat?: Agent;

  agents?: AIGNECLIAgent[];
}

export interface AIGNECLIAgent {
  agent?: Agent;
  name?: string;
  alias?: string[];
  description?: string;
  commands?: AIGNECLIAgent[];
}
