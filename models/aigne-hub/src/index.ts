import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
  ImageModel,
  type ImageModelInput,
  type ImageModelOutput,
  VideoModel,
  type VideoModelInput,
  type VideoModelOutput,
} from "@aigne/core";
import type { BaseClientInvokeOptions } from "@aigne/transport/http-client/base-client.js";
import { getModels } from "./utils/hub.js";
import { findImageModel, findModel, findVideoModel, parseModel } from "./utils/model.js";

import type {
  AIGNEHubChatModelOptions,
  AIGNEHubImageModelOptions,
  AIGNEHubVideoModelOptions,
} from "./utils/type.js";

export * from "./utils/blocklet.js";
export * from "./utils/constants.js";
export * from "./utils/find-provider.js";
export * from "./utils/model.js";

export class AIGNEHubChatModel extends ChatModel {
  static async load(options: AIGNEHubChatModelOptions) {
    return new AIGNEHubChatModel(options);
  }

  static async models() {
    return getModels({ type: "chat" });
  }

  models() {
    return getModels({ type: "chat" });
  }

  constructor(public override options: AIGNEHubChatModelOptions) {
    let provider = process.env.BLOCKLET_AIGNE_API_PROVIDER;

    if (!provider && options.model) {
      const parsed = parseModel(options.model);
      if (parsed.provider && parsed.model) {
        provider = parsed.provider;
        options.model = parsed.model;
      }
    }

    provider ||= AIGNEHubChatModel.name;

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

  static async models() {
    return getModels({ type: "image" });
  }

  models() {
    return getModels({ type: "image" });
  }

  constructor(public override options: AIGNEHubImageModelOptions) {
    let provider = process.env.BLOCKLET_AIGNE_API_PROVIDER;

    if (!provider && options.model) {
      const parsed = parseModel(options.model);
      if (parsed.provider && parsed.model) {
        provider = parsed.provider;
        options.model = parsed.model;
      }
    }

    provider ||= AIGNEHubImageModel.name;

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

export class AIGNEHubVideoModel extends VideoModel {
  static async load(options: AIGNEHubVideoModelOptions) {
    return new AIGNEHubVideoModel(options);
  }

  static async models() {
    return getModels({ type: "video" });
  }

  models() {
    return getModels({ type: "video" });
  }

  constructor(public override options: AIGNEHubVideoModelOptions) {
    let provider = process.env.BLOCKLET_AIGNE_API_PROVIDER;

    if (!provider && options.model) {
      const parsed = parseModel(options.model);
      if (parsed.provider && parsed.model) {
        provider = parsed.provider;
        options.model = parsed.model;
      }
    }

    provider ||= AIGNEHubVideoModel.name;

    const { match, all } = findVideoModel(provider);

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

  protected client: VideoModel;

  override get credential() {
    return this.client.credential;
  }

  override async process(
    input: VideoModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<VideoModelOutput>> {
    return this.client.invoke(input, options);
  }
}
