import type { Message } from "@aigne/core";
import type { ChatModelOutputToolCall } from "@aigne/core/agents/chat-model";

export function createToolCallResponse(
  functionName: string,
  args: Message,
): ChatModelOutputToolCall {
  return {
    id: functionName,
    type: "function",
    function: {
      name: functionName,
      arguments: args,
    },
  };
}
