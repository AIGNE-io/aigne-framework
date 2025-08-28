import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { LMStudioChatModel } from "@aigne/lmstudio";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("LM Studio chat model basic usage", async () => {
  // #region example-lmstudio-chat-model
  const model = new LMStudioChatModel({
    // Specify base URL (defaults to http://localhost:1234/v1)
    baseURL: "http://localhost:1234/v1",
    // Specify LM Studio model to use (defaults to 'llama-3.2-3b-instruct')
    model: "llama-3.2-3b-instruct",
    modelOptions: {
      temperature: 0.8,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "I'm an AI assistant running on LM Studio with the llama-3.2-3b-instruct model.",
    model: "llama-3.2-3b-instruct",
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  });

  console.log(result);
  /* Output:
  {
    text: "I'm an AI assistant running on LM Studio with the llama-3.2-3b-instruct model.",
    model: "llama-3.2-3b-instruct"
  }
  */

  expect(result).toEqual({
    text: "I'm an AI assistant running on LM Studio with the llama-3.2-3b-instruct model.",
    model: "llama-3.2-3b-instruct",
  });
  // #endregion example-lmstudio-chat-model
});

test("LM Studio chat model with streaming using async generator", async () => {
  // #region example-lmstudio-chat-model-streaming
  const model = new LMStudioChatModel({
    baseURL: "http://localhost:1234/v1",
    model: "llama-3.2-3b-instruct",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "I'm an AI" });
    yield textDelta({ text: " assistant" });
    yield textDelta({ text: " running on" });
    yield textDelta({ text: " LM Studio" });
    yield textDelta({ text: " with the llama-3.2-3b-instruct model." });

    return { model: "llama-3.2-3b-instruct" };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me what model you're using" }],
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

  console.log(fullText); // Output: "I'm an AI assistant running on LM Studio with the llama-3.2-3b-instruct model."
  console.log(json); // { model: "llama-3.2-3b-instruct" }

  expect(fullText).toBe(
    "I'm an AI assistant running on LM Studio with the llama-3.2-3b-instruct model.",
  );
  expect(json).toEqual({
    model: "llama-3.2-3b-instruct",
  });
  // #endregion example-lmstudio-chat-model-streaming
});

let model: LMStudioChatModel;

beforeEach(() => {
  model = new LMStudioChatModel({
    model: "llama-3.2-3b-instruct",
  });
});

test("LMStudioChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "lmstudio-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("LMStudioChatModel.invoke with structured output", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "lmstudio-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolCallMessages(),
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

test("LMStudioChatModel default configuration", () => {
  const defaultModel = new LMStudioChatModel();

  expect(defaultModel.client.baseURL).toBe("http://localhost:1234/v1");
  expect(defaultModel.options?.model).toBe("llama-3.2-3b-instruct");
});

test("LMStudioChatModel with custom configuration", () => {
  const customModel = new LMStudioChatModel({
    baseURL: "http://custom-host:8080/v1",
    model: "custom-model",
    apiKey: "custom-key",
  });

  expect(customModel.client.baseURL).toBe("http://custom-host:8080/v1");
  expect(customModel.options?.model).toBe("custom-model");
});

test("LMStudioChatModel with environment variables", () => {
  const originalBaseUrl = process.env.LM_STUDIO_BASE_URL;
  const originalApiKey = process.env.LM_STUDIO_API_KEY;

  process.env.LM_STUDIO_BASE_URL = "http://env-host:3000/v1";
  process.env.LM_STUDIO_API_KEY = "env-key";

  const envModel = new LMStudioChatModel();

  expect(envModel.client.baseURL).toBe("http://env-host:3000/v1");

  // Restore original env vars
  if (originalBaseUrl !== undefined) {
    process.env.LM_STUDIO_BASE_URL = originalBaseUrl;
  } else {
    delete process.env.LM_STUDIO_BASE_URL;
  }

  if (originalApiKey !== undefined) {
    process.env.LM_STUDIO_API_KEY = originalApiKey;
  } else {
    delete process.env.LM_STUDIO_API_KEY;
  }
});

test("LMStudioChatModel API key handling", () => {
  const model1 = new LMStudioChatModel();
  const model2 = new LMStudioChatModel({ apiKey: "custom-api-key" });

  // Default API key should be "not-required" since LM Studio doesn't require authentication
  expect(model1.client.apiKey).toBe("not-required");
  expect(model2.client.apiKey).toBe("custom-api-key");
});
