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
import type inquirer from "inquirer";
import type { ClientOptions } from "openai";
import { AIGNEHubChatModel } from "../index.js";
import {
  AGENT_HUB_PROVIDER,
  DEFAULT_AIGNE_HUB_PROVIDER_MODEL,
  DEFAULT_MODEL_PROVIDER,
} from "./constants.js";
import { loadCredential } from "./credential.js";
import type { LoadableModel, LoadCredentialOptions, Model } from "./type.js";

const { MODEL_PROVIDER, MODEL_NAME } = nodejs.env;

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
      name: AIGNEHubChatModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new AIGNEHubChatModel({ ...params, clientOptions }),
    },
  ];
}

export function findModel(models: LoadableModel[], provider: string) {
  return models.find((m) => {
    if (typeof m.name === "string") {
      return m.name.toLowerCase().includes(provider.toLowerCase());
    }
    return m.name.some((n) => n.toLowerCase().includes(provider.toLowerCase()));
  });
}

export const parseModelOption = (model?: string) => {
  const { provider, name } =
    (model || process.env.MODEL)?.match(/(?<provider>[^:]*)(:(?<name>(\S+)))?/)?.groups ?? {};

  return { provider, name };
};

export const formatModelName = async (model: string, inquirerPrompt: typeof inquirer.prompt) => {
  const models = availableModels();
  if (!model) return DEFAULT_AIGNE_HUB_PROVIDER_MODEL;

  const { provider, name } = parseModelOption(model);

  if (!provider) {
    return DEFAULT_AIGNE_HUB_PROVIDER_MODEL;
  }

  const providerName = provider.replace(/-/g, "");
  if (providerName.includes(AGENT_HUB_PROVIDER)) {
    return model;
  }

  const m = findModel(models, providerName);
  if (!m) throw new Error(`Unsupported model: ${provider} ${name}`);

  const apiKeyEnvName = Array.isArray(m.apiKeyEnvName) ? m.apiKeyEnvName : [m.apiKeyEnvName];
  if (apiKeyEnvName.some((name) => name && process.env[name])) {
    return model;
  }

  const result = await inquirerPrompt({
    type: "list",
    name: "useAigneHub",
    message: `Seems no API Key configured for ${provider}/${name}, select your preferred way to continue:`,
    choices: [
      {
        name: `Connect to AIGNE Hub to use ${name} (Recommended since free credits available)`,
        value: true,
      },
      {
        name: `Exit and bring my owner API Key by set ${apiKeyEnvName.join(", ")}`,
        value: false,
      },
    ],
    default: true,
  });

  if (!result.useAigneHub) return model;

  return `${AGENT_HUB_PROVIDER}:${provider}/${name}`;
};

export async function loadModel(
  model?: Model,
  modelOptions?: ChatModelOptions,
  options?: LoadCredentialOptions,
): Promise<ChatModel | undefined> {
  const params = {
    model: MODEL_NAME ?? model?.name ?? undefined,
    temperature: model?.temperature ?? undefined,
    topP: model?.topP ?? undefined,
    frequencyPenalty: model?.frequencyPenalty ?? undefined,
    presencePenalty: model?.presencePenalty ?? undefined,
  };

  const provider = (MODEL_PROVIDER ?? model?.provider ?? DEFAULT_MODEL_PROVIDER).replace(/-/g, "");
  const models = availableModels();

  const m = findModel(models, provider);
  if (!m) throw new Error(`Unsupported model: ${model?.provider} ${model?.name}`);

  const credential = await loadCredential({ ...options, model: `${provider}:${params.model}` });

  return m.create({
    ...(credential || {}),
    model: params.model,
    modelOptions: { ...params, ...modelOptions },
  });
}
