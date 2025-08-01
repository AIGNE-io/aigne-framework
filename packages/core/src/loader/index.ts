import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { Camelize } from "camelize-ts";
import { parse } from "yaml";
import { z } from "zod";
import { Agent, type AgentHooks, type AgentOptions, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import type { ChatModel, ChatModelOptions } from "../agents/chat-model.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { TeamAgent } from "../agents/team-agent.js";
import { TransformAgent } from "../agents/transform-agent.js";
import type { AIGNEOptions } from "../aigne/aigne.js";
import type { MemoryAgent, MemoryAgentOptions } from "../memory/memory.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { flat, isNonNullable, tryOrThrow } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { type HooksSchema, loadAgentFromYamlFile, type NestAgentSchema } from "./agent-yaml.js";
import { camelizeSchema, optionalize } from "./schema.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

interface LoadableModelClass {
  new (parameters: { model?: string; modelOptions?: ChatModelOptions }): ChatModel;
}

export interface LoadableModel {
  name: string | string[];
  apiKeyEnvName?: string | string[];
  create: (options: {
    model?: string;
    modelOptions?: ChatModelOptions;
    accessKey?: string;
    url?: string;
  }) => ChatModel;
}

export interface LoadOptions {
  models: (LoadableModel | LoadableModelClass)[];
  memories?: { new (parameters?: MemoryAgentOptions): MemoryAgent }[];
  path: string;
}

export async function load(options: LoadOptions): Promise<AIGNEOptions> {
  const { aigne, rootDir } = await loadAIGNEFile(options.path);

  const allAgentPaths = new Set(
    flat(aigne.agents, aigne.skills, aigne.mcpServer?.agents, aigne.cli?.agents).map((i) =>
      nodejs.path.join(rootDir, i),
    ),
  );
  const allAgents: { [path: string]: Agent } = Object.fromEntries(
    await Promise.all(
      Array.from(allAgentPaths).map(async (path) => [path, await loadAgent(path, options)]),
    ),
  );

  const pickAgents = (paths: string[]) =>
    paths.map((filename) => allAgents[nodejs.path.join(rootDir, filename)]).filter(isNonNullable);

  return {
    ...aigne,
    rootDir,
    model: await loadModel(
      options.models.map((i) =>
        typeof i === "function"
          ? {
              name: i.name,
              create: (options) => new i(options),
            }
          : i,
      ),
      aigne.model,
    ),
    agents: pickAgents(aigne.agents ?? []),
    skills: pickAgents(aigne.skills ?? []),
    mcpServer: {
      agents: pickAgents(aigne.mcpServer?.agents ?? []),
    },
    cli: {
      agents: pickAgents(aigne.cli?.agents ?? []),
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

const { MODEL_PROVIDER, MODEL_NAME } = nodejs.env;
const DEFAULT_MODEL_PROVIDER = "openai";

export async function loadModel(
  models: LoadableModel[],
  model?: Camelize<z.infer<typeof aigneFileSchema>["model"]>,
  modelOptions?: ChatModelOptions,
  accessKeyOptions?: { accessKey?: string; url?: string },
): Promise<ChatModel | undefined> {
  const params = {
    model: MODEL_NAME ?? model?.name ?? undefined,
    temperature: model?.temperature ?? undefined,
    topP: model?.topP ?? undefined,
    frequencyPenalty: model?.frequencyPenalty ?? undefined,
    presencePenalty: model?.presencePenalty ?? undefined,
  };

  const providerName = MODEL_PROVIDER ?? model?.provider ?? DEFAULT_MODEL_PROVIDER;
  const provider = providerName.replace(/-/g, "");

  const m = models.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider.toLowerCase());
    }
    return m.name.some((n) => n.toLowerCase().includes(provider.toLowerCase()));
  });
  if (!m) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);

  return m.create({
    ...(accessKeyOptions || {}),
    model: params.model,
    modelOptions: { ...params, ...modelOptions },
  });
}

const aigneFileSchema = camelizeSchema(
  z.object({
    name: optionalize(z.string()),
    description: optionalize(z.string()),
    model: optionalize(
      z.union([
        z.string(),
        camelizeSchema(
          z.object({
            provider: z.string().nullish(),
            name: z.string().nullish(),
            temperature: z.number().min(0).max(2).nullish(),
            topP: z.number().min(0).nullish(),
            frequencyPenalty: z.number().min(-2).max(2).nullish(),
            presencePenalty: z.number().min(-2).max(2).nullish(),
          }),
        ),
      ]),
    ).transform((v) => (typeof v === "string" ? { name: v } : v)),
    agents: optionalize(z.array(z.string())),
    skills: optionalize(z.array(z.string())),
    mcpServer: optionalize(
      z.object({
        agents: optionalize(z.array(z.string())),
      }),
    ),
    cli: optionalize(
      z.object({
        agents: optionalize(z.array(z.string())),
      }),
    ),
  }),
);

export async function loadAIGNEFile(path: string): Promise<{
  aigne: z.infer<typeof aigneFileSchema>;
  rootDir: string;
}> {
  const file = await findAIGNEFile(path);

  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(file, "utf8"),
    (error) => new Error(`Failed to load aigne.yaml from ${file}: ${error.message}`),
  );

  const json = tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse aigne.yaml from ${file}: ${error.message}`),
  );

  const aigne = tryOrThrow(
    () =>
      aigneFileSchema.parse({ ...json, model: json.model ?? json.chat_model ?? json.chatModel }),
    (error) => new Error(`Failed to validate aigne.yaml from ${file}: ${error.message}`),
  );

  return { aigne, rootDir: nodejs.path.dirname(file) };
}

async function findAIGNEFile(path: string): Promise<string> {
  const possibleFiles = AIGNE_FILE_NAME.includes(nodejs.path.basename(path))
    ? [path]
    : AIGNE_FILE_NAME.map((name) => nodejs.path.join(path, name));

  for (const file of possibleFiles) {
    try {
      const stat = await nodejs.fs.stat(file);

      if (stat.isFile()) return file;
    } catch {}
  }

  throw new Error(
    `aigne.yaml not found in ${path}. Please ensure you are in the correct directory or provide a valid path.`,
  );
}
