import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";
import type Anthropic from "@anthropic-ai/sdk";

test("Anthropic chat model basic usage", async () => {
  // #region example-anthropic-chat-model
  const model = new AnthropicChatModel({
    // Provide API key directly or use environment variable ANTHROPIC_API_KEY or CLAUDE_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    // Specify Claude model version (defaults to 'claude-3-7-sonnet-latest')
    model: "claude-3-haiku-20240307",
    // Configure model behavior
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
    model: "claude-3-haiku-20240307",
    usage: {
      inputTokens: 8,
      outputTokens: 15,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Tell me about yourself" }],
  });

  console.log(result);
  /* Output:
  {
    text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
    model: "claude-3-haiku-20240307",
    usage: {
      inputTokens: 8,
      outputTokens: 15
    }
  }
  */

  expect(result).toEqual({
    text: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
    model: "claude-3-haiku-20240307",
    usage: {
      inputTokens: 8,
      outputTokens: 15,
    },
  });
  // #endregion example-anthropic-chat-model
});

test("Anthropic chat model with streaming using async generator", async () => {
  // #region example-anthropic-chat-model-streaming-async-generator
  const model = new AnthropicChatModel({
    apiKey: "your-api-key",
    model: "claude-3-haiku-20240307",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "I'm Claude" });
    yield textDelta({ text: ", an AI assistant" });
    yield textDelta({ text: " created by Anthropic." });
    yield textDelta({ text: " How can I help you today?" });

    return {
      model: "claude-3-haiku-20240307",
      usage: { inputTokens: 8, outputTokens: 15 },
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
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) fullText += text;
      if (chunk.delta.json) Object.assign(json, chunk.delta.json);
    }
  }

  console.log(fullText); // Output: "I'm Claude, an AI assistant created by Anthropic. How can I help you today?"
  console.log(json); // { model: "claude-3-haiku-20240307", usage: { inputTokens: 8, outputTokens: 15 } }

  expect(fullText).toBe(
    "I'm Claude, an AI assistant created by Anthropic. How can I help you today?",
  );
  expect(json).toEqual({
    model: "claude-3-haiku-20240307",
    usage: { inputTokens: 8, outputTokens: 15 },
  });
  // #endregion example-anthropic-chat-model-streaming-async-generator
});

test("AnthropicChatModel.invoke", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream")
    .mockReturnValueOnce(
      createMockEventStream({
        path: join(import.meta.dirname, "anthropic-streaming-response-1.txt"),
      }),
    )
    .mockReturnValueOnce(
      createMockEventStream({
        path: join(import.meta.dirname, "anthropic-streaming-response-2.txt"),
      }),
    );

  spyOn(model.client.messages, "create").mockResolvedValue(
    (await import(
      "./anthropic-structured-response-3.json"
    )) as unknown as Anthropic.Messages.Message,
  );

  const result1 = await model.invoke({
    messages: await createWeatherToolMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result1).toMatchSnapshot();

  const result2 = await model.invoke({
    messages: await createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result2).toMatchSnapshot();
});

test("AnthropicChatModel.invoke should pass system and messages to claude correctly", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  const stream = spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "anthropic-streaming-response-1.txt"),
    }),
  );

  await model.invoke({
    messages: [
      { role: "system", content: "You are a chatbot" },
      { role: "user", content: "hello" },
    ],
  });

  expect(stream.mock.calls).toEqual([
    [
      expect.objectContaining({
        system: "You are a chatbot",
        messages: [{ role: "user", content: "hello" }],
      }),
    ],
  ]);
});

test("AnthropicChatModel.invoke should use system message as user message if messages is empty", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  const stream = spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "anthropic-streaming-response-1.txt"),
    }),
  );

  await model.invoke({
    messages: [{ role: "system", content: "You are a chatbot" }],
  });

  // Should not include system property in the request, the system message should be treated as user message
  expect(stream.mock.calls).toEqual([
    [
      expect.not.objectContaining({
        system: expect.anything(),
      }),
    ],
  ]);
  expect(stream.mock.calls).toEqual([
    [
      expect.objectContaining({
        messages: [{ role: "user", content: "You are a chatbot" }],
      }),
    ],
  ]);
});

test("AnthropicChatModel.invoke with streaming", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "anthropic-streaming-response-text.txt"),
    }),
  );

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "hello" }],
    },
    { streaming: true },
  );

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("AnthropicChatModel.invoke without streaming", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "anthropic-streaming-response-text.txt"),
    }),
  );

  const result = await model.invoke({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});
