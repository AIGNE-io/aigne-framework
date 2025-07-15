import type {
  AgentInvokeOptions,
  AgentProcessResult,
  ChatModelInput,
  ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { ChatModelName } from "@aigne/transport/constants.js";
import {
  ClientChatBaseModel,
  type ClientChatModelOptions,
  ClientChatModelOptionsSchema,
} from "@aigne/transport/http-client/client-chat-base-model.js";

export class AIGNEHubChatModel extends ClientChatBaseModel {
  constructor(public override options: ClientChatModelOptions) {
    if (options) checkArguments("AIGNEHubChatModel", ClientChatModelOptionsSchema, options);
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
