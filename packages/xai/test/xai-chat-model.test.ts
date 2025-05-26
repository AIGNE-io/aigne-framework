import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { textDelta } from "@aigne/core";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";
import { XAIChatModel } from "@aigne/xai";

test("XAI chat model basic usage", async () => {
  // #region example-xai-chat-model
  const model = new XAIChatModel({
    // Provide API key directly or use environment variable XAI_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify model (defaults to 'grok-2-latest')
    model: "grok-2-latest",
    modelOptions: {
      temperature: 0.8,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Tell me about yourself" }],
  });

  console.log(result);
  /* Output:
  {
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17
    }
  }
  */

  expect(result).toEqual({
    text: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
    model: "grok-2-latest",
    usage: {
      inputTokens: 6,
      outputTokens: 17,
    },
  });
  // #endregion example-xai-chat-model
});

test("X.AI chat model with streaming using async generator", async () => {
  // #region example-xai-chat-model-streaming
  const model = new XAIChatModel({
    apiKey: "your-api-key",
    model: "grok-2-latest",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "I'm Grok," });
    yield textDelta({ text: " an AI assistant" });
    yield textDelta({ text: " from X.AI." });
    yield textDelta({ text: " I'm here to assist" });
    yield textDelta({ text: " with a touch of humor and wit!" });

    return {
      model: "grok-2-latest",
      usage: { inputTokens: 6, outputTokens: 17 },
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me about yourself" }],
    },
    { streaming: true },
  );

  let fullText = "";
  const json = {};

  for await (const chunk of stream) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }

  console.log(fullText); // Output: "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!"
  console.log(json); // { model: "grok-2-latest", usage: { inputTokens: 6, outputTokens: 17 } }

  expect(fullText).toBe(
    "I'm Grok, an AI assistant from X.AI. I'm here to assist with a touch of humor and wit!",
  );
  expect(json).toEqual({
    model: "grok-2-latest",
    usage: { inputTokens: 6, outputTokens: 17 },
  });
  // #endregion example-xai-chat-model-streaming
});

test("XAIChatModel.invoke should return the correct tool", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "xai-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(expect.objectContaining(createWeatherToolExpected()));
});

test("XAIChatModel.invoke", async () => {
  const model = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "grok-2-latest",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "xai-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The temperature in New York is 20 degrees Celsius." },
      usage: {
        inputTokens: 413,
        outputTokens: 17,
      },
      model: expect.any(String),
    }),
  );
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

test("XAIChatModel should initialize with default options", () => {
  const customModel = new XAIChatModel({
    apiKey: "YOUR_API_KEY",
  });

  expect(customModel.options).toEqual({
    apiKey: "YOUR_API_KEY",
    baseURL: "https://api.x.ai/v1",
    model: "grok-2-latest",
  });
});
