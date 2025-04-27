import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

let model: OpenAIChatModel;

beforeEach(() => {
  model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });
});

test("OpenAIChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toMatchSnapshot();
});

test("OpenAIChatModel.invoke should return structured output", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toMatchSnapshot();
});

test("OpenAIChatModel.invoke with streaming", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-text.txt"),
    }),
  );

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "hello" }],
    },
    undefined,
    { streaming: true },
  );

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("OpenAIChatModel.invoke without streaming", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-text.txt"),
    }),
  );

  const result = await model.invoke({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});
