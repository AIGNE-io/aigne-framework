import { type AgentProcessResult, ChatModel, type ChatModelOutput } from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

export class OpenAIChatModel extends ChatModel {
  process(): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    throw new Error("Method not implemented.");
  }

  getCredential() {
    return {};
  }
}

export class ClaudeChatModel extends OpenAIChatModel {}

export class XAIChatModel extends OpenAIChatModel {}
