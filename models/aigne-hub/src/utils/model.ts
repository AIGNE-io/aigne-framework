import type { Agent } from "node:https";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type {
  ChatModel,
  ChatModelInputOptions,
  ImageModel,
  ImageModelInputOptions,
  VideoModel,
} from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { DoubaoChatModel, DoubaoImageModel } from "@aigne/doubao";
import { GeminiChatModel, GeminiImageModel, GeminiVideoModel } from "@aigne/gemini";
import { IdeogramImageModel } from "@aigne/ideogram";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import {
  OpenAIChatModel,
  type OpenAIChatModelOptions,
  OpenAIImageModel,
  OpenAIVideoModel,
} from "@aigne/openai";
import { PoeChatModel } from "@aigne/poe";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import { AIGNEHubImageModel } from "../aigne-hub-image-model.js";
import { AIGNEHubChatModel } from "../aigne-hub-model.js";
import { AIGNEHubVideoModel } from "../aigne-hub-video-model.js";

const getClientOptions = () => {
  const proxy = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"]
    .map((i) => process.env[i])
    .filter(Boolean)[0];

  const httpAgent = proxy ? (new HttpsProxyAgent(proxy) as Agent) : undefined;
  const clientOptions: Pick<
    NonNullable<OpenAIChatModelOptions["clientOptions"]>,
    "fetchOptions"
  > = {
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

const GOOGLE = "google";

export interface LoadableModel {
  name: string | string[];
  apiKeyEnvName?: string | string[];
  create: (options: {
    model?: string;
    modelOptions?: ChatModelInputOptions;
    apiKey?: string;
    baseURL?: string;
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
      name: [GeminiChatModel.name, GOOGLE],
      apiKeyEnvName: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
      create: (params) =>
        new GeminiChatModel({
          ...params,
          clientOptions: { httpOptions: clientOptions.fetchOptions },
        }),
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
  name: string | string[];
  apiKeyEnvName: string;
  create: (options: {
    apiKey?: string;
    baseURL?: string;
    model?: string;
    modelOptions?: ImageModelInputOptions;
  }) => ImageModel;
}

export interface LoadableVideoModel {
  name: string | string[];
  apiKeyEnvName: string;
  create: (options: {
    apiKey?: string;
    baseURL?: string;
    model?: string;
    modelOptions?: { [key: string]: any };
  }) => VideoModel;
}

export function availableImageModels(): LoadableImageModel[] {
  const { clientOptions } = getClientOptions();

  return [
    {
      name: OpenAIImageModel.name,
      apiKeyEnvName: "OPENAI_API_KEY",
      create: (params) => new OpenAIImageModel({ ...params, clientOptions }),
    },
    {
      name: [GeminiImageModel.name, GOOGLE],
      apiKeyEnvName: "GEMINI_API_KEY",
      create: (params) => new GeminiImageModel({ ...params, clientOptions }),
    },
    {
      name: IdeogramImageModel.name,
      apiKeyEnvName: "IDEOGRAM_API_KEY",
      create: (params) => new IdeogramImageModel({ ...params }),
    },
    {
      name: DoubaoImageModel.name,
      apiKeyEnvName: "DOUBAO_API_KEY",
      create: (params) => new DoubaoImageModel({ ...params, clientOptions }),
    },
    {
      name: AIGNEHubImageModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new AIGNEHubImageModel({ ...params, clientOptions }),
    },
  ];
}

export function availableVideoModels(): LoadableVideoModel[] {
  const { clientOptions } = getClientOptions();

  return [
    {
      name: OpenAIVideoModel.name,
      apiKeyEnvName: "OPENAI_API_KEY",
      create: (params) => new OpenAIVideoModel({ ...params, clientOptions }) as VideoModel,
    },
    {
      name: [GeminiVideoModel.name, GOOGLE],
      apiKeyEnvName: "GEMINI_API_KEY",
      create: (params) => new GeminiVideoModel({ ...params, clientOptions }) as VideoModel,
    },
    {
      name: AIGNEHubVideoModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new AIGNEHubVideoModel({ ...params, clientOptions }) as VideoModel,
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

export function findImageModel(provider: string): {
  all: LoadableImageModel[];
  match: LoadableImageModel | undefined;
} {
  provider = provider.toLowerCase().replace(/-/g, "");

  const all = availableImageModels();

  const match = all.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider);
    }

    return m.name.some((n) => n.toLowerCase().includes(provider));
  });

  return { all, match };
}

export function findVideoModel(provider: string): {
  all: LoadableVideoModel[];
  match: LoadableVideoModel | undefined;
} {
  provider = provider.toLowerCase().replace(/-/g, "");

  const all = availableVideoModels();

  const match = all.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider);
    }

    return m.name.some((n) => n.toLowerCase().includes(provider));
  });

  return { all, match };
}

export const parseModel = (model: string) => {
  // replace first ':' with '/' to compatible with `provider:model-name` format
  model = model.replace(/^([\w-]+)(:)/, "$1/");
  const { provider, name } = model.match(/(?<provider>[^/]*)(\/(?<name>.*))?/)?.groups ?? {};
  return { provider: provider?.replace(/-/g, ""), model: name };
};
