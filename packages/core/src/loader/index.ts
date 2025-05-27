import type { Camelize } from "camelize-ts";
import { parse } from "yaml";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import type { ChatModel, ChatModelOptions } from "../agents/chat-model.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import { nodejs } from "../utils/nodejs.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { loadAgentFromYamlFile } from "./agent-yaml.js";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

export interface LoadOptions {
  models: { new (parameters: { model?: string; modelOptions?: ChatModelOptions }): ChatModel }[];
  path: string;
}

export async function load(options: LoadOptions) {
  const aigneFilePath = await getAIGNEFilePath(options.path);
  const rootDir = nodejs.path.dirname(aigneFilePath);

  const aigne = await loadAIGNEFile(aigneFilePath);

  const agents = await Promise.all(
    (aigne.agents ?? []).map((filename) => loadAgent(nodejs.path.join(rootDir, filename))),
  );
  const skills = await Promise.all(
    (aigne.skills ?? []).map((filename) => loadAgent(nodejs.path.join(rootDir, filename))),
  );

  return {
    ...aigne,
    model: await loadModel(options.models, aigne.chat_model),
    agents,
    skills,
  };
}

export async function loadAgent(path: string): Promise<Agent> {
  if (nodejs.path.extname(path) === ".js") {
    const agent = await loadAgentFromJsFile(path);
    return FunctionAgent.from(agent);
  }

  if (nodejs.path.extname(path) === ".yaml" || nodejs.path.extname(path) === ".yml") {
    const agent = await loadAgentFromYamlFile(path);
    if (agent.type === "ai") {
      return AIAgent.from({
        ...agent,
        skills:
          agent.skills &&
          (await Promise.all(
            agent.skills.map((filename) =>
              loadAgent(nodejs.path.join(nodejs.path.dirname(path), filename)),
            ),
          )),
      });
    }
    if (agent.type === "mcp") {
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
  }

  throw new Error(`Unsupported agent file type: ${path}`);
}

const { MODEL_PROVIDER, MODEL_NAME } = process.env;
const DEFAULT_MODEL_PROVIDER = "openai";

export async function loadModel(
  models: LoadOptions["models"],
  model?: Camelize<z.infer<typeof aigneFileSchema>["chat_model"]>,
  modelOptions?: ChatModelOptions,
): Promise<ChatModel | undefined> {
  const params = {
    model: MODEL_NAME ?? model?.name ?? undefined,
    temperature: model?.temperature ?? undefined,
    topP: model?.topP ?? undefined,
    frequencyPenalty: model?.frequencyPenalty ?? undefined,
    presencePenalty: model?.presencePenalty ?? undefined,
  };

  const M = models.find((m) =>
    m.name
      .toLowerCase()
      .includes((MODEL_PROVIDER ?? model?.provider ?? DEFAULT_MODEL_PROVIDER).toLowerCase()),
  );
  if (!M) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);
  return new M({ model: params.model, modelOptions: { ...params, ...modelOptions } });
}

const aigneFileSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  chat_model: z
    .union([
      z.string(),
      z.object({
        provider: z.string().nullish(),
        name: z.string().nullish(),
        temperature: z.number().min(0).max(2).nullish(),
        top_p: z.number().min(0).nullish(),
        frequency_penalty: z.number().min(-2).max(2).nullish(),
        presence_penalty: z.number().min(-2).max(2).nullish(),
      }),
    ])
    .nullish()
    .transform((v) => (typeof v === "string" ? { name: v } : v)),
  agents: z.array(z.string()).nullish(),
  skills: z.array(z.string()).nullish(),
});

export async function loadAIGNEFile(path: string) {
  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(path, "utf8"),
    (error) => new Error(`Failed to load aigne.yaml from ${path}: ${error.message}`),
  );

  const json = await tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse aigne.yaml from ${path}: ${error.message}`),
  );

  const agent = tryOrThrow(
    () => aigneFileSchema.parse({ ...json, skills: json.skills ?? json.tools }),
    (error) => new Error(`Failed to validate aigne.yaml from ${path}: ${error.message}`),
  );

  return agent;
}

async function getAIGNEFilePath(path: string) {
  const s = await nodejs.fs.stat(path);

  if (s.isDirectory()) {
    for (const file of AIGNE_FILE_NAME) {
      const filePath = nodejs.path.join(path, file);
      if ((await nodejs.fs.stat(filePath)).isFile()) return filePath;
    }
  }

  return path;
}
