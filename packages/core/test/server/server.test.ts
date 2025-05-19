import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE, ChatModel } from "@aigne/core";
import { AIGNEClient } from "@aigne/core/client/index.js";
import { AIGNEServer } from "@aigne/core/server/index.js";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils";
import { serve } from "bun";
import { detect } from "detect-port";
import express from "express";
import { Hono } from "hono";
import { OpenAIChatModel } from "../_mocks/mock-models.js";

test("AIGNEServer example with expression", async () => {
  const port = await detect();
  const url = `http://localhost:${port}/aigne/invoke`;

  // #region example-aigne-server-express

  const model = new OpenAIChatModel();

  const chat = AIAgent.from({
    name: "chat",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({ model, agents: [chat] });

  // Create an AIGNEServer instance
  const aigneServer = new AIGNEServer(aigne);

  // Setup the server to handle incoming requests
  const server = express();
  server.post("/aigne/invoke", async (req, res) => {
    await aigneServer.invoke(req, res);
  });
  const httpServer = server.listen(port);

  assert(aigne.model instanceof ChatModel);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello world!")),
  );

  // Create an AIGNEClient instance
  const client = new AIGNEClient({ url });

  // Invoke the agent by client
  const response = await client.invoke("chat", { $message: "hello" });

  console.log(response); // Output: {$message: "Hello world!"}

  expect(response).toMatchSnapshot();

  // #endregion example-aigne-server-express

  httpServer.closeAllConnections();
  httpServer.close();
});

test("AIGNEServer example with hono", async () => {
  const port = await detect();
  const url = `http://localhost:${port}/aigne/invoke`;

  // #region example-aigne-server-hono

  const model = new OpenAIChatModel();

  const chat = AIAgent.from({
    name: "chat",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({ model, agents: [chat] });

  // Create an AIGNEServer instance
  const aigneServer = new AIGNEServer(aigne);

  // Setup the server to handle incoming requests
  const honoApp = new Hono();
  honoApp.post("/aigne/invoke", async (c) => {
    return aigneServer.invoke(c.req.raw);
  });
  const server = serve({ port, fetch: honoApp.fetch });

  assert(aigne.model instanceof ChatModel);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello world!")),
  );

  // Create an AIGNEClient instance
  const client = new AIGNEClient({ url });

  // Invoke the agent by client
  const response = await client.invoke("chat", { $message: "hello" });
  console.log(response); // Output: {$message: "Hello world!"}

  expect(response).toMatchSnapshot();

  // #endregion example-aigne-server-hono

  await server.stop();
});
