import type { ChatModelOutputUsage } from "../agents/chat-model.js";
import type { Nullish } from "./type-utils.js";

export function mergeUsage(...usages: Nullish<ChatModelOutputUsage>[]): ChatModelOutputUsage {
  return {
    inputTokens: usages.reduce((acc, usage) => (usage ? acc + usage.inputTokens : acc), 0),
    outputTokens: usages.reduce((acc, usage) => (usage ? acc + usage.outputTokens : acc), 0),
  };
}
