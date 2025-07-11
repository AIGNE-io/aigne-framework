import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("Gemini chat model basic usage", async () => {
  // #region example-gemini-chat-model
  const model = new GeminiChatModel({
    // Provide API key directly or use environment variable GOOGLE_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify Gemini model version (defaults to 'gemini-1.5-pro' if not specified)
    model: "gemini-1.5-flash",
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash",
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
  });

  console.log(result);
  /* Output:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
  */

  expect(result).toEqual({
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash",
  });
  // #endregion example-gemini-chat-model
});

test("Gemini chat model with streaming using async generator", async () => {
  // #region example-gemini-chat-model-streaming
  const model = new GeminiChatModel({
    apiKey: "your-api-key",
    model: "gemini-1.5-flash",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "Hello from Gemini!" });
    yield textDelta({ text: " I'm Google's" });
    yield textDelta({ text: " helpful AI" });
    yield textDelta({ text: " assistant." });
    yield textDelta({ text: " How can I assist you today?" });

    return {
      model: "gemini-1.5-flash",
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

  console.log(fullText); // Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
  console.log(json); // { model: "gemini-1.5-flash" }

  expect(fullText).toBe(
    "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  );
  expect(json).toEqual({
    model: "gemini-1.5-flash",
  });
  // #endregion example-gemini-chat-model-streaming
});

let model: GeminiChatModel;

beforeEach(() => {
  model = new GeminiChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gemini-2.0-flash",
  });
});

test("GeminiChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "gemini-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("GeminiChatModel.invoke should use tool result correctly", async () => {
  const create = spyOn(model.client.chat.completions, "create")
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "gemini-streaming-response-2.txt") }),
    )
    .mockReturnValueOnce(
      createMockEventStream({ path: join(import.meta.dirname, "gemini-streaming-response-3.txt") }),
    );

  const result = await model.invoke({
    messages: await createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(create.mock.lastCall).toMatchSnapshot();

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The temperature in New York is 20 degrees." },
      usage: {
        inputTokens: 66,
        outputTokens: 32,
      },
    }),
  );
});

test("GeminiChatModel should reset last message role from system to user", async () => {
  const create = spyOn(model.client.chat.completions, "create").mockReturnValueOnce(
    createMockEventStream({ path: join(import.meta.dirname, "gemini-streaming-response-2.txt") }),
  );

  const _result = await model.invoke({
    messages: [
      {
        role: "system",
        content: "This is a system message that should be treated as user input.",
      },
    ],
  });

  expect(create).toHaveBeenLastCalledWith(
    expect.objectContaining({
      messages: [
        { role: "user", content: "This is a system message that should be treated as user input." },
      ],
    }),
  );
});
