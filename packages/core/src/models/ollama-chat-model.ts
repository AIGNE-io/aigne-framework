import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OLLAMA_DEFAULT_BASE_URL = "http://localhost:11434/v1";
const OLLAMA_DEFAULT_CHAT_MODEL = "llama3.2";

export class OllamaChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OLLAMA_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_BASE_URL,
    });
  }

  protected apiKeyEnvName = "OLLAMA_API_KEY";
  protected apiKeyDefault = "ollama";
}
