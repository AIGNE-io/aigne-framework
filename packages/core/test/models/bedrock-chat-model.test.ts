import { expect, test } from "bun:test";
import { BedrockChatModel } from "@aigne/core/models/bedrock-chat-model.js";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";
import {
  COMMON_RESPONSE_FORMAT,
  COMMON_TOOLS,
  createWeatherToolCallMessages,
  createWeatherToolExpected,
  createWeatherToolMessages,
} from "../_utils/openai-like-utils.js";

test("BedrockChatModel.invoke 1", async () => {
  const model = new BedrockChatModel();

  const result = await model.invoke({
    messages: createWeatherToolCallMessages(),
    tools: COMMON_TOOLS,
    responseFormat: COMMON_RESPONSE_FORMAT,
  });

  expect(result).toMatchSnapshot();
});

test("BedrockChatModel.invoke 2", async () => {
  const model = new BedrockChatModel();

  const result = await model.invoke({
    messages: createWeatherToolMessages(),
    tools: COMMON_TOOLS,
  });

  expect(result).toEqual(createWeatherToolExpected());
});

test("BedrockChatModel.invoke with streaming", async () => {
  const model = new BedrockChatModel();

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

  const result = await model.invoke({
    messages: [{ role: "user", content: "hello" }],
  });

  expect(result).toMatchSnapshot();
});
