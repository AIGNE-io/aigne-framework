import { expect, spyOn, test } from "bun:test";

import { OpenaiLLMModel } from "../../src";
import {
  llmJsonResponse,
  llmTextResponse,
  llmToolCallResponse,
} from "../mocks/llm-response";

test("OpenaiLLMModel.process with text response", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model["client"]["chat"]["completions"], "create").mockImplementation(
    //@ts-ignore
    async function* () {
      for (const response of llmTextResponse) {
        yield response;
      }
    },
  );

  const result = await model.run({
    messages: [
      { role: "user", content: "Translate 'hello world' into Chinese" },
    ],
  });

  expect(result.$text).toEqual('"hello world" 翻译成中文是 "你好，世界".');
});

test("OpenaiLLMModel.process with JSON response format", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model["client"]["chat"]["completions"], "create").mockImplementation(
    //@ts-ignore
    async function* () {
      for (const response of llmJsonResponse) {
        yield response;
      }
    },
  );

  const result = await model.run({
    messages: [{ role: "user", content: "Help me generate a JSON" }],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "user",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        },
      },
    },
  });

  expect(result.$text).toBe('{"name":"李明","age":28}');
});

test("OpenaiLLMModel.process with tool call response format", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model["client"]["chat"]["completions"], "create").mockImplementation(
    //@ts-ignore
    async function* () {
      for (const response of llmToolCallResponse) {
        yield response;
      }
    },
  );

  const result = await model.run({
    messages: [{ role: "user", content: "What's the weather?" }],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get weather information",
          parameters: {
            type: "object",
            properties: {
              location: { type: "string" },
            },
            required: ["location"],
          },
        },
      },
    ],
    toolChoice: "required",
  });

  expect(result?.toolCalls?.[0]?.function?.name).toBe("get_weather");
  expect(result.$text).toBeUndefined();
});
