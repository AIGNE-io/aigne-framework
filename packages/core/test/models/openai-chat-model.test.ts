import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

let model: OpenAIChatModel;

beforeEach(() => {
  model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });
});

test("OpenAIChatModel.call should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-1.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("OpenAIChatModel.call", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20°C." },
      usage: {
        inputTokens: 100,
        outputTokens: 20,
      },
      model: expect.any(String),
    }),
  );
});

test("OpenAIChatModel.call with stream", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-text.txt"),
    }),
  );

  const result = await model.call(
    {
      messages: [{ role: "user", content: "hello" }],
    },
    undefined,
    { streaming: true },
  );

  const reader = result.getReader();

  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { json: { model: expect.any(String) } } },
  });

  const texts = ["Hello", "!", " How", " can", " I", " assist", " you", " today", "?"];
  for (const text of texts) {
    expect(reader.read()).resolves.toEqual({
      done: false,
      value: { delta: { text: { text } } },
    });
  }

  expect(reader.read()).resolves.toEqual({
    done: false,
    value: {
      delta: {
        json: { usage: { inputTokens: expect.any(Number), outputTokens: expect.any(Number) } },
      },
    },
  });

  expect(reader.read()).resolves.toEqual({
    done: true,
  });
});
