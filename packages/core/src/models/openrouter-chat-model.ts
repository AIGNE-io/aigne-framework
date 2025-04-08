import OpenAI from "openai";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OPENROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OPENROUTER_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OPENROUTER_BASE_URL,
    });
  }

  override get client() {
    const apiKey = this.options?.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for OpenRouterChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL,
      apiKey,
    });
    return this._client;
  }
}
