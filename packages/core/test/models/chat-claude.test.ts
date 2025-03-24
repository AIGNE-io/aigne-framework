import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  ClaudeChatModel,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core-next";
import type Anthropic from "@anthropic-ai/sdk";
import { createMockEventStream } from "../_utils/event-stream";

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
  });
});
