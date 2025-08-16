import { describe, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { ChatModel, isAgentResponseDelta } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { AIGNEHubChatModel } from "../src/index.js";
import { createHonoServer } from "./_mocks_/server.js";

describe("aigne-hub-model", () => {
  test("AIGNEHubChatModel example simple", async () => {
    const { url, aigne, close } = await createHonoServer();

    assert(aigne.model instanceof ChatModel);

    spyOn(aigne.model, "process").mockReturnValueOnce(
      Promise.resolve(stringToAgentResponseStream("Hello world!")),
    );

    const client = new AIGNEHubChatModel({
      url,
      apiKey: "123",
      model: "openai/gpt-4o-mini",
    });

    const response = await client.invoke({ messages: [{ role: "user", content: "hello" }] });

    expect(response).toEqual({ text: "Hello world!" });

    await close();
  });

  test("AIGNEHubChatModel example with streaming", async () => {
    const { url, aigne, close } = await createHonoServer();

    assert(aigne.model instanceof ChatModel);

    spyOn(aigne.model, "process").mockReturnValueOnce(
      Promise.resolve(stringToAgentResponseStream("Hello world!")),
    );

    const client = new AIGNEHubChatModel({
      url,
      apiKey: "123",
      model: "openai/gpt-4o-mini",
    });

    const stream = await client.invoke(
      { messages: [{ role: "user", content: "hello" }] },
      { streaming: true },
    );

    let text = "";
    for await (const chunk of stream) {
      if (isAgentResponseDelta(chunk)) {
        if (chunk.delta.text?.text) text += chunk.delta.text.text;
      }
    }

    expect(text).toEqual("Hello world!");

    // #endregion example-aigne-client-streaming

    await close();
  });
});
