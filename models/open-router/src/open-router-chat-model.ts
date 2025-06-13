import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";

const OPEN_ROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPEN_ROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Implementation of the ChatModel interface for OpenRouter service
 *
 * OpenRouter provides access to a variety of large language models through a unified API.
 * This implementation uses the OpenAI-compatible interface to connect to OpenRouter's service.
 *
 * Default model: 'openai/gpt-4o'
 *
 * @example
 * Here's how to create and use an OpenRouter chat model:
 * {@includeCode ../test/open-router-chat-model.test.ts#example-openrouter-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/open-router-chat-model.test.ts#example-openrouter-chat-model-streaming}
 */
export class OpenRouterChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OPEN_ROUTER_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OPEN_ROUTER_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "OPEN_ROUTER_API_KEY";
  protected override supportsParallelToolCalls = false;
}
