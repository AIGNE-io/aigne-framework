import type { Agent } from "node:https";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type { ChatModel, ChatModelOptions, ImageModel, ImageModelOptions } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { DoubaoChatModel } from "@aigne/doubao";
import { GeminiChatModel, GeminiImageModel, type GeminiImageModelInput } from "@aigne/gemini";
import { IdeogramImageModel, type IdeogramImageModelInput } from "@aigne/ideogram";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import {
  OpenAIChatModel,
  type OpenAIChatModelOptions,
  OpenAIImageModel,
  type OpenAIImageModelInput,
} from "@aigne/openai";
import { PoeChatModel } from "@aigne/poe";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import { AIGNEHubChatModel } from "../aigne-hub-model.js";

const getClientOptions = () => {
  const proxy = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"]
    .map((i) => process.env[i])
    .filter(Boolean)[0];

  const httpAgent = proxy ? (new HttpsProxyAgent(proxy) as Agent) : undefined;
  const clientOptions: OpenAIChatModelOptions["clientOptions"] = {
    fetchOptions: {
      // @ts-ignore
      agent: httpAgent,
    },
  };

  return {
    clientOptions,
    httpAgent,
  };
};
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

export function availableModels(): LoadableModel[] {
  const { clientOptions, httpAgent } = getClientOptions();

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
      name: DoubaoChatModel.name,
      apiKeyEnvName: "DOUBAO_API_KEY",
      create: (params) => new DoubaoChatModel({ ...params, clientOptions }),
    },
    {
      name: PoeChatModel.name,
      apiKeyEnvName: "POE_API_KEY",
      create: (params) => new PoeChatModel({ ...params, clientOptions }),
    },
    {
      name: AIGNEHubChatModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new AIGNEHubChatModel({ ...params, clientOptions }),
    },
  ];
}

export interface LoadableImageModel {
  name: string;
  apiKeyEnvName: string;
  create: (options: { model?: string; modelOptions?: ImageModelOptions }) => ImageModel;
}

export function availableImageModels(): LoadableImageModel[] {
  const { clientOptions } = getClientOptions();

  return [
    {
      name: OpenAIImageModel.name,
      apiKeyEnvName: "OPENAI_API_KEY",
      create: (params) =>
        new OpenAIImageModel({
          model: params.model,
          clientOptions,
          ...(params.modelOptions && {
            modelOptions: params.modelOptions as Partial<OpenAIImageModelInput["modelOptions"]>,
          }),
        }),
    },
    {
      name: GeminiImageModel.name,
      apiKeyEnvName: "GEMINI_API_KEY",
      create: (params) =>
        new GeminiImageModel({
          ...params,
          clientOptions,
          ...(params.modelOptions && {
            modelOptions: params.modelOptions as Partial<GeminiImageModelInput["modelOptions"]>,
          }),
        }),
    },
    {
      name: IdeogramImageModel.name,
      apiKeyEnvName: "IDEOGRAM_API_KEY",
      create: (params) =>
        new IdeogramImageModel({
          ...params,
          modelOptions: params.modelOptions as Partial<IdeogramImageModelInput["modelOptions"]>,
        }),
    },
  ];
}

export function findModel(provider: string): {
  all: LoadableModel[];
  match: LoadableModel | undefined;
} {
  provider = provider.toLowerCase().replace(/-/g, "");

  const all = availableModels();

  const match = all.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider);
    }

    return m.name.some((n) => n.toLowerCase().includes(provider));
  });

  return { all, match };
}
