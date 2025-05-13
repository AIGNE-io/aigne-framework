import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

/**
 * Implementation of the ChatModel interface for DeepSeek's API
 *
 * This model uses OpenAI-compatible API format to interact with DeepSeek's models,
 * but with specific configuration and capabilities for DeepSeek.
 *
 * Default model: 'deepseek-chat'
 *
 * @example
 * Here's how to create and use a DeepSeek chat model:
 * {@includeCode ../../test/models/deepseek-chat-model.test.ts#example-deepseek-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../../test/models/deepseek-chat-model.test.ts#example-deepseek-chat-model-streaming}
 */
export class DeepSeekChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || DEEPSEEK_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || DEEPSEEK_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "DEEPSEEK_API_KEY";
  protected override supportsNativeStructuredOutputs = false;
  protected override supportsToolsEmptyParameters = false;
}
