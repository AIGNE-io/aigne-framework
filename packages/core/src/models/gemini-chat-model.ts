import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

export class GeminiChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || GEMINI_BASE_URL,
    });
  }

  protected apiKeyEnvName = "GEMINI_API_KEY";
  protected supportsEndWithSystemMessage = false;
  protected supportsToolsUseWithJsonSchema = false;
  protected supportsParallelToolCalls = false;
  protected supportsToolStreaming = false;
}
