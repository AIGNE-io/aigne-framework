import { expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { BedrockChatModel } from "@aigne/bedrock";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "@aigne/test-utils/utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "@aigne/test-utils/utils/openai-like-utils.js";

test("BedrockChatModel.invoke with tool call and structured output", async () => {
  const model = new BedrockChatModel();

  spyOn(model.client, "send")
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
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result1).toMatchSnapshot();

  const result2 = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result2).toMatchSnapshot();
});

test("BedrockChatModel.invoke with streaming", async () => {
  const model = new BedrockChatModel();

  spyOn(model.client, "send").mockImplementation(() =>
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
    undefined,
    { streaming: true },
  );

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("BedrockChatModel.invoke without streaming", async () => {
  const model = new BedrockChatModel();

  spyOn(model.client, "send").mockImplementation(() =>
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
