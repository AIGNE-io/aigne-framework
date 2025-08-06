import type { Agent } from "node:https";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type { ChatModel, ChatModelOptions } from "@aigne/core/agents/chat-model.js";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { ClientOptions } from "openai";
import { joinURL } from "ufo";
import { CliAIGNEHubChatModel } from "./cli-aigne-hub-model.js";

const AIGNE_HUB_DID = "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ";
export const AIGNE_HUB_URL = "https://hub.aigne.io/";

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

export interface LoadableModel {
  name: string | string[];
  apiKeyEnvName?: string | string[];
  create: (options: {
    model?: string;
    modelOptions?: ChatModelOptions;
    apiKey?: string;
    url?: string;
  }) => ChatModel;
}

export function findModel(models: LoadableModel[], provider: string) {
  return models.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider.toLowerCase());
    }
    return m.name.some((n) => n.toLowerCase().includes(provider.toLowerCase()));
  });
}

const { MODEL_PROVIDER, MODEL_NAME } = nodejs.env;
const DEFAULT_MODEL_PROVIDER = "openai";

type Model =
  | {
      provider?: string | null;
      name?: string | null;
      temperature?: number | null;
      topP?: number | null;
      frequencyPenalty?: number | null;
      presencePenalty?: number | null;
    }
  | undefined;

export async function loadModel(
  model?: Model,
  modelOptions?: ChatModelOptions,
  credential?: { apiKey?: string; url?: string },
): Promise<ChatModel | undefined> {
  const params = {
    model: MODEL_NAME ?? model?.name ?? undefined,
    temperature: model?.temperature ?? undefined,
    topP: model?.topP ?? undefined,
    frequencyPenalty: model?.frequencyPenalty ?? undefined,
    presencePenalty: model?.presencePenalty ?? undefined,
  };

  const provider = (MODEL_PROVIDER ?? model?.provider ?? DEFAULT_MODEL_PROVIDER).replace(/-/g, "");

  const m = findModel(availableModels(), provider);
  if (!m) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);

  return m.create({
    ...(credential || {}),
    model: params.model,
    modelOptions: { ...params, ...modelOptions },
  });
}

export async function getAIGNEHubMountPoint(url: string) {
  const { origin } = new URL(url);
  const BLOCKLET_JSON_PATH = "__blocklet__.js?type=json";
  const blockletInfo = await fetch(joinURL(origin, BLOCKLET_JSON_PATH));
  const blocklet = await blockletInfo.json();
  const aigneHubMount = (blocklet?.componentMountPoints || []).find(
    (m: { did: string }) => m.did === AIGNE_HUB_DID,
  );

  return joinURL(origin, aigneHubMount?.mountPoint || "");
}
