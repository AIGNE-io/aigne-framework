import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { OllamaChatModel } from "@aigne/core/models/ollama-chat-model.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

let model: OllamaChatModel;

beforeEach(() => {
  model = new OllamaChatModel({
    model: "llama3.1",
  });
});

test("OllamaChatModel.call llama3.1 should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "ollama-streaming-response-1.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("OllamaChatModel.call llama3.1", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "ollama-streaming-response-2.txt"),
    }),
  );

  const result = await model.call({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20 degrees." },
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
      usage: {
        promptTokens: 101,
        completionTokens: 17,
      },
    }),
  );
});
