import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { BlockletAIGNEHubChatModel, type HubChatModelOptions } from "./blocklet-aigne-hub-model.js";
import { type AIGNEHubChatModelOptions, CliAIGNEHubChatModel } from "./cli-aigne-hub-model.js";

export class AIGNEHubChatModel extends ChatModel {
  private client: ChatModel;

  constructor(public options: HubChatModelOptions) {
    super();
    this.client = process.env.BLOCKLET_AIGNE_API_PROVIDER
      ? new BlockletAIGNEHubChatModel(options)
      : new CliAIGNEHubChatModel(options as AIGNEHubChatModelOptions);
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.process(input, options);
  }
}

export { availableModels } from "./constants.js";
