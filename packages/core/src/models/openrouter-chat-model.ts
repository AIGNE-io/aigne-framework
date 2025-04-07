import { OpenAIBaseModel, type OpenAIBaseModelOptions } from "./openai-base-model.js";

const OPENROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterChatModel extends OpenAIBaseModel {
  constructor(options?: OpenAIBaseModelOptions) {
    super({
      ...options,
      name: "OpenRouterChatModel",
      model: options?.model || OPENROUTER_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OPENROUTER_BASE_URL,
    });
  }
}
