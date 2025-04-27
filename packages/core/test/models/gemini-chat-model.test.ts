import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { GeminiChatModel } from "@aigne/core/models/gemini-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

let model: GeminiChatModel;

beforeEach(() => {
  model = new GeminiChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gemini-2.0-flash",
  });
});
test("GeminiChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "gemini-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("GeminiChatModel.invoke", async () => {
  spyOn(model.client.chat.completions, "create")
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "gemini-streaming-response-2.txt") }),
    )
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "gemini-streaming-response-3.txt") }),
    );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The temperature in New York is 20 degrees." },
      usage: {
        inputTokens: 66,
        outputTokens: 32,
      },
    }),
  );
});
