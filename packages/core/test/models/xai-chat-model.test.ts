import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import { XAIChatModel } from "@aigne/core/models/xai-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";

test("XAIChatModel.call", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({ path: join(import.meta.dirname, "xai-streaming-response.txt") }),
  );

  const result = await model.call({
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

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The temperature in New York is 20 degrees Celsius." },
      usage: {
        inputTokens: 177,
        outputTokens: 20,
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
