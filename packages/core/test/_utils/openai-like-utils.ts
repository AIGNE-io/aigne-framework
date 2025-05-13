import { expect } from "bun:test";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  type Message,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import type {
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelOutputToolCall,
} from "@aigne/core/models/chat-model";

export const COMMON_TOOLS: ChatModelInputTool[] = [
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

export const COMMON_RESPONSE_FORMAT: ChatModelInputResponseFormat = {
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

const createBaseMessages = () => [
  SystemMessageTemplate.from("You are a chatbot"),
  UserMessageTemplate.from([{ type: "text", text: "What is the weather in New York?" }]),
];

export const createWeatherToolMessages = () =>
  ChatMessagesTemplate.from(createBaseMessages()).format();

export const createWeatherToolExpected = () =>
  expect.objectContaining({
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
  });

export const createWeatherToolCallMessages = () =>
  ChatMessagesTemplate.from([
    ...createBaseMessages(),
    AgentMessageTemplate.from(undefined, [
      {
        id: "get_weather",
        type: "function",
        function: { name: "get_weather", arguments: { city: "New York" } },
      },
    ]),
    ToolMessageTemplate.from({ temperature: 20 }, "get_weather"),
  ]).format();

export function createToolCallResponse(
  functionName: string,
  args: Message,
): ChatModelOutputToolCall {
  return {
    id: functionName,
    type: "function",
    function: {
      name: functionName,
      arguments: args,
    },
  };
}
