import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const XAI_DEFAULT_CHAT_MODEL = "grok-2-latest";
const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAIChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || XAI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || XAI_BASE_URL,
    });
  }

  protected apiKeyEnvName = "XAI_API_KEY";
}
