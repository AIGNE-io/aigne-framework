import OpenAI from "openai";
import { OpenAIBaseModel, type OpenAIBaseModelOptions } from "./openai-base-model.js";

const OPENROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterChatModel extends OpenAIBaseModel {
  constructor(options?: OpenAIBaseModelOptions) {
    super({
      ...options,
      name: "OpenRouterChatModel",
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
