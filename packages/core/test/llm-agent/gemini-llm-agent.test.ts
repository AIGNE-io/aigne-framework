import { expect, spyOn, test } from "bun:test";
import { GeminiLLMModel } from "../../src";
import {
  geminiJsonResponse,
  geminiTextResponse,
} from "../mocks/gemini-response";

test("GeminiLLMModel.process with text response", async () => {
  const model = new GeminiLLMModel({
    apiKey: "test-key",
    model: "gemini-pro",
  });

  spyOn(model["model"], "generateContentStream").mockImplementation(
    //@ts-ignore
    async () => ({
      stream: (async function* () {
        for (const response of geminiTextResponse) {
          yield response;
        }
      })(),
    }),
  );

  const result = await model.run({
    modelOptions: { temperature: 0 },
    messages: [
      { role: "user", content: "使用一句话翻译 'hello world' 成中文" },
    ],
  });

  expect(result.$text).toEqual("你好，世界。");
});

test("GeminiLLMModel.process with JSON response format", async () => {
  const model = new GeminiLLMModel({
    apiKey: "test-key",
    model: "gemini-pro",
  });

  spyOn(model["model"], "generateContentStream").mockImplementation(
    //@ts-ignore
    async () => ({
      stream: (async function* () {
        for (const response of geminiJsonResponse) {
          yield response;
        }
      })(),
    }),
  );

  const result = await model.run({
    messages: [
      {
        role: "user",
        content: "What's the weather like?",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get the current weather",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city name",
              },
              unit: {
                type: "string",
                description: "Temperature unit (celsius/fahrenheit)",
              },
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
