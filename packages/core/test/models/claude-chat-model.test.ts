import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import type Anthropic from "@anthropic-ai/sdk";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

test("ClaudeChatModel.call", async () => {
  const model = new ClaudeChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream")
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "claude-streaming-response-1.txt") }),
    )
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "claude-streaming-response-2.txt") }),
    );

  spyOn(model.client.messages, "create").mockResolvedValue(
    (await import("./claude-structured-response-3.json")) as unknown as Anthropic.Messages.Message,
  );

  const result1 = await model.call({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result1).toMatchSnapshot();

  const result2 = await model.call({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result2).toMatchSnapshot();
});

test("ClaudeChatModel.call should pass system and messages to claude correctly", async () => {
  const model = new ClaudeChatModel({
    apiKey: "YOUR_API_KEY",
  });

  const stream = spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({ path: join(import.meta.dirname, "claude-streaming-response-1.txt") }),
  );

  await model.call({
    messages: [
      { role: "system", content: "You are a chatbot" },
      { role: "user", content: "hello" },
    ],
  });

  expect(stream.mock.calls).toEqual([
    [
      expect.objectContaining({
        system: "You are a chatbot",
        messages: [{ role: "user", content: "hello" }],
      }),
    ],
  ]);
});

test("ClaudeChatModel.call should use system message as user message if messages is empty", async () => {
  const model = new ClaudeChatModel({
    apiKey: "YOUR_API_KEY",
  });

  const stream = spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({ path: join(import.meta.dirname, "claude-streaming-response-1.txt") }),
  );

  await model.call({
    messages: [{ role: "system", content: "You are a chatbot" }],
  });

  // Should not include system property in the request, the system message should be treated as user message
  expect(stream.mock.calls).toEqual([
    [
      expect.not.objectContaining({
        system: expect.anything(),
      }),
    ],
  ]);
  expect(stream.mock.calls).toEqual([
    [
      expect.objectContaining({
        messages: [{ role: "user", content: "You are a chatbot" }],
      }),
    ],
  ]);
});

test("ClaudeChatModel.call with streaming", async () => {
  const model = new ClaudeChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "claude-streaming-response-text.txt"),
    }),
  );

  const stream = await model.call(
    {
      messages: [{ role: "user", content: "hello" }],
    },
    undefined,
    { streaming: true },
  );

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("ClaudeChatModel.call without streaming", async () => {
  const model = new ClaudeChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "claude-streaming-response-text.txt"),
    }),
  );

  const result = await model.call({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});
