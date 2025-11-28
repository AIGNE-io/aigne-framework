import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { Agent } from "../agents/agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { parseAgentFile } from "./agent-yaml.js";
import { LoadJsAgentError } from "./error.js";

const importFn = new Function("path", "return import(path)");

export async function loadAgentFromJsFile(path: string) {
  const url = nodejs.path.isAbsolute(path) ? nodejs.url.pathToFileURL(path).toString() : path;

  const { default: agent } = await tryOrThrow(
    () => importFn(url),
    (error) =>
      new LoadJsAgentError(`Failed to load agent definition from ${url}: ${error.message}`),
  );

  if (agent instanceof Agent) return agent;

  return tryOrThrow(
    () =>
      parseAgentFile(path, {
        type: "function",
        process: agent,
        name: agent.agent_name || agent.agentName || agent.name,
        ...agent,
      }),
    (error) => new Error(`Failed to parse agent from ${path}: ${error.message}`),
  );
}
