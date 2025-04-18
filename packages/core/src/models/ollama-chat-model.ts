import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OLLAMA_BASE_URL = "http://localhost:11434/v1";
const OLLAMA_DEFAULT_CHAT_MODEL = "llama3.2";
const OLLAMA_API_KEY = "ollama";

export class OllamaChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OLLAMA_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OLLAMA_BASE_URL,
      apiKey: options?.apiKey || OLLAMA_API_KEY,
    });
  }

  protected apiKeyEnvName = "OLLAMA_API_KEY";
}
