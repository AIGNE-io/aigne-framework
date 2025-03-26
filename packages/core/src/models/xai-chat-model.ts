import type { ChatModelOptions } from "./chat-model.js";
import { OpenAIChatModel } from "./openai-chat-model.js";

const XAI_DEFAULT_CHAT_MODEL = "grok-2-latest";
const XAI_BASE_URL = "https://api.x.ai/v1";

export interface XAIChatModelOptions {
  apiKey?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
  baseURL?: string;
}

export class XAIChatModel extends OpenAIChatModel {
  constructor(public options?: XAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || XAI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || XAI_BASE_URL,
    });
  }
}
