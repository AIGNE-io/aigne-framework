import { expect, spyOn, test } from "bun:test";
import { readFile } from "node:fs/promises";
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

  expect(stream.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "max_tokens": 64000,
          "messages": [
            {
              "content": [
                {
                  "cache_control": {
                    "ttl": undefined,
                    "type": "ephemeral",
                  },
                  "text": "hello",
                  "type": "text",
                },
              ],
              "role": "user",
            },
          ],
          "model": "claude-3-7-sonnet-latest",
          "stream": true,
          "system": [
            {
              "cache_control": {
                "ttl": undefined,
                "type": "ephemeral",
              },
              "text": "You are a chatbot",
              "type": "text",
            },
          ],
          "temperature": undefined,
          "tool_choice": undefined,
          "tools": undefined,
          "top_p": undefined,
        },
      ],
    ]
  `);
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

test("AnthropicChatModel should use tool to get json output directly if no tools input", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "create").mockReturnValueOnce(
    JSON.parse(
      await readFile(join(import.meta.dirname, "anthropic-structured-response-3.json"), "utf8"),
    ),
  );

  const result = await model.invoke({
    messages: [
      {
        role: "system",
        content: `\
What is the weather in New York?

<context>
{
  "city": "New York",
  "temperature": 20
}
</context>
`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "output",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            text: {
              type: "string",
              description: "Your answer",
            },
          },
          required: ["text"],
        },
        strict: true,
      },
    },
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20 degrees." },
    }),
  );
});

test("AnthropicChatModel should try parse text as json if there are both tools and json response format", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.messages, "stream").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "anthropic-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: [
      {
        role: "system",
        content: `\
What is the weather in New York?

<context>
{
  "city": "New York",
  "temperature": 20
}
</context>
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "The location to get wether",
              },
            },
            required: ["city"],
          },
        },
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "output",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            text: {
              type: "string",
              description: "Your answer",
            },
          },
          required: ["text"],
        },
        strict: true,
      },
    },
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20 degrees." },
    }),
  );
});

test("AnthropicChatModel.getMaxTokens should return max tokens correctly", async () => {
  const model = new AnthropicChatModel({
    apiKey: "YOUR_API_KEY",
  });

  expect(model["getMaxTokens"]("claude-opus-4-20250514")).toBe(32000);
  expect(model["getMaxTokens"]("claude-sonnet-4-20250514")).toBe(64000);
  expect(model["getMaxTokens"]("claude-3-7-sonnet-20250219")).toBe(64000);
  expect(model["getMaxTokens"]("claude-3-5-sonnet-20241022")).toBe(8192);
  expect(model["getMaxTokens"]("claude-3-5-haiku-20241022")).toBe(8192);
  expect(model["getMaxTokens"]("claude-3-opus-20240229")).toBe(4096);
  expect(model["getMaxTokens"]("claude-3-haiku-20240307")).toBe(4096);
});
