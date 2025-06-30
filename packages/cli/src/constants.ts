import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
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
import pkg from "../package.json" with { type: "json" };

export const AIGNE_CLI_VERSION = pkg.version;

export function availableModels(): LoadableModel[] {
  const proxy = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy", "ALL_PROXY", "all_proxy"]
    .map((i) => process.env[i])
    .filter(Boolean)[0];

  const httpAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

  return [
    {
      name: OpenAIChatModel.name,
      create: (params) => new OpenAIChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: AnthropicChatModel.name,
      create: (params) => new AnthropicChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: BedrockChatModel.name,
      create: (params) =>
        new BedrockChatModel({
          ...params,
          clientOptions: {
            requestHandler: NodeHttpHandler.create({
              httpAgent,
              httpsAgent: httpAgent,
            }),
            streamCollector,
          },
        }),
    },
    {
      name: DeepSeekChatModel.name,
      create: (params) => new DeepSeekChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: GeminiChatModel.name,
      create: (params) => new GeminiChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: OllamaChatModel.name,
      create: (params) => new OllamaChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: OpenRouterChatModel.name,
      create: (params) => new OpenRouterChatModel({ ...params, clientOptions: { httpAgent } }),
    },
    {
      name: XAIChatModel.name,
      create: (params) => new XAIChatModel({ ...params, clientOptions: { httpAgent } }),
    },
  ];
}

export const availableMemories = [DefaultMemory];
