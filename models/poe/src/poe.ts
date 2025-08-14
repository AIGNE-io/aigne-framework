import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";

const POE_DEFAULT_CHAT_MODEL = "gpt-5-mini";
const POE_BASE_URL = "https://api.poe.com/v1";

/**
 * Implementation of the ChatModel interface for Poe's API (Grok)
 *
 * This model uses OpenAI-compatible API format to interact with X.AI models,
 * providing access to models like Grok.
 *
 * Default model: 'grok-2-latest'
 *
 * @example
 * Here's how to create and use an Poe chat model:
 * {@includeCode ../test/poe-chat-model.test.ts#example-poe-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/poe-chat-model.test.ts#example-poe-chat-model-streaming}
 */
export class PoeChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || POE_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || POE_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "POE_API_KEY";
  protected override supportsParallelToolCalls = false;
}
