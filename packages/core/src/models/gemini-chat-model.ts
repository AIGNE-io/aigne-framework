import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

/**
 * Implementation of the ChatModel interface for Google's Gemini API
 *
 * This model uses OpenAI-compatible API format to interact with Google's Gemini models,
 * providing access to models like Gemini 1.5 and Gemini 2.0.
 *
 * @example
 * Here's how to create and use a Gemini chat model:
 * {@includeCode ../../test/models/gemini-chat-model.test.ts#example-gemini-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../../test/models/gemini-chat-model.test.ts#example-gemini-chat-model-streaming}
 */
export class GeminiChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || GEMINI_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "GEMINI_API_KEY";
  protected override supportsEndWithSystemMessage = false;
  protected override supportsToolsUseWithJsonSchema = false;
  protected override supportsParallelToolCalls = false;
}
