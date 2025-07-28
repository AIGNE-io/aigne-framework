import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";

const DOUBAO_DEFAULT_CHAT_MODEL = "doubao-seed-1-6-250615";
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

/**
 * Implementation of the ChatModel interface for Doubao's API
 *
 * This model uses OpenAI-compatible API format to interact with Doubao's models,
 * but with specific configuration and capabilities for Doubao.
 *
 * Default model: 'doubao-seed-1-6-250615'
 *
 * @example
 * Here's how to create and use a Doubao chat model:
 * {@includeCode ../test/doubao-chat-model.test.ts#example-doubao-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/doubao-chat-model.test.ts#example-doubao-chat-model-streaming}
 */
export class DoubaoChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || DOUBAO_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || DOUBAO_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "DOUBAO_API_KEY";
}
