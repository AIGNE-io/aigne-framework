import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { textDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/core/models/ollama-chat-model.js";
import { readableStreamToAsyncIterator } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

test("Ollama chat model basic usage", async () => {
  // #region example-ollama-chat-model
  const model = new OllamaChatModel({
    // Specify base URL (defaults to http://localhost:11434)
    baseURL: "http://localhost:11434",
    // Specify Ollama model to use (defaults to 'llama3')
    model: "llama3",
    modelOptions: {
      temperature: 0.8,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "I'm an AI assistant running on Ollama with the llama3 model.",
    model: "llama3",
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  });

  console.log(result);
  /* Output:
  {
    text: "I'm an AI assistant running on Ollama with the llama3 model.",
    model: "llama3"
  }
  */

  expect(result).toEqual({
    text: "I'm an AI assistant running on Ollama with the llama3 model.",
    model: "llama3",
  });
  // #endregion example-ollama-chat-model
});

test("Ollama chat model with streaming using async generator", async () => {
  // #region example-ollama-chat-model-streaming
  const model = new OllamaChatModel({
    baseURL: "http://localhost:11434",
    model: "llama3",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "I'm an AI" });
    yield textDelta({ text: " assistant" });
    yield textDelta({ text: " running on" });
    yield textDelta({ text: " Ollama" });
    yield textDelta({ text: " with the llama3 model." });

    return { model: "llama3" };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me what model you're using" }],
    },
    undefined,
    { streaming: true },
  );

  let fullText = "";
  const json = {};

  for await (const chunk of readableStreamToAsyncIterator(stream)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }

  console.log(fullText); // Output: "I'm an AI assistant running on Ollama with the llama3 model."
  console.log(json); // { model: "llama3" }

  expect(fullText).toBe("I'm an AI assistant running on Ollama with the llama3 model.");
  expect(json).toEqual({
    model: "llama3",
  });
  // #endregion example-ollama-chat-model-streaming
});

let model: OllamaChatModel;

beforeEach(() => {
  model = new OllamaChatModel({
    model: "llama3.1",
  });
});

test("OllamaChatModel.invoke llama3.1 should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "ollama-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("OllamaChatModel.invoke llama3.1", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "ollama-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20 degrees." },
      usage: {
        inputTokens: 101,
        outputTokens: 17,
      },
    }),
  );
});
