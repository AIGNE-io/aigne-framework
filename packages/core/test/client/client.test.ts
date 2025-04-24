import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import type { Server } from "node:http";
import { AIAgent, type ChatModel, ExecutionEngine } from "@aigne/core";
import { ExecutionEngineClient } from "@aigne/core/client/client.js";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { createExpressMiddleware } from "@aigne/core/server/express.js";
import { arrayToReadableStream, readableStreamToArray } from "@aigne/core/utils/stream-utils";
import { detect } from "detect-port";
import express from "express";

let port: number;
let model: ChatModel;
let httpServer: Server;
let url: string;

beforeEach(async () => {
  port = await detect();

  model = new OpenAIChatModel();

  const chat = AIAgent.from({
    name: "chat",
  });

  const engine = new ExecutionEngine({ model, agents: [chat] });

  const server = express();

  server.use(express.json());

  server.use(createExpressMiddleware(engine));

  httpServer = server.listen(port);

  url = `http://localhost:${port}`;
});

afterEach(async () => {
  httpServer.closeAllConnections();
  httpServer.close();
});

test.each([{ streaming: false }, { streaming: true }])(
  "ExecutionEngineClient should return correct response for %p",
  async (options) => {
    const client = new ExecutionEngineClient({ url });
    const response = await client.call("chat", { $message: "hello" }, options);

    if (options.streaming) {
      assert(response instanceof ReadableStream);
      expect(readableStreamToArray(response)).resolves.toMatchSnapshot();
    } else {
      expect(response).toMatchSnapshot();
    }
  },
);

test.each([{ streaming: false }, { streaming: true }])(
  "ExecutionEngineClient should return error response for %p",
  async (options) => {
    spyOn(model, "process").mockReturnValueOnce(
      Promise.resolve(
        arrayToReadableStream([
          { delta: { text: { text: "Hello" } } },
          { delta: { text: { text: ", world" } } },
          new Error("test error"),
        ]),
      ),
    );

    const client = new ExecutionEngineClient({ url });
    const response = client.call("chat", { $message: "hello" }, options);

    if (options.streaming) {
      const stream = await response;
      assert(stream instanceof ReadableStream);
      expect(readableStreamToArray(stream, { catchError: true })).resolves.toMatchSnapshot();
    } else {
      expect(response).rejects.toThrow("test error");
    }
  },
);
