import type { Agent } from "../agents/agent.ts";

export interface AIGNECLIAgents {
  init?: Agent;

  chat?: Agent;

  agents?: AIGNECLIAgent[];
}

export interface AIGNECLIAgent {
  agent?: Agent;
  name?: string;
  alias?: string[];
  description?: string;
  agents?: AIGNECLIAgent[];
}

export interface AIGNEMetadata {
  /**
   * CLI version (e.g., "1.51.0")
   */
  cliVersion?: string;

  /**
   * Application name (e.g., "docsmith", "websmith")
   */
  appName?: string;

  /**
   * Application version (e.g., "2.3.4")
   */
  appVersion?: string;
}
