import type {
  AgentInvokeOptions,
  AgentProcessResult,
  ChatModelInput,
  ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { ChatModelName } from "@aigne/transport/constants.js";
import {
  AIGNEHubBaseModel,
  type AIGNEHubChatModelOptions,
  aigneHubChatModelOptionsSchema,
} from "@aigne/transport/http-client/client-chat-base-model.js";

export class AIGNEHubChatModel extends AIGNEHubBaseModel {
  constructor(public override options: AIGNEHubChatModelOptions) {
    if (options) checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);
    super(options);
  }

  override name = ChatModelName;

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.__invoke(this.name, input, options);
  }
}
