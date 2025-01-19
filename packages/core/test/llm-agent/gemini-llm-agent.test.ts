import { expect, spyOn, test } from "bun:test";
import { GeminiLLMModel } from "../../src";

test("GeminiLLMModel.process with text response", async () => {
  const model = new GeminiLLMModel({
    apiKey: "test-key",
    model: "gemini-pro",
  });

  //@ts-ignore
  spyOn(model, "fetch").mockImplementation(async () => ({
    stream: (async function* () {
      yield {
        candidates: [
          {
            content: {
              parts: [{ text: "Hello" }],
            },
          },
        ],
      };
      yield {
        candidates: [
          {
            content: {
              parts: [{ text: " World" }],
            },
          },
        ],
      };
    })(),
  }));

  const result = await model.run({
    messages: [{ role: "user", content: "Hi" }],
  });

  expect(result.$text).toEqual("Hello World");
});

test("GeminiLLMModel.process with function call response", async () => {
  const model = new GeminiLLMModel({
    apiKey: "test-key",
    model: "gemini-pro",
  });

  //@ts-ignore
  spyOn(model, "fetch").mockImplementation(async () => ({
    stream: (async function* () {
      yield {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: "get_weather",
                    args: { location: "Shanghai" },
                  },
                },
              ],
            },
          },
        ],
      };
    })(),
  }));

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

  expect(result?.toolCalls).toHaveLength(1);
  expect(result?.toolCalls?.[0]?.function?.name).toBe("get_weather");
  expect(result?.toolCalls?.[0]?.function?.arguments).toBe(
    '{"location":"Shanghai"}',
  );
});

test("GeminiLLMModel.process with JSON response format", async () => {
  const model = new GeminiLLMModel({
    apiKey: "test-key",
    model: "gemini-pro",
  });

  //@ts-ignore
  spyOn(model, "fetch").mockImplementation(async () => ({
    stream: (async function* () {
      yield {
        candidates: [
          {
            content: {
              parts: [{ text: '{"name":"John",' }],
            },
          },
        ],
      };
      yield {
        candidates: [
          {
            content: {
              parts: [{ text: '"age":30}' }],
            },
          },
        ],
      };
    })(),
  }));

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
