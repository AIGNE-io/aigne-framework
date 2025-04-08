import { z } from "zod";

import OpenAI from "openai";
import {
  OpenAIChatModel,
  type OpenAIChatModelOptions,
  openAIChatModelOptionsSchema,
} from "./openai-chat-model.js";

const OLLAMA_BASE_URL = "http://localhost:11434/v1";
const OLLAMA_API_KEY = "ollama";

export type OllamaChatModelOptions = Omit<OpenAIChatModelOptions, "model"> & {
  model: string;
};

export const ollamaChatModelOptionsSchema = openAIChatModelOptionsSchema.extend({
  model: z.string(),
});

export class OllamaChatModel extends OpenAIChatModel {
  constructor(options: OllamaChatModelOptions) {
    super({
      ...options,
      baseURL: options?.baseURL || OLLAMA_BASE_URL,
      apiKey: options?.apiKey || OLLAMA_API_KEY,
    });
  }

  override get client() {
    const model = this.options?.model;
    if (!model) throw new Error("Model is required for OllamaChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL,
      apiKey: this.options?.apiKey,
    });
    return this._client;
  }
}
