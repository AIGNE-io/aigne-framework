import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
  ImageModel,
  type ImageModelInput,
  type ImageModelOutput,
} from "@aigne/core";
import type { BaseClientInvokeOptions } from "@aigne/transport/http-client/base-client.js";
import { findImageModel, findModel } from "./utils/model.js";
import type { AIGNEHubChatModelOptions, AIGNEHubImageModelOptions } from "./utils/type.js";

export * from "./utils/blocklet.js";
export * from "./utils/constants.js";
export * from "./utils/model.js";

export class AIGNEHubChatModel extends ChatModel {
  static async load(options: AIGNEHubChatModelOptions) {
    return new AIGNEHubChatModel(options);
  }

  constructor(public options: AIGNEHubChatModelOptions) {
    const provider = process.env.BLOCKLET_AIGNE_API_PROVIDER || AIGNEHubChatModel.name;

    const { match, all } = findModel(provider);

    if (!match) {
      const available = all.map((m) => m.name).join(", ");
      throw new Error(
        `Unsupported model provider: ${provider} ${process.env.BLOCKLET_AIGNE_API_MODEL}. Available providers: ${available}`,
      );
    }

    const client = match.create(options);

    super({ name: client.name });

    this.client = client;
  }

  protected client: ChatModel;

  override get credential() {
    return this.client.credential;
  }

  override async process(
    input: ChatModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<ChatModelOutput>> {
    return this.client.invoke(input, options);
  }
}

export class AIGNEHubImageModel extends ImageModel {
  static async load(options: AIGNEHubImageModelOptions) {
    return new AIGNEHubImageModel(options);
  }

  constructor(public options: AIGNEHubImageModelOptions) {
    const provider = process.env.BLOCKLET_AIGNE_API_PROVIDER || AIGNEHubImageModel.name;

    const { match, all } = findImageModel(provider);

    if (!match) {
      const available = all.map((m) => m.name).join(", ");
      throw new Error(
        `Unsupported model provider: ${provider} ${process.env.BLOCKLET_AIGNE_API_MODEL}. Available providers: ${available}`,
      );
    }

    const client = match.create(options);

    super({ name: client.name });

    this.client = client;
  }

  protected client: ImageModel;

  override get credential() {
    return this.client.credential;
  }

  override async process(
    input: ImageModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<ImageModelOutput>> {
    return this.client.invoke(input, options);
  }
}
