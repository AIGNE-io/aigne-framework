import { createRequire } from "node:module";
import { Context, createContext, Script, SourceTextModule } from "node:vm";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { withQuery } from "ufo";
import { Agent } from "../agents/agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { parseAgentFile } from "./agent-yaml.js";
import type { LoadOptions } from "./index.js";
import { pathToFileURL } from "node:url";

const importFn = new Function("path", "return import(path)");

export async function loadAgentFromJsFile(path: string, options?: LoadOptions) {
  // if (options?.key) path = withQuery(path, { key: options?.key });

  const vm =
    options?.vm ??
    createContext({
    });

  const { default: agent } = await tryOrThrow(
    () => loadESMModule(path, vm),
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

async function loadESMModule(path: string, context: Context): Promise<any>{
  const code = await nodejs.fs.readFile(path, "utf-8");

  // 创建 ESM 模块
  const module = new nodejs.vm.SourceTextModule(code, {
    context,
    identifier: path,
    initializeImportMeta(meta) {
      // meta.url = nodejs.url.pathToFileURL(path).href;
    },
    async importModuleDynamically(specifier, referencingModule) {
      // 自定义 import 解析：走插件自己的 node_modules
      const pluginRequire = createRequire(path);
      const resolved = pluginRequire.resolve(specifier);
      return loadESMModule(resolved, context);
    },
  });

  await module.link(() => {}); // 解析 import
  await module.evaluate(); // 执行模块

  return module.namespace;
}
