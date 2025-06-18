import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import detectPort from "detect-port";
import express from "express";

test("Example HTTPTransport: AIGNEHTTPServer and AIGNEHTTPClient", async () => {
  // #region example-http-transport

  // #region example-http-transport-create-named-agent
  const agent = AIAgent.from({
    name: "chatbot",
    instructions: "You are a helpful assistant",
    memory: new DefaultMemory(),
    inputKey: "message",
  });
  // #endregion example-http-transport-create-named-agent

  // #region example-http-transport-create-aigne
  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
    agents: [agent],
  });
  assert(aigne.model);
  // #endregion example-http-transport-create-aigne

  // #region example-http-transport-create-http-server
  const server = new AIGNEHTTPServer(aigne);

  const app = express();

  app.post("/api/chat", async (req, res) => {
    const userId = "user_123"; // Example user ID, replace with actual logic to get user ID
    await server.invoke(req, res, { userContext: { userId } });
  });

  let port = 3000;
  port = await detectPort();

  const httpServer = app.listen(port);
  // #endregion example-http-transport-create-http-server

  // #endregion example-http-transport

  // #region example-http-client-usage

  // #region example-http-client-create-client
  const client = new AIGNEHTTPClient({ url: `http://localhost:${port}/api/chat` });
  // #endregion example-http-client-create-client

  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "The current price of ABT/USD on Coinbase is $0.9684.",
  });

  // #region example-http-client-invoke-agent
  const result = await client.invoke("chatbot", {
    message: "What is the crypto price of ABT/USD on coinbase?",
  });
  console.log(result);
  // Output: { message: "The current price of ABT/USD on Coinbase is $0.9684." }
  expect(result).toEqual({ message: "The current price of ABT/USD on Coinbase is $0.9684." });
  // #endregion example-http-client-invoke-agent

  // #endregion example-http-client-usage

  httpServer.closeAllConnections();
  httpServer.close();
});
