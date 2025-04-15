import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import { type Agent, FunctionAgent } from "../agents/agent.js";
import { AIAgent } from "../agents/ai-agent.js";
import { MCPAgent } from "../agents/mcp-agent.js";
import type { ChatModel } from "../models/chat-model.js";
import { ClaudeChatModel } from "../models/claude-chat-model.js";
import { OpenAIChatModel } from "../models/openai-chat-model.js";
import { XAIChatModel } from "../models/xai-chat-model.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { loadAgentFromJsFile } from "./agent-js.js";
import { loadAgentFromYamlFile } from "./agent-yaml.js";

const DEFAULT_MODEL_PROVIDER = "openai";

const AIGNE_FILE_NAME = ["aigne.yaml", "aigne.yml"];

export interface LoadOptions {
  path: string;
}

export async function load(options: LoadOptions) {
  const { path } = options;

  const aigneFilePath = await getAIGNEFilePath(path);
  const rootDir = dirname(aigneFilePath);

  const aigne = await loadAIGNEFile(aigneFilePath);

  const agents = await Promise.all(
    (aigne.agents ?? []).map((filename) => loadAgent(join(rootDir, filename))),
  );
  const tools = await Promise.all(
    (aigne.tools ?? []).map((filename) => loadAgent(join(rootDir, filename))),
  );

  return {
    ...aigne,
    model: await loadModel(aigne.chat_model),
    agents,
    tools,
  };
}

export async function loadAgent(path: string): Promise<Agent> {
  if (extname(path) === ".js") {
    const agent = await loadAgentFromJsFile(path);
    return FunctionAgent.from({
      name: agent.name,
      description: agent.description,
      inputSchema: agent.input_schema,
      outputSchema: agent.output_schema,
      fn: agent.fn,
    });
  }

  if (extname(path) === ".yaml" || extname(path) === ".yml") {
    const agent = await loadAgentFromYamlFile(path);
    if (agent.type === "ai") {
      return AIAgent.from({
        name: agent.name,
        description: agent.description,
        instructions: agent.instructions,
        inputSchema: agent.input_schema,
        outputSchema: agent.output_schema,
        outputKey: agent.output_key,
        tools: await Promise.all(
          (agent.tools ?? []).map((filename) => loadAgent(join(dirname(path), filename))),
        ),
        toolChoice: agent.tool_choice,
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

async function loadModel(
  model: z.infer<typeof aigneFileSchema>["chat_model"],
): Promise<ChatModel | undefined> {
  if (!model?.name) return undefined;

  const params = {
    model: model.name,
    temperature: model.temperature ?? undefined,
    topP: model.top_p ?? undefined,
    frequencyPenalty: model.frequent_penalty ?? undefined,
    presencePenalty: model.presence_penalty ?? undefined,
  };

  const availableModels = [OpenAIChatModel, ClaudeChatModel, XAIChatModel];
  const M = availableModels.find((m) =>
    m.name.toLowerCase().includes(model.provider || DEFAULT_MODEL_PROVIDER),
  );
  if (!M) throw new Error(`Unsupported model: ${model.provider} ${model.name}`);
  return new M(params);
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
        frequent_penalty: z.number().min(-2).max(2).nullish(),
        presence_penalty: z.number().min(-2).max(2).nullish(),
      }),
    ])
    .nullish()
    .transform((v) => (typeof v === "string" ? { name: v } : v)),
  agents: z.array(z.string()).nullish(),
  tools: z.array(z.string()).nullish(),
});

export async function loadAIGNEFile(path: string) {
  const raw = await tryOrThrow(
    () => readFile(path, "utf8"),
    (error) => new Error(`Failed to load aigne.yaml from ${path}: ${error.message}`),
  );

  const json = await tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse aigne.yaml from ${path}: ${error.message}`),
  );

  const agent = tryOrThrow(
    () => aigneFileSchema.parse(json),
    (error) => new Error(`Failed to validate aigne.yaml from ${path}: ${error.message}`),
  );

  return agent;
}

async function getAIGNEFilePath(path: string) {
  const s = await stat(path);

  if (s.isDirectory()) {
    for (const file of AIGNE_FILE_NAME) {
      const filePath = join(path, file);
      if ((await stat(filePath)).isFile()) return filePath;
    }
  }

  return path;
}
