import OpenAI from "openai";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const OPEN_ROUTER_DEFAULT_CHAT_MODEL = "openai/gpt-4o";
const OPEN_ROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || OPEN_ROUTER_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || OPEN_ROUTER_BASE_URL,
    });
  }

  override get client() {
    const apiKey = this.options?.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for OpenRouterChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL || OPEN_ROUTER_BASE_URL,
      apiKey,
    });
    return this._client;
  }
}
