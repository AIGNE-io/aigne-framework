import OpenAI from "openai";
import { OpenAIBaseModel, type OpenAIBaseModelOptions } from "./openai-base-model.js";

const XAI_DEFAULT_CHAT_MODEL = "grok-2-latest";
const XAI_BASE_URL = "https://api.x.ai/v1";

export class XAIChatModel extends OpenAIBaseModel {
  constructor(options?: OpenAIBaseModelOptions) {
    super({
      ...options,
      name: "XAIChatModel",
      model: options?.model || XAI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || XAI_BASE_URL,
    });
  }

  override get client() {
    const apiKey = this.options?.apiKey || process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for XAIChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL,
      apiKey,
    });
    return this._client;
  }
}
