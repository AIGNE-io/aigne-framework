import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { isAgent } from "../utils/agent-utils.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { parseAgentFile } from "./agent-yaml.js";
import { LoadJsAgentError } from "./error.js";
import type { LoadOptions } from "./index.js";

const importFn = new Function("path", "return import(path)");

export async function loadAgentFromJsFile(path: string, options: LoadOptions) {
  const url = nodejs.path.isAbsolute(path) ? nodejs.url.pathToFileURL(path).toString() : path;

  const { default: agent } = await tryOrThrow(
    () => importFn(url),
    (error) =>
      new LoadJsAgentError(`Failed to load agent definition from ${url}: ${error.message}`),
  );

  if (isAgent(agent)) return agent;

  return tryOrThrow(
    () =>
      parseAgentFile(
        path,
        {
          type: "function",
          process: agent,
          name: agent.agent_name || agent.agentName || agent.name,
          ...agent,
        },
        options,
      ),
    (error) => new Error(`Failed to parse agent from ${path}: ${error.message}`),
  );
}
