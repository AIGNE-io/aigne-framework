import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { z } from "zod";
import { Agent, type AgentHooks, type AgentOptions, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import type { ChatModel } from "../agents/chat-model.js";
import { ImageAgent } from "../agents/image-agent.js";
import type { ImageModel } from "../agents/image-model.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { TeamAgent } from "../agents/team-agent.js";
import { TransformAgent } from "../agents/transform-agent.js";
import type { AIGNEOptions } from "../aigne/aigne.js";
import type { MemoryAgent, MemoryAgentOptions } from "../memory/memory.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { ChatMessagesTemplate, parseChatMessages } from "../prompt/template.js";
import { flat, isNonNullable, type PromiseOrValue, tryOrThrow } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { type HooksSchema, loadAgentFromYamlFile, type NestAgentSchema } from "./agent-yaml.js";
import { camelizeSchema, chatModelSchema, imageModelSchema, optionalize } from "./schema.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

export interface LoadOptions {
  memories?: { new (parameters?: MemoryAgentOptions): MemoryAgent }[];
  model?:
    | ChatModel
    | ((model?: z.infer<typeof aigneFileSchema>["model"]) => PromiseOrValue<ChatModel | undefined>);
  imageModel?:
    | ImageModel
    | ((
        model?: z.infer<typeof aigneFileSchema>["imageModel"],
      ) => PromiseOrValue<ImageModel | undefined>);
}

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  const { aigne, rootDir } = await loadAIGNEFile(path);

  const allAgentPaths = new Set(
    flat(
      aigne.agents,
      aigne.skills,
      aigne.mcpServer?.agents,
      aigne.cli?.agents,
      aigne.cli?.chat,
    ).map((i) => nodejs.path.join(rootDir, i)),
  );

  const allAgents: { [path: string]: Agent } = {};

  for (const path of allAgentPaths) {
    allAgents[path] = await loadAgent(path, options);
  }

  const pickAgents = (paths: string[]) =>
    paths.map((filename) => allAgents[nodejs.path.join(rootDir, filename)]).filter(isNonNullable);

  return {
    ...aigne,
    rootDir,
    model: typeof options.model === "function" ? await options.model(aigne.model) : options.model,
    imageModel:
      typeof options.imageModel === "function"
        ? await options.imageModel(aigne.imageModel)
        : options.imageModel,
    agents: pickAgents(aigne.agents ?? []),
    skills: pickAgents(aigne.skills ?? []),
    mcpServer: {
      agents: pickAgents(aigne.mcpServer?.agents ?? []),
    },
    cli: {
      chat: aigne.cli?.chat ? pickAgents([aigne.cli.chat])[0] : undefined,
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
        priority: hook.priority,
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

  const model =
    agent.model && typeof options?.model === "function"
      ? await options.model(agent.model)
      : undefined;
  const imageModel =
    agent.imageModel && typeof options?.imageModel === "function"
      ? await options.imageModel(agent.imageModel)
      : undefined;

  const baseOptions: AgentOptions<any, any> = {
    ...agentOptions,
    ...agent,
    model,
    imageModel,
    skills,
    memory,
    hooks: [
      ...((await parseHooks(path, agent.hooks, options)) ?? []),
      ...[agentOptions?.hooks].flat().filter(isNonNullable),
    ],
  };

  let instructions: PromptBuilder | undefined;
  if ("instructions" in agent && agent.instructions) {
    instructions = new PromptBuilder({
      instructions: ChatMessagesTemplate.from(
        parseChatMessages(
          agent.instructions.map((i) => ({
            ...i,
            options: { workingDir: nodejs.path.dirname(i.path) },
          })),
        ),
      ),
    });
  }

  switch (agent.type) {
    case "ai": {
      return AIAgent.from({
        ...baseOptions,
        instructions,
      });
    }
    case "image": {
      if (!instructions)
        throw new Error(`Missing required instructions for image agent at path: ${path}`);

      return ImageAgent.from({
        ...baseOptions,
        instructions,
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

const aigneFileSchema = camelizeSchema(
  z.object({
    name: optionalize(z.string()),
    description: optionalize(z.string()),
    model: optionalize(chatModelSchema),
    imageModel: optionalize(imageModelSchema),
    agents: optionalize(z.array(z.string())),
    skills: optionalize(z.array(z.string())),
    mcpServer: optionalize(
      z.object({
        agents: optionalize(z.array(z.string())),
      }),
    ),
    cli: optionalize(
      z.object({
        chat: optionalize(z.string()),
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
      aigneFileSchema.parse({ ...json, model: json.model || json.chatModel || json.chat_model }),
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
