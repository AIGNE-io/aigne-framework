import { describe, expect, spyOn, test } from "bun:test";
import { join } from "node:path";
import { BedrockChatModel, extractLastJsonObject } from "@aigne/core/models/bedrock-chat-model.js";
import { parseJSON } from "@aigne/core/utils/json-schema.js";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import { createMockEventStream } from "../_utils/event-stream.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

test("BedrockChatModel.invoke 1", async () => {
  const model = new BedrockChatModel();

  spyOn(model.client, "send").mockImplementation(() =>
    Promise.resolve({
      stream: createMockEventStream({
        path: join(import.meta.dirname, "bedrock-streaming-response-1.txt"),
      }),
    }),
  );

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toMatchSnapshot();
});

test("BedrockChatModel.invoke 2", async () => {
  const model = new BedrockChatModel();

  spyOn(model.client, "send").mockImplementation(() =>
    Promise.resolve({
      stream: createMockEventStream({
        path: join(import.meta.dirname, "bedrock-streaming-response-2.txt"),
      }),
    }),
  );
  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toMatchSnapshot();
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

describe("extractLastJsonObject", () => {
  test("should extract last JSON object from text", () => {
    const text = `
      <thinking>...</thinking>
      {"key2": "value2", "key3": {"key4": "value4", "key5": [{"key6": "value6"}]}}
    `;
    const match = extractLastJsonObject(text);
    expect(match).toBeTruthy();
    if (match) {
      expect(match).toBe(
        '{"key2": "value2", "key3": {"key4": "value4", "key5": [{"key6": "value6"}]}}',
      );
      expect(parseJSON(match)).toEqual({
        key2: "value2",
        key3: { key4: "value4", key5: [{ key6: "value6" }] },
      });
    }
  });
});
