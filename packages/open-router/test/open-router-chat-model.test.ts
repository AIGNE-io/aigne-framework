import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { textDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("OpenRouter chat model basic usage", async () => {
  // #region example-openrouter-chat-model
  const model = new OpenRouterChatModel({
    // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify model (defaults to 'openai/gpt-4o')
    model: "anthropic/claude-3-opus",
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Which model are you using?" }],
  });

  console.log(result);
  /* Output:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */

  expect(result).toEqual({
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14,
    },
  });
  // #endregion example-openrouter-chat-model
});

test("OpenRouter chat model with streaming using async generator", async () => {
  // #region example-openrouter-chat-model-streaming
  const model = new OpenRouterChatModel({
    apiKey: "your-api-key",
    model: "anthropic/claude-3-opus",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "I'm powered by" });
    yield textDelta({ text: " OpenRouter," });
    yield textDelta({ text: " using the" });
    yield textDelta({ text: " Claude 3 Opus" });
    yield textDelta({ text: " model from Anthropic." });

    return {
      model: "anthropic/claude-3-opus",
      usage: { inputTokens: 5, outputTokens: 14 },
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Which model are you using?" }],
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

  console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
  console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }

  expect(fullText).toBe("I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.");
  expect(json).toEqual({
    model: "anthropic/claude-3-opus",
    usage: { inputTokens: 5, outputTokens: 14 },
  });
  // #endregion example-openrouter-chat-model-streaming
});

let model: OpenRouterChatModel;

beforeEach(() => {
  model = new OpenRouterChatModel({
    apiKey: "YOUR_API_KEY",
    model: "openai/gpt-4o",
  });
});

test("OpenRouterChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "open-router-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("OpenRouterChatModel.invoke", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "open-router-streaming-response-2.txt"),
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
        inputTokens: 100,
        outputTokens: 20,
      },
    }),
  );
});
