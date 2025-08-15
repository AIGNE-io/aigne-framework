import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta, textDelta } from "@aigne/core";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("OpenAI chat model basic usage", async () => {
  // #region example-bedrock-chat-model
  const model = new BedrockChatModel({
    // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
    model: "us.amazon.nova-premier-v1:0",
    modelOptions: {
      temperature: 0.7,
    },
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      text: "Hello! How can I assist you today?",
      model: "gpt-4o",
      usage: {
        inputTokens: 10,
        outputTokens: 9,
      },
    }),
  );

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
  // #endregion example-bedrock-chat-model
});

test("OpenAI chat model with streaming using async generator", async () => {
  // #region example-bedrock-chat-model-streaming
  const model = new BedrockChatModel({
    // Provide API key directly or use environment variable AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
    model: "us.amazon.nova-premier-v1:0",
    modelOptions: {
      temperature: 0.7,
    },
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
  // #endregion example-bedrock-chat-model-streaming
});

test("BedrockChatModel.invoke with tool call and structured output", async () => {
  const model = new BedrockChatModel({
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  });

  const client = await model.client();
  spyOn(client, "send")
    .mockImplementationOnce(() =>
      Promise.resolve({
        stream: createMockEventStream({
          path: join(import.meta.dirname, "bedrock-streaming-response-1.txt"),
        }),
      }),
    )
    .mockImplementationOnce(() =>
      Promise.resolve({
        stream: createMockEventStream({
          path: join(import.meta.dirname, "bedrock-streaming-response-2.txt"),
        }),
      }),
    )
    .mockImplementationOnce(() => import("./bedrock-structured-response-3.json"));

  const result1 = await model.invoke({
    messages: await createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result1).toMatchSnapshot();

  const result2 = await model.invoke({
    messages: await createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result2).toMatchSnapshot();
});

test("BedrockChatModel.invoke with streaming", async () => {
  const model = new BedrockChatModel({
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  });
  const client = await model.client();

  spyOn(client, "send").mockImplementation(() =>
    Promise.resolve({
      stream: createMockEventStream({
        path: join(import.meta.dirname, "bedrock-streaming-response-text.txt"),
      }),
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

test("BedrockChatModel.invoke without streaming", async () => {
  const model = new BedrockChatModel({
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  });

  const client = await model.client();
  spyOn(client, "send").mockImplementation(() =>
    Promise.resolve({
      stream: createMockEventStream({
        path: join(import.meta.dirname, "bedrock-streaming-response-text.txt"),
      }),
    }),
  );

  const result = await model.invoke({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});
