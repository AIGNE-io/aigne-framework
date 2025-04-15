import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

test("XAIChatModel.call should return the correct tool", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "xai-streaming-response-1.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(expect.objectContaining(createWeatherToolExpected()));
});

test("XAIChatModel.call", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "xai-streaming-response-2.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The temperature in New York is 20 degrees Celsius." },
      usage: {
        inputTokens: 413,
        outputTokens: 17,
      },
      model: expect.any(String),
    }),
  );
});

test("XAIChatModel should initialize with correct options", () => {
  const customModel = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    baseURL: "https://custom.x.ai/v1",
    model: "grok-2-vision-1212",
  });

  expect(customModel.options).toEqual({
    apiKey: "YOUR_API_KEY",
    baseURL: "https://custom.x.ai/v1",
    model: "grok-2-vision-1212",
  });
});

test("XAIChatModel should initialize with default options", () => {
  const customModel = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
  });

  expect(customModel.options).toEqual({
    apiKey: "YOUR_API_KEY",
    baseURL: "https://api.x.ai/v1",
    model: "grok-2-latest",
  });
});
