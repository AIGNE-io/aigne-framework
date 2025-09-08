import { beforeEach, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("OpenAI chat model basic usage", async () => {
  // #region example-openai-chat-model
  const model = new OpenAIChatModel({
    // Provide API key directly or use environment variable OPENAI_API_KEY
    apiKey: "your-api-key", // Optional if set in env variables
    model: "gpt-4o", // Defaults to "gpt-4o-mini" if not specified
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce({
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Hello, who are you?" }],
  });

  console.log(result);
  /* Output:
  {
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9
    }
  }
  */

  expect(result).toEqual({
    text: "Hello! How can I assist you today?",
    model: "gpt-4o",
    usage: {
      inputTokens: 10,
      outputTokens: 9,
    },
  });
  // #endregion example-openai-chat-model
});

test("OpenAI chat model with streaming using async generator", async () => {
  // #region example-openai-chat-model-stream
  const model = new OpenAIChatModel({
    apiKey: "your-api-key",
    model: "gpt-4o",
  });

  spyOn(model, "process").mockImplementationOnce(async function* () {
    yield textDelta({ text: "Hello!" });
    yield textDelta({ text: " How" });
    yield textDelta({ text: " can" });
    yield textDelta({ text: " I" });
    yield textDelta({ text: " assist" });
    yield textDelta({ text: " you" });
    yield textDelta({ text: " today?" });

    return {
      model: "gpt-4o",
      usage: { inputTokens: 10, outputTokens: 9 },
    };
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Hello, who are you?" }],
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

  console.log(fullText); // Output: "Hello! How can I assist you today?"
  console.log(json); // { model: "gpt-4o", usage: { inputTokens: 10, outputTokens: 9 } }

  expect(fullText).toBe("Hello! How can I assist you today?");
  expect(json).toEqual({
    model: "gpt-4o",
    usage: { inputTokens: 10, outputTokens: 9 },
  });
  // #endregion example-openai-chat-model-stream
});

let model: OpenAIChatModel;

beforeEach(() => {
  model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });
});

test("OpenAIChatModel.invoke should return the correct tool", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-1.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toMatchSnapshot();
});

test("OpenAIChatModel.invoke should return structured output", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
    }),
  );

  const result = await model.invoke({
    messages: await createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toMatchSnapshot();
});

test("OpenAIChatModel.invoke with streaming", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-text.txt"),
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

test("OpenAIChatModel.invoke without streaming", async () => {
  spyOn(model.client.chat.completions, "create").mockReturnValue(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-text.txt"),
    }),
  );

  const result = await model.invoke({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});

test("OpenAIChatModel should use tool to get json output directly if no tools input", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });

  spyOn(model.client.chat.completions, "create").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
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
      json: { text: "The current temperature in New York is 20°C." },
    }),
  );
});

test("OpenAIChatModel should try parse text as json if there are both tools and json response format (supportsToolsUseWithJsonSchema disabled)", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });
  model["supportsToolsUseWithJsonSchema"] = false;

  spyOn(model.client.chat.completions, "create").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
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
                description: "The location to get weather",
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
      json: { text: "The current temperature in New York is 20°C." },
    }),
  );
});

test("OpenAIChatModel should convert optional schema to nullable", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
    model: "gpt-4o-mini",
  });

  const createSpy = spyOn(model.client.chat.completions, "create").mockReturnValueOnce(
    createMockEventStream({
      path: join(import.meta.dirname, "openai-streaming-response-2.txt"),
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
          required: [],
        },
        strict: true,
      },
    },
  });

  expect(result).toEqual(
    expect.objectContaining({
      json: { text: "The current temperature in New York is 20°C." },
    }),
  );

  expect(createSpy.mock.calls[0]?.[0].response_format).toMatchInlineSnapshot(`
    {
      "json_schema": {
        "name": "output",
        "schema": {
          "additionalProperties": false,
          "properties": {
            "text": {
              "anyOf": [
                {
                  "description": "Your answer",
                  "type": "string",
                },
                {
                  "type": [
                    "null",
                  ],
                },
              ],
            },
          },
          "required": [
            "text",
          ],
          "type": "object",
        },
        "strict": true,
      },
      "type": "json_schema",
    }
  `);
});
