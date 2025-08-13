import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { ChatModelName } from "../constants.js";
import type { AIGNEHTTPClient } from "./client.js";

export class ClientChatModel extends ChatModel {
  constructor(public client: AIGNEHTTPClient) {
    super();
  }

  override name = ChatModelName;

  process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client._invoke(this.name, input, options);
  }

  getCredential() {
    return {};
  }
}
