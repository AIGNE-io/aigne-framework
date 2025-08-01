import type { Agent } from "node:https";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type { ChatModel, ChatModelOptions } from "@aigne/core/agents/chat-model.js";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import camelize from "camelize-ts";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { ClientOptions } from "openai";
import { type ZodType, z } from "zod";
import { CliAIGNEHubChatModel } from "./cli-aigne-hub-model.js";

export function availableModels(): LoadableModel[] {
  const proxy = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"]
    .map((i) => process.env[i])
    .filter(Boolean)[0];

  const httpAgent = proxy ? (new HttpsProxyAgent(proxy) as Agent) : undefined;
  const clientOptions: ClientOptions = {
    fetchOptions: {
      // @ts-ignore
      agent: httpAgent,
    },
  };

  return [
    {
      name: OpenAIChatModel.name,
      apiKeyEnvName: "OPENAI_API_KEY",
      create: (params) => new OpenAIChatModel({ ...params, clientOptions }),
    },
    {
      name: AnthropicChatModel.name,
      apiKeyEnvName: "ANTHROPIC_API_KEY",
      create: (params) => new AnthropicChatModel({ ...params, clientOptions }),
    },
    {
      name: BedrockChatModel.name,
      apiKeyEnvName: "AWS_ACCESS_KEY_ID",
      create: (params) =>
        new BedrockChatModel({
          ...params,
          clientOptions: {
            requestHandler: NodeHttpHandler.create({ httpAgent, httpsAgent: httpAgent }),
            streamCollector,
          },
        }),
    },
    {
      name: DeepSeekChatModel.name,
      apiKeyEnvName: "DEEPSEEK_API_KEY",
      create: (params) => new DeepSeekChatModel({ ...params, clientOptions }),
    },
    {
      name: [GeminiChatModel.name, "google"],
      apiKeyEnvName: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
      create: (params) => new GeminiChatModel({ ...params, clientOptions }),
    },
    {
      name: OllamaChatModel.name,
      apiKeyEnvName: "OLLAMA_API_KEY",
      create: (params) => new OllamaChatModel({ ...params, clientOptions }),
    },
    {
      name: OpenRouterChatModel.name,
      apiKeyEnvName: "OPEN_ROUTER_API_KEY",
      create: (params) => new OpenRouterChatModel({ ...params, clientOptions }),
    },
    {
      name: XAIChatModel.name,
      apiKeyEnvName: "XAI_API_KEY",
      create: (params) => new XAIChatModel({ ...params, clientOptions }),
    },
    {
      name: CliAIGNEHubChatModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new CliAIGNEHubChatModel({ ...params, clientOptions }),
    },
  ];
}

export function findModel(models: LoadableModel[], provider: string) {
  return models.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider);
    }
    return m.name.some((n) => n.toLowerCase().includes(provider));
  });
}

const { MODEL_PROVIDER, MODEL_NAME } = nodejs.env;
const DEFAULT_MODEL_PROVIDER = "openai";

function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}

function isRecord<T>(value: unknown): value is Record<string, T> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function camelizeSchema<T extends ZodType>(
  schema: T,
  { shallow = true }: { shallow?: boolean } = {},
): T {
  return z.preprocess((v) => (isRecord(v) ? camelize(v, shallow) : v), schema) as unknown as T;
}

const model = optionalize(
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
).transform((v) => (typeof v === "string" ? { name: v } : v));

type Model = z.infer<typeof model>;

export async function loadModel(
  model?: Model,
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

  const m = findModel(availableModels(), provider);
  if (!m) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);

  return m.create({
    ...(accessKeyOptions || {}),
    model: params.model,
    modelOptions: { ...params, ...modelOptions },
  });
}
