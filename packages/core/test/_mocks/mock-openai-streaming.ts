import { nanoid } from "nanoid";
import { createMockEventStream } from "../_utils/event-stream.js";

export function mockOpenAIStreaming<T>({
  text,
  promptTokens,
  completeTokens,
}: { text: string; promptTokens?: number; completeTokens?: number }): T {
  const id = nanoid();
  const segments = Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(text));
  const events: unknown[] = [];

  const common = {
    id,
    object: "chat.completion.chunk",
    created: getUnixTimestamp(),
    model: "gpt-4o-mini-2024-07-18",
    service_tier: "default",
    system_fingerprint: "fp_b376dfbbd5",
  };

  events.push({
    ...common,
    choices: [{ index: 0, delta: { role: "assistant", content: "" } }],
  });

  for (const segment of segments) {
    events.push({ ...common, choices: [{ index: 0, delta: { content: segment.segment } }] });
  }

  events.push({ ...common, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });

  events.push({
    ...common,
    choices: [],
    usage: {
      prompt_tokens: promptTokens || 0,
      completion_tokens: completeTokens || segments.length,
      total_tokens: (promptTokens || 0) + (completeTokens || segments.length),
      prompt_tokens_details: { cached_tokens: 0, audio_tokens: 0 },
      completion_tokens_details: {
        reasoning_tokens: 0,
        audio_tokens: 0,
        accepted_prediction_tokens: 0,
        rejected_prediction_tokens: 0,
      },
    },
  });

  return createMockEventStream({ raw: events.map((i) => `data: ${JSON.stringify(i)}`).join("\n") });
}

function getUnixTimestamp() {
  return Math.round(new Date().getTime() / 1000);
}
