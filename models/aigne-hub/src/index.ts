import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import {
  AIGNEHubChatModel as _AIGNEHubChatModel,
  type AIGNEHubChatModelOptions,
} from "./aigne-hub-model.js";
import { HubChatModel, type HubChatModelOptions } from "./hub-model.js";

export class AIGNEHubChatModel extends ChatModel {
  private client: ChatModel;

  constructor(public options: HubChatModelOptions) {
    super();
    this.client = process.env.BLOCKLET_AIGNE_API_PROVIDER
      ? new HubChatModel(options)
      : new _AIGNEHubChatModel(options as AIGNEHubChatModelOptions);
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.process(input, options);
  }
}
