import { expect, spyOn, test } from "bun:test";
import { ChatMessagesTemplate, ChatModelOpenAI } from "@aigne/core";

test("ChatModelOpenAI.run", async () => {
  const model = new ChatModelOpenAI();

  spyOn(model, "process").mockImplementation(async () => ({
    text: "Hello, Bob. How can I help you?",
  }));

  const result = await model.call({
    messages: ChatMessagesTemplate.from("Hello, I'am Bob").format(),
  });

  expect(result).toEqual({ text: "Hello, Bob. How can I help you?" });
});
