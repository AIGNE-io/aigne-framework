import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  type ChatModelInputResponseFormat,
  type ChatModelInputTool,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";

const COMMON_TOOLS: ChatModelInputTool[] = [
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
];

const COMMON_RESPONSE_FORMAT: ChatModelInputResponseFormat = {
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
};

let model: OpenAIChatModel;

beforeEach(() => {
  model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });
});

const createBaseMessages = () => [
  SystemMessageTemplate.from("You are a chatbot"),
  UserMessageTemplate.from([{ type: "text", text: "What is the weather in New York?" }]),
];

test("OpenAIChatModel.call should return the correct function call", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-1.txt"),
    }),
  );

  const result = await model.call({
    messages: ChatMessagesTemplate.from(createBaseMessages()).format(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      text: "",
      toolCalls: [
        {
          function: {
            arguments: {
              city: "New York",
            },
            name: "get_weather",
          },
          id: expect.any(String),
          type: "function",
        },
      ],
    }),
  );
});

test("OpenAIChatModel.call", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
    }),
  );

  const messages = [
    ...createBaseMessages(),
    AgentMessageTemplate.from(undefined, [
      {
        id: "get_weather",
        type: "function",
        function: { name: "get_weather", arguments: { city: "New York" } },
      },
    ]),
    ToolMessageTemplate.from({ temperature: 20 }, "get_weather"),
  ];

  const result = await model.call({
    messages: ChatMessagesTemplate.from(messages).format(),
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
