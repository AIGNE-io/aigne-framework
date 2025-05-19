import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { textDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("DeepSeek chat model basic usage", async () => {
  // #region example-deepseek-chat-model
  const model = new DeepSeekChatModel({
    // Provide API key directly or use environment variable DEEPSEEK_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify model version (defaults to 'deepseek-chat')
    model: "deepseek-chat",
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Introduce yourself" }],
  });

  console.log(result);
  /* Output:
  {
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
  */

  expect(result).toEqual({
    text: "Hello! I'm an AI assistant powered by DeepSeek's language model.",
    model: "deepseek-chat",
    usage: {
      inputTokens: 7,
      outputTokens: 12,
    },
  });
  // #endregion example-deepseek-chat-model
});

test("DeepSeek chat model with streaming using async generator", async () => {
  // #region example-deepseek-chat-model-streaming
  const model = new DeepSeekChatModel({
    apiKey: "your-api-key",
    model: "deepseek-chat",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "Hello!" });
    yield textDelta({ text: " I'm an AI" });
    yield textDelta({ text: " assistant" });
    yield textDelta({ text: " powered by" });
    yield textDelta({ text: " DeepSeek's language model." });

    return {
      model: "deepseek-chat",
      usage: { inputTokens: 7, outputTokens: 12 },
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Introduce yourself" }],
    },
    undefined,
    { streaming: true },
  );

  let fullText = "";
  const json = {};

  for await (const chunk of stream) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }

  console.log(fullText); // Output: "Hello! I'm an AI assistant powered by DeepSeek's language model."
  console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }

  expect(fullText).toBe("Hello! I'm an AI assistant powered by DeepSeek's language model.");
  expect(json).toEqual({
    model: "deepseek-chat",
    usage: { inputTokens: 7, outputTokens: 12 },
  });
  // #endregion example-deepseek-chat-model-streaming
});

let model: DeepSeekChatModel;

beforeEach(() => {
  model = new DeepSeekChatModel({
    apiKey: "YOUR_API_KEY",
    model: "deepseek-chat",
  });
});

test("DeepSeekChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "deepseek-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("DeepSeekChatModel.invoke", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "deepseek-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20°C." },
      usage: {
        inputTokens: 193,
        outputTokens: 16,
      },
    }),
  );
});
