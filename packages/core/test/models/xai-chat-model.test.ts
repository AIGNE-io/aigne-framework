import { expect, spyOn, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
  XAIChatModel,
} from "@aigne/core";
import type OpenAI from "openai";
import type { APIPromise } from "openai/core";
import type { ChatCompletion, ChatCompletionChunk } from "openai/resources";
import type { Stream } from "openai/streaming";

test("XAIChatModel.call", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn((model as unknown as { client: OpenAI }).client.chat.completions, "create").mockReturnValue(
    new ReadableStream({
      async start(controller) {
        const file = await readFile(join(import.meta.dirname, "openai-streaming-response.txt"));
        for (const line of file.toString().split("\n")) {
          if (line) controller.enqueue(JSON.parse(line.replace("data:", "")));
        }
        controller.close();
      },
    }) as unknown as APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>,
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

  expect(result).toEqual({
    json: { text: "The current temperature in New York is 20°C." },
  });
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
