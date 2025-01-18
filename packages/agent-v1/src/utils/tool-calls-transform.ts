import type { ChatCompletionChunk } from "@blocklet/ai-kit/api/types/chat";

export function toolCallsTransform(
  calls: NonNullable<ChatCompletionChunk["delta"]["toolCalls"]>,
  chunk: ChatCompletionChunk,
) {
  const { toolCalls } = chunk.delta;

  toolCalls?.forEach((item) => {
    const targetCall = item?.id
      ? calls.find((call) => call.id === item?.id)
      : calls.at(-1);
    // 如果 item 有 id, 且 calls 中没有这个 id, 则直接 push
    // chatgpt adapter 和 claude adapter 经过改造一定有 id
    if (item?.id && !targetCall) {
      calls.push(item);
    } else if (targetCall?.function) {
      targetCall.function.name += item.function?.name || "";
      targetCall.function.arguments =
        (targetCall.function.arguments || "") +
        (item.function?.arguments || "");
    }
  });
}
