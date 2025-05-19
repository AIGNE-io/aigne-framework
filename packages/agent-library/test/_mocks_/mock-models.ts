import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
  type Context,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";

export class OpenAIChatModel extends ChatModel {
  process(
    _input: ChatModelInput,
    _context: Context,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    throw new Error("Method not implemented.");
  }
}
