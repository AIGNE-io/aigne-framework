import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { DeepSeekChatModel } from "@aigne/core/models/deepseek-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
} from "../_utils/openai-like-utils.js";

let model: DeepSeekChatModel;

beforeEach(() => {
  model = new DeepSeekChatModel({
    apiKey: "YOUR_API_KEY",
    model: "deepseek-chat",
  });
});

test("DeepSeekChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "deepseek-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("DeepSeekChatModel.invoke", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "deepseek-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20°C." },
      usage: {
        inputTokens: 193,
        outputTokens: 16,
      },
    }),
  );
});
