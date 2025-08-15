import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("Doubao chat model basic usage", async () => {
  // #region example-doubao-chat-model
  const model = new DoubaoChatModel({
    // Provide API key directly or use environment variable DOUBAO_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify model version (defaults to 'doubao-seed-1-6-250615')
    model: "doubao-seed-1-6-250615",
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
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
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
  */

  expect(result).toEqual({
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12,
    },
  });
  // #endregion example-doubao-chat-model
});

test("Doubao chat model with streaming using async generator", async () => {
  // #region example-doubao-chat-model-streaming
  const model = new DoubaoChatModel({
    apiKey: "your-api-key",
    model: "doubao-seed-1-6-250615",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "Hello!" });
    yield textDelta({ text: " I'm an AI" });
    yield textDelta({ text: " assistant" });
    yield textDelta({ text: " powered by" });
    yield textDelta({ text: " Doubao's language model." });

    return {
      model: "doubao-seed-1-6-250615",
      usage: { inputTokens: 7, outputTokens: 12 },
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Introduce yourself" }],
    },
    { streaming: true },
  );

  let fullText = "";
  const json = {};

  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) fullText += text;
      if (chunk.delta.json) Object.assign(json, chunk.delta.json);
    }
  }

  console.log(fullText); // Output: "Hello! I'm an AI assistant powered by Doubao's language model."
  console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }

  expect(fullText).toBe("Hello! I'm an AI assistant powered by Doubao's language model.");
  expect(json).toEqual({
    model: "doubao-seed-1-6-250615",
    usage: { inputTokens: 7, outputTokens: 12 },
  });
  // #endregion example-doubao-chat-model-streaming
});

let model: DoubaoChatModel;

beforeEach(() => {
  model = new DoubaoChatModel({
    apiKey: "YOUR_API_KEY",
    model: "doubao-seed-1-6-250615",
  });
});

test("DoubaoChatModel.invoke should return the correct tool", async () => {
  const client = await model.client();
  spyOn(client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "doubao-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("DoubaoChatModel.invoke", async () => {
  const client = await model.client();
  spyOn(client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "doubao-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolCallMessages(),
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
