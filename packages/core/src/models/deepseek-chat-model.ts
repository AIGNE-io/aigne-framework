import { OpenAI } from "openai";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "./openai-chat-model.js";

const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekChatModel extends OpenAIChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || DEEPSEEK_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || DEEPSEEK_BASE_URL,
    });
  }

  get client() {
    const apiKey = this.options?.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error(`Api Key is required for ${this.name}`);

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL || DEEPSEEK_BASE_URL,
      apiKey,
    });
    return this._client;
  }

  supportsNativeStructuredOutputs = false;
  supportsToolsEmptyParameters = false;
}
