import { ClaudeChatModel, type ClaudeChatModelOptions } from "../models/claude-chat-model.js";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "../models/openai-chat-model.js";
import { XAIChatModel, type XAIChatModelOptions } from "../models/xai-chat-model.js";

export type ModelProvider = "openai" | "anthropic" | "xai";

const { MODEL_PROVIDER = "openai", MODEL_NAME = "gpt-4o-mini" } = process.env;

export function createAdaptiveModel(
  provider?: ModelProvider | null,
  options?: OpenAIChatModelOptions | XAIChatModelOptions | ClaudeChatModelOptions,
) {
  const mergedProvider = provider ?? MODEL_PROVIDER;
  const mergedOptions = { model: MODEL_NAME, ...options };

  switch (mergedProvider) {
    case "openai":
      return new OpenAIChatModel(mergedOptions);
    case "anthropic":
      return new ClaudeChatModel(mergedOptions);
    case "xai":
      return new XAIChatModel(mergedOptions);
    default:
      throw new Error(`Unsupported model provider: ${mergedProvider}`);
  }
}
