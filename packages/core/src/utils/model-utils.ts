import type { ChatModelOutputUsage } from "../models/chat-model";
import type { Nullish } from "./type-utils";

export function mergeUsage(...usages: Nullish<ChatModelOutputUsage>[]): ChatModelOutputUsage {
  return {
    promptTokens: usages.reduce((acc, usage) => (usage ? acc + usage.promptTokens : acc), 0),
    completionTokens: usages.reduce(
      (acc, usage) => (usage ? acc + usage.completionTokens : acc),
      0,
    ),
  };
}
