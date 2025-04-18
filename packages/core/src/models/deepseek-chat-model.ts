import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || DEEPSEEK_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || DEEPSEEK_BASE_URL,
    });
  }

  protected apiKeyEnvName = "DEEPSEEK_API_KEY";
  protected supportsNativeStructuredOutputs = false;
  protected supportsToolsEmptyParameters = false;
}
