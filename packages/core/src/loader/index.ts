import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { Camelize } from "camelize-ts";
import type { z } from "zod";
import { Agent, type AgentHooks, type AgentOptions, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import type { ChatModel } from "../agents/chat-model.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { TeamAgent } from "../agents/team-agent.js";
import { TransformAgent } from "../agents/transform-agent.js";
import type { AIGNE, AIGNEOptions } from "../aigne/aigne.js";
import type { MemoryAgent, MemoryAgentOptions } from "../memory/memory.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { flat, isNonNullable, type PromiseOrValue } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { type HooksSchema, loadAgentFromYamlFile, type NestAgentSchema } from "./agent-yaml.js";
import { type aigneFileSchema, loadAIGNEFile } from "./aigne-yaml.js";

export interface LoadOptions {
  loadModel: (
    model?: Camelize<z.infer<typeof aigneFileSchema>["model"]>,
  ) => PromiseOrValue<ChatModel | undefined>;
  memories?: { new (parameters?: MemoryAgentOptions): MemoryAgent }[];
  path: string;
}

export async function load(options: LoadOptions): Promise<AIGNEOptions> {
  const { aigne, rootDir } = await loadAIGNEFile(options.path);

  const allAgentPaths = new Set(
    flat(
      aigne.agents,
      aigne.skills,
      aigne.mcpServer?.agents,
      aigne.cli?.agents,
      aigne.cli?.initAgent?.agent,
    ).map((i) => nodejs.path.join(rootDir, i)),
  );
  const allAgents: { [path: string]: Agent } = Object.fromEntries(
    await Promise.all(
      Array.from(allAgentPaths).map(async (path) => [path, await loadAgent(path, options)]),
    ),
  );

  const pickAgents = (paths: string[]) =>
    paths.map((filename) => allAgents[nodejs.path.join(rootDir, filename)]).filter(isNonNullable);

  let initAgent: AIGNE["cli"]["initAgent"] | undefined;

  if (aigne.cli?.initAgent) {
    const agent = allAgents[nodejs.path.join(rootDir, aigne.cli.initAgent.agent)];
    if (!agent) throw new Error(`Init agent not found: ${aigne.cli.initAgent.agent}`);

    initAgent = {
      agent,
      outputPath: aigne.cli.initAgent.outputPath,
    };
  }

  return {
    ...aigne,
    rootDir,
    model: await options.loadModel(aigne.model),
    agents: pickAgents(aigne.agents ?? []),
    skills: pickAgents(aigne.skills ?? []),
    mcpServer: {
      agents: pickAgents(aigne.mcpServer?.agents ?? []),
    },
    cli: {
      agents: pickAgents(aigne.cli?.agents ?? []),
      initAgent,
    },
  };
}

export async function loadAgent(
  path: string,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  if ([".js", ".mjs", ".ts", ".mts"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromJsFile(path);
    if (agent instanceof Agent) return agent;
    return parseAgent(path, agent, options, agentOptions);
  }

  if ([".yml", ".yaml"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromYamlFile(path);

    return parseAgent(path, agent, options, agentOptions);
  }

  throw new Error(`Unsupported agent file type: ${path}`);
}

async function loadNestAgent(
  path: string,
  agent: NestAgentSchema,
  options?: LoadOptions,
): Promise<Agent> {
  return typeof agent === "object" && "type" in agent
    ? parseAgent(path, agent, options)
    : typeof agent === "string"
      ? loadAgent(nodejs.path.join(nodejs.path.dirname(path), agent), options)
      : loadAgent(nodejs.path.join(nodejs.path.dirname(path), agent.url), options, {
          defaultInput: agent.defaultInput,
          hooks: await parseHooks(path, agent.hooks, options),
        });
}

async function parseHooks(
  path: string,
  hooks?: HooksSchema | HooksSchema[],
  options?: LoadOptions,
): Promise<AgentHooks[] | undefined> {
  hooks = [hooks].flat().filter(isNonNullable);
  if (!hooks.length) return undefined;

  type AllHooks = Required<AgentHooks>;

  return await Promise.all(
    hooks.map(
      async (hook): Promise<{ [key in keyof AllHooks]: AllHooks[key] | undefined }> => ({
        onStart: hook.onStart ? await loadNestAgent(path, hook.onStart, options) : undefined,
        onSuccess: hook.onSuccess ? await loadNestAgent(path, hook.onSuccess, options) : undefined,
        onError: hook.onError ? await loadNestAgent(path, hook.onError, options) : undefined,
        onEnd: hook.onEnd ? await loadNestAgent(path, hook.onEnd, options) : undefined,
        onSkillStart: hook.onSkillStart
          ? await loadNestAgent(path, hook.onSkillStart, options)
          : undefined,
        onSkillEnd: hook.onSkillEnd
          ? await loadNestAgent(path, hook.onSkillEnd, options)
          : undefined,
        onHandoff: hook.onHandoff ? await loadNestAgent(path, hook.onHandoff, options) : undefined,
      }),
    ),
  );
}

async function parseAgent(
  path: string,
  agent: Awaited<ReturnType<typeof loadAgentFromYamlFile>>,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  const skills =
    "skills" in agent
      ? agent.skills &&
        (await Promise.all(agent.skills.map((skill) => loadNestAgent(path, skill, options))))
      : undefined;

  const memory =
    "memory" in agent && options?.memories?.length
      ? await loadMemory(
          options.memories,
          typeof agent.memory === "object" ? agent.memory.provider : undefined,
          typeof agent.memory === "object" ? agent.memory : {},
        )
      : undefined;

  const baseOptions: AgentOptions = {
    ...agentOptions,
    ...agent,
    skills,
    memory,
    hooks: [
      ...((await parseHooks(path, agent.hooks, options)) ?? []),
      ...[agentOptions?.hooks].flat().filter(isNonNullable),
    ],
  };

  switch (agent.type) {
    case "ai": {
      return AIAgent.from({
        ...baseOptions,
        instructions:
          agent.instructions &&
          PromptBuilder.from(agent.instructions, { workingDir: nodejs.path.dirname(path) }),
      });
    }
    case "mcp": {
      if (agent.url) {
        return MCPAgent.from({
          ...baseOptions,
          url: agent.url,
        });
      }
      if (agent.command) {
        return MCPAgent.from({
          ...baseOptions,
          command: agent.command,
          args: agent.args,
        });
      }
      throw new Error(`Missing url or command in mcp agent: ${path}`);
    }
    case "team": {
      return TeamAgent.from({
        ...baseOptions,
        mode: agent.mode,
        iterateOn: agent.iterateOn,
        reflection: agent.reflection && {
          ...agent.reflection,
          reviewer: await loadNestAgent(path, agent.reflection.reviewer, options),
        },
      });
    }
    case "transform": {
      return TransformAgent.from({
        ...baseOptions,
        jsonata: agent.jsonata,
      });
    }
    case "function": {
      return FunctionAgent.from({
        ...baseOptions,
        process: agent.process,
      });
    }
  }
}

async function loadMemory(
  memories: NonNullable<LoadOptions["memories"]>,
  provider?: string,
  options?: MemoryAgentOptions,
) {
  const M = !provider
    ? memories[0]
    : memories.find((i) => i.name.toLowerCase().includes(provider.toLowerCase()));
  if (!M) throw new Error(`Unsupported memory: ${provider}`);

  return new M(options);
}
