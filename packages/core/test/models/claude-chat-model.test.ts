import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import type Anthropic from "@anthropic-ai/sdk";
import { createMockEventStream } from "../_utils/event-stream.js";

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
    messages: ChatMessagesTemplate.from([
      SystemMessageTemplate.from("You are a chatbot"),
      UserMessageTemplate.from([{ type: "text", text: "What is the weather in New York?" }]),
    ]).format(),
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
              },
            },
            required: ["city"],
          },
        },
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "output",
        schema: {
          type: "object",
          properties: {
            text: {
              type: "string",
            },
          },
          required: ["text"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  expect(result1).toEqual(
    expect.objectContaining({
      text: "",
      toolCalls: [
        {
          id: expect.any(String),
          type: "function",
          function: {
            name: "get_weather",
            arguments: { city: "New York" },
          },
        },
      ],
      usage: {
        promptTokens: 416,
        completionTokens: 54,
      },
    }),
  );

  const result2 = await model.call({
    messages: ChatMessagesTemplate.from([
      SystemMessageTemplate.from("You are a chatbot"),
      UserMessageTemplate.from([{ type: "text", text: "What is the weather in New York?" }]),
      AgentMessageTemplate.from(undefined, [
        {
          id: "get_weather",
          type: "function",
          function: { name: "get_weather", arguments: { city: "New York" } },
        },
      ]),
      ToolMessageTemplate.from({ temperature: 20 }, "get_weather"),
    ]).format(),
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
              },
            },
            required: ["city"],
          },
        },
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "output",
        schema: {
          type: "object",
          properties: {
            text: {
              type: "string",
            },
          },
          required: ["text"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  expect(result2).toEqual({
    json: { text: "The current temperature in New York is 20 degrees." },
    usage: {
      promptTokens: 955,
      completionTokens: 54,
    },
  });
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
