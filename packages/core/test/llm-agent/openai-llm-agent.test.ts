import { expect, spyOn, test } from "bun:test";
import OpenAI from "openai";

import { OpenaiLLMModel } from "../../src";

test("OpenaiLLMModel.process with text response", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model, "fetch").mockImplementation(async function* () {
    yield {
      choices: [{ delta: { content: "Hello" } }],
    };
    yield {
      choices: [{ delta: { content: " World" } }],
    };
  });

  const result = await model.run({
    messages: [{ role: "user", content: "Hi" }],
  });

  expect(result.$text).toEqual("Hello World");
});

test("OpenaiLLMModel.process with function call response", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model, "fetch").mockImplementation(async function* () {
    yield {
      choices: [
        {
          delta: {
            tool_calls: [
              {
                index: 0,
                id: "call_abc",
                type: "function",
                function: {
                  name: "get_weather",
                  arguments: '{"location":"',
                },
              },
            ],
          },
        },
      ],
    };
    yield {
      choices: [
        {
          delta: {
            tool_calls: [
              {
                index: 0,
                id: "call_abc",
                function: {
                  arguments: 'Shanghai"}',
                },
              },
            ],
          },
        },
      ],
    };
  });

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
  });

  expect(result.toolCalls).toHaveLength(2);
  expect(result?.toolCalls?.[0]?.function?.name).toBe("get_weather");
  expect(result?.toolCalls?.[1]?.function?.arguments).toBe('Shanghai"}');
});

test("OpenaiLLMModel.process with JSON response format", async () => {
  const model = new OpenaiLLMModel({
    apiKey: "test-key",
    model: "gpt-3.5-turbo",
  });

  spyOn(model, "fetch").mockImplementation(async function* () {
    yield {
      choices: [
        {
          delta: { content: '{"name":"John",' },
        },
      ],
    };
    yield {
      choices: [
        {
          delta: { content: '"age":30}' },
        },
      ],
    };
  });

  const result = await model.run({
    messages: [{ role: "user", content: "Get user info" }],
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

  expect(result.$text).toBe('{"name":"John","age":30}');
});
