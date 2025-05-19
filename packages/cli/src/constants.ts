import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";
import pkg from "../package.json" with { type: "json" };

export const AIGNE_CLI_VERSION = pkg.version;

export const availableModels = [
  OpenAIChatModel,
  AnthropicChatModel,
  BedrockChatModel,
  DeepSeekChatModel,
  GeminiChatModel,
  OllamaChatModel,
  OpenRouterChatModel,
  XAIChatModel,
];
