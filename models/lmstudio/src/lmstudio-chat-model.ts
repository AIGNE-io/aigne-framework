import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";

const LM_STUDIO_DEFAULT_BASE_URL = "http://localhost:1234/v1";
const LM_STUDIO_DEFAULT_CHAT_MODEL = "llama-3.2-3b-instruct";

/**
 * Implementation of the ChatModel interface for LM Studio
 *
 * This model allows you to run local LLMs through LM Studio,
 * with an OpenAI-compatible API interface.
 *
 * Default model: 'llama-3.2-3b-instruct'
 *
 * @example
 * Here's how to create and use an LM Studio chat model:
 * {@includeCode ../test/lmstudio-chat-model.test.ts#example-lmstudio-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/lmstudio-chat-model.test.ts#example-lmstudio-chat-model-streaming}
 */
export class LMStudioChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || LM_STUDIO_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || process.env.LM_STUDIO_BASE_URL || LM_STUDIO_DEFAULT_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "LM_STUDIO_API_KEY";
  protected override apiKeyDefault = "not-required";

  protected override supportsNativeStructuredOutputs = false;
  protected override supportsTemperature = true;
}
