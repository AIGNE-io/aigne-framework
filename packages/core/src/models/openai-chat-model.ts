import { OpenAIBaseModel, type OpenAIBaseModelOptions } from "./openai-base-model.js";

export class OpenAIChatModel extends OpenAIBaseModel {
  constructor(options?: OpenAIBaseModelOptions) {
    super({
      ...options,
      name: "OpenAIChatModel",
    });
  }
}
