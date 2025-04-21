import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OPEN_ROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPEN_ROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OPEN_ROUTER_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OPEN_ROUTER_BASE_URL,
    });
  }

  protected apiKeyEnvName = "OPEN_ROUTER_API_KEY";
  protected supportsParallelToolCalls = false;
}
