import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { Camelize } from "camelize-ts";
import camelize from "camelize-ts";
import { parse } from "yaml";
import { z } from "zod";
import { Agent, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import type { ChatModel, ChatModelOptions } from "../agents/chat-model.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { TeamAgent } from "../agents/team-agent.js";
import { TransformAgent } from "../agents/transform-agent.js";
import type { AIGNEOptions } from "../aigne/aigne.js";
import type { MemoryAgent, MemoryAgentOptions } from "../memory/memory.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { loadAgentFromYamlFile } from "./agent-yaml.js";
import { optionalize } from "./schema.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

interface LoadableModelClass {
  new (parameters: { model?: string; modelOptions?: ChatModelOptions }): ChatModel;
}

export interface LoadableModel {
  name: string;
  create: (options: { model?: string; modelOptions?: ChatModelOptions }) => ChatModel;
}

export interface LoadOptions {
  models: (LoadableModel | LoadableModelClass)[];
  memories?: { new (parameters?: MemoryAgentOptions): MemoryAgent }[];
  path: string;
}

export async function load(options: LoadOptions): Promise<AIGNEOptions> {
  const { aigne, rootDir } = await loadAIGNEFile(options.path);

  const agents = await Promise.all(
    (aigne.agents ?? []).map((filename) => loadAgent(nodejs.path.join(rootDir, filename), options)),
  );
  const skills = await Promise.all(
    (aigne.skills ?? []).map((filename) => loadAgent(nodejs.path.join(rootDir, filename), options)),
  );

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
    agents,
    skills,
  };
}

export async function loadAgent(path: string, options?: LoadOptions): Promise<Agent> {
  if ([".js", ".mjs", ".ts", ".mts"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromJsFile(path);
    if (agent instanceof Agent) return agent;
    return FunctionAgent.from(agent);
  }

  if ([".yml", ".yaml"].includes(nodejs.path.extname(path))) {
    const agent = await loadAgentFromYamlFile(path);

    return parseAgent(path, agent, options);
  }

  throw new Error(`Unsupported agent file type: ${path}`);
}

async function parseAgent(
  path: string,
  agent: Awaited<ReturnType<typeof loadAgentFromYamlFile>>,
  options?: LoadOptions,
): Promise<Agent> {
  const skills =
    "skills" in agent
      ? agent.skills &&
        (await Promise.all(
          agent.skills.map((skill) =>
            typeof skill === "string"
              ? loadAgent(nodejs.path.join(nodejs.path.dirname(path), skill), options)
              : parseAgent(path, skill, options),
          ),
        ))
      : undefined;

  const memory =
    "memory" in agent && options?.memories?.length
      ? await loadMemory(
          options.memories,
          typeof agent.memory === "object" ? agent.memory.provider : undefined,
          typeof agent.memory === "object" ? agent.memory : {},
        )
      : undefined;

  switch (agent.type) {
    case "ai": {
      return AIAgent.from({
        ...agent,
        instructions:
          agent.instructions &&
          PromptBuilder.from(agent.instructions, { workingDir: nodejs.path.dirname(path) }),
        memory,
        skills,
      });
    }
    case "mcp": {
      if (agent.url) {
        return MCPAgent.from({
          url: agent.url,
        });
      }
      if (agent.command) {
        return MCPAgent.from({
          command: agent.command,
          args: agent.args,
        });
      }
      throw new Error(`Missing url or command in mcp agent: ${path}`);
    }
    case "team": {
      return TeamAgent.from({
        ...agent,
        memory,
        skills,
      });
    }
    case "transform": {
      return TransformAgent.from({
        ...agent,
        memory,
        skills,
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
): Promise<ChatModel | undefined> {
  const params = {
    model: MODEL_NAME ?? model?.name ?? undefined,
    temperature: model?.temperature ?? undefined,
    topP: model?.topP ?? undefined,
    frequencyPenalty: model?.frequencyPenalty ?? undefined,
    presencePenalty: model?.presencePenalty ?? undefined,
  };

  const m = models.find((m) =>
    m.name
      .toLowerCase()
      .includes((MODEL_PROVIDER ?? model?.provider ?? DEFAULT_MODEL_PROVIDER).toLowerCase()),
  );
  if (!m) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);
  return m.create({
    model: params.model,
    modelOptions: { ...params, ...modelOptions },
  });
}

const aigneFileSchema = z.object({
  name: optionalize(z.string()),
  description: optionalize(z.string()),
  model: optionalize(
    z.union([
      z.string(),
      z.object({
        provider: z.string().nullish(),
        name: z.string().nullish(),
        temperature: z.number().min(0).max(2).nullish(),
        topP: z.number().min(0).nullish(),
        frequencyPenalty: z.number().min(-2).max(2).nullish(),
        presencePenalty: z.number().min(-2).max(2).nullish(),
      }),
    ]),
  ).transform((v) => (typeof v === "string" ? { name: v } : v)),
  agents: optionalize(z.array(z.string())),
  skills: optionalize(z.array(z.string())),
});

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
    () => camelize(parse(raw)) as any,
    (error) => new Error(`Failed to parse aigne.yaml from ${file}: ${error.message}`),
  );

  const aigne = tryOrThrow(
    () =>
      aigneFileSchema.parse({
        ...json,
        model: json.model ?? json.chatModel,
        skills: json.skills ?? json.tools,
      }),
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
