import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { BaseClientInvokeOptions } from "@aigne/transport/http-client/base-client.js";
import type { AIGNEHubChatModelOptions } from "./aigne-hub-model.js";
import { findModel } from "./utils/model.js";

export * from "./utils/blocklet.js";
export * from "./utils/constants.js";
export * from "./utils/model.js";

export class AIGNEHubChatModel extends ChatModel {
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
