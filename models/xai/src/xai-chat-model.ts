import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";

const XAI_DEFAULT_CHAT_MODEL = "grok-4-latest";
const XAI_BASE_URL = "https://api.x.ai/v1";

/**
 * Implementation of the ChatModel interface for X.AI's API (Grok)
 *
 * This model uses OpenAI-compatible API format to interact with X.AI models,
 * providing access to models like Grok.
 *
 * Default model: 'grok-2-latest'
 *
 * @example
 * Here's how to create and use an X.AI chat model:
 * {@includeCode ../test/xai-chat-model.test.ts#example-xai-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/xai-chat-model.test.ts#example-xai-chat-model-streaming}
 */
export class XAIChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || XAI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || XAI_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "XAI_API_KEY";

  protected override supportsToolStreaming = false;
}
