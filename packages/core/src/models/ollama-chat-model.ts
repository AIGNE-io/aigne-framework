import { z } from "zod";

import {
  OpenAIBaseModel,
  type OpenAIBaseModelOptions,
  openAIBaseModelOptionsSchema,
} from "./openai-base-model.js";

const OLLAMA_BASE_URL = "http://localhost:11434/v1";
const OLLAMA_API_KEY = "ollama";

export type OllamaChatModelOptions = Omit<OpenAIBaseModelOptions, "model"> & {
  model: string;
};

export const ollamaChatModelOptionsSchema = openAIBaseModelOptionsSchema.extend({
  model: z.string(),
});

export class OllamaChatModel extends OpenAIBaseModel {
  constructor(options?: OllamaChatModelOptions) {
    super({
      ...options,
      name: "OllamaChatModel",
      schema: ollamaChatModelOptionsSchema,
      baseURL: options?.baseURL || OLLAMA_BASE_URL,
      apiKey: options?.apiKey || OLLAMA_API_KEY,
    });
  }
}
