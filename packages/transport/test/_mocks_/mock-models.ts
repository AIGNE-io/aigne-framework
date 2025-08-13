import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

export class OpenAIChatModel extends ChatModel {
  process(
    _input: ChatModelInput,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    throw new Error("Method not implemented.");
  }

  getCredential() {
    return {};
  }
}

export class ClaudeChatModel extends OpenAIChatModel {}

export class XAIChatModel extends OpenAIChatModel {}
