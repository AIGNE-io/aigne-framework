import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelOutput,
  ImageModel,
  type ImageModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

export class OpenAIChatModel extends ChatModel {
  process(): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    throw new Error("Method not implemented.");
  }
}

export class ClaudeChatModel extends OpenAIChatModel {}

export class XAIChatModel extends OpenAIChatModel {}

export class OpenAIImageModel extends ImageModel {
  process(): PromiseOrValue<AgentProcessResult<ImageModelOutput>> {
    throw new Error("Method not implemented.");
  }
}
