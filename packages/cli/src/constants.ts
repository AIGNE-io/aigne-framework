import type { Agent } from "node:https";
import { createRequire } from "node:module";
import { AgenticMemory } from "@aigne/agentic-memory";
import { AIGNEHubChatModel } from "@aigne/aigne-hub";
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { DefaultMemory } from "@aigne/default-memory";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";
import { NodeHttpHandler, streamCollector } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { ClientOptions } from "openai";

const require = createRequire(import.meta.url);

export const AIGNE_CLI_VERSION = require("../package.json").version;

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
      create: (params) => new OpenAIChatModel({ ...params, clientOptions }),
    },
    {
      name: AnthropicChatModel.name,
      create: (params) => new AnthropicChatModel({ ...params, clientOptions }),
    },
    {
      name: BedrockChatModel.name,
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
      create: (params) => new DeepSeekChatModel({ ...params, clientOptions }),
    },
    {
      name: GeminiChatModel.name,
      create: (params) => new GeminiChatModel({ ...params, clientOptions }),
    },
    {
      name: OllamaChatModel.name,
      create: (params) => new OllamaChatModel({ ...params, clientOptions }),
    },
    {
      name: OpenRouterChatModel.name,
      create: (params) => new OpenRouterChatModel({ ...params, clientOptions }),
    },
    {
      name: XAIChatModel.name,
      create: (params) => new XAIChatModel({ ...params, clientOptions }),
    },
    {
      name: AIGNEHubChatModel.name,
      create: (params) => new AIGNEHubChatModel({ ...params, clientOptions }),
    },
  ];
}

export const availableMemories = [DefaultMemory, AgenticMemory];
