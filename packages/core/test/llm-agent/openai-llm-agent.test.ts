import { expect, spyOn, test } from "bun:test";

import { OpenaiLLMModel } from "../../src";
import { llmJsonResponse, llmTextResponse } from "../mocks/llm-response";

test("OpenaiLLMModel.process with text response", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model["client"]["chat"]["completions"], "create").mockImplementation(
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
