import { expect, spyOn, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  ChatModelOpenAI,
  SystemMessageTemplate,
  ToolMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";
import type OpenAI from "openai";
import { OPENAI_API_KEY } from "../env";

test("ChatModelOpenAI.run", async () => {
  const model = new ChatModelOpenAI({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
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
    }) as any,
  );

  const result = await model.call({
    messages: ChatMessagesTemplate.from([
      SystemMessageTemplate.from("You are a chatbot"),
      UserMessageTemplate.from([{ type: "text", text: "What is the weather in New York?" }]),
      AgentMessageTemplate.from([
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
