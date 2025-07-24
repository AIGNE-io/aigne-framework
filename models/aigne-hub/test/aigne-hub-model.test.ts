import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE, ChatModel, isAgentResponseDelta } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { AIGNEHubChatModel } from "../src/aigne-hub-model.js";

test("AIGNEHubChatModel example simple", async () => {
  const { url, aigne, close } = await createHonoServer();

  assert(aigne.model instanceof ChatModel);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello world!")),
  );

  const client = new AIGNEHubChatModel({
    url,
    accessKey: "123",
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
    accessKey: "123",
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

async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();

  const aigne = await createAIGNE();
  const aigneServer = new AIGNEHTTPServer(aigne);

  honoApp.post("/api/v2/chat", async (c) => {
    return aigneServer.invoke(c.req.raw);
  });

  const server = serve({ port, fetch: honoApp.fetch });

  return {
    url,
    aigne,
    close: () => server.stop(true),
  };
}

async function createAIGNE() {
  const model = new OpenAIChatModel();

  const chat = AIAgent.from({
    name: "chat",
    inputKey: "message",
  });

  return new AIGNE({ model, agents: [chat] });
}
