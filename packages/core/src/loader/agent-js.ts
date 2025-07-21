import { Agent } from "../agents/agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { parseAgentFile } from "./agent-yaml.js";

export async function loadAgentFromJsFile(path: string) {
  const { default: agent } = await tryOrThrow(
    () => import(/* @vite-ignore */ path),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  if (agent instanceof Agent) return agent;

  if (typeof agent !== "function") {
    throw new Error(`Agent file ${path} must export a default function, but got ${typeof agent}`);
  }

  return tryOrThrow(
    () =>
      parseAgentFile(path, {
        ...agent,
        type: "function",
        name: agent.agent_name || agent.agentName || agent.name,
        process: agent,
      }),
    (error) => new Error(`Failed to parse agent from ${path}: ${error.message}`),
  );
}
