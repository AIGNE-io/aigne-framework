import { expect, test } from "bun:test";
import { ChatMessagesTemplate, ChatModelOpenAI } from "@aigne/core";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

test("ChatModelOpenAI.run", async () => {
  const model = new ChatModelOpenAI({
    apiKey: OPENAI_API_KEY,
    model: DEFAULT_CHAT_MODEL,
  });

  const result = await model.call({
    messages: ChatMessagesTemplate.from("Hello, I'am Bob").format(),
  });

  expect(result).toEqual({ text: expect.stringContaining("Bob") });
});
