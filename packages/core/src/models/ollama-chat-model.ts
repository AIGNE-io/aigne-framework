/**
 * @module core/models/OllamaChatModel
 */

import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OLLAMA_DEFAULT_BASE_URL = "http://localhost:11434/v1";
const OLLAMA_DEFAULT_CHAT_MODEL = "llama3.2";

/**
 * Implementation of the ChatModel interface for Ollama
 *
 * This model allows you to run open-source LLMs locally using Ollama,
 * with an OpenAI-compatible API interface.
 *
 * Default model: 'llama3.2'
 *
 * @example
 * Here's how to create and use an Ollama chat model:
 * {@includeCode ../../test/models/ollama-chat-model.test.ts#example-ollama-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../../test/models/ollama-chat-model.test.ts#example-ollama-chat-model-streaming}
 */
export class OllamaChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OLLAMA_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "OLLAMA_API_KEY";
  protected override apiKeyDefault = "ollama";
}
