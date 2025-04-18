import OpenAI from "openai";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

export class GeminiChatModel extends OpenAIChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || GEMINI_BASE_URL,
    });
  }

  override get client() {
    const apiKey = this.options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for GeminiChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL || GEMINI_BASE_URL,
      apiKey,
    });
    return this._client;
  }

  supportsEndWithSystemMessage = false;
  supportsToolsUseWithJsonSchema = false;
  supportsParallelToolCalls = false;
}
