import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { OpenRouterChatModel } from "@aigne/core/models/open-router-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

let model: OpenRouterChatModel;

beforeEach(() => {
  model = new OpenRouterChatModel({
    apiKey: "YOUR_API_KEY",
    model: "openai/gpt-4o",
  });
});

test("OpenRouterChatModel.call should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "open-router-streaming-response-1.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("OpenRouterChatModel.call", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "open-router-streaming-response-2.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual({
    json: { text: "The current temperature in New York is 20°C." },
    usage: {
      promptTokens: 100,
      completionTokens: 20,
    },
  });
});
