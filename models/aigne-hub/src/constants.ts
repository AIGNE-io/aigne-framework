import type { Agent } from "node:https";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { ClientOptions } from "openai";
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
