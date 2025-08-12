import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import {
  AIAgent,
  AIGNE,
  ChatModel,
  type ContextEventMap,
  isAgentResponseDelta,
  type Message,
} from "@aigne/core";
import {
  arrayToReadableStream,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";
import { DefaultMemory, DefaultMemoryStorage } from "@aigne/default-memory";
import { agentResponseStreamToArraySnapshot } from "@aigne/test-utils/utils/agent-response.js";
import {
  AIGNEHTTPClient,
  type AIGNEHTTPClientInvokeOptions,
} from "@aigne/transport/http-client/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import compression from "compression";
import { detect } from "detect-port";
import express from "express";
import { Hono } from "hono";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

test("AIGNEClient example simple", async () => {
  const { url, aigne, close } = await createHonoServer();

  assert(aigne.model instanceof ChatModel);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello world!")),
  );

  // #region example-aigne-client-simple

  const client = new AIGNEHTTPClient({ url });

  const response = await client.invoke("chat", { message: "hello" });

  console.log(response); // Output: {message: "Hello world!"}

  expect(response).toEqual({ message: "Hello world!" });

  // #endregion example-aigne-client-simple

  await close();
});

test("AIGNEClient example with streaming", async () => {
  const { url, aigne, close } = await createHonoServer();

  assert(aigne.model instanceof ChatModel);

  spyOn(aigne.model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello world!")),
  );

  // #region example-aigne-client-streaming

  const client = new AIGNEHTTPClient({ url });

  const stream = await client.invoke("chat", { message: "hello" }, { streaming: true });

  let text = "";
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      if (chunk.delta.text?.message) text += chunk.delta.text.message;
    }
  }

  console.log(text); // Output: "Hello world!"

  expect(text).toEqual("Hello world!");

  // #endregion example-aigne-client-streaming

  await close();
});

interface Server {
  url: string;
  aigne: AIGNE;
  close: () => unknown;
}

const servers: { name: string; createServer: () => Promise<Server> }[] = [
  { name: "express", createServer: createExpressServer },
  {
    name: "express (with json middleware)",
    createServer: () => createExpressServer({ enableJSONMiddleware: true }),
  },
  {
    name: "express (with compression middleware)",
    createServer: () => createExpressServer({ enableCompression: true }),
  },
  {
    name: "express (pass body directly)",
    createServer: () => createExpressServer({ passBodyDirectly: true }),
  },
  { name: "hono", createServer: createHonoServer },
];
const options: AIGNEHTTPClientInvokeOptions[] = [
  { streaming: true },
  { streaming: true, returnProgressChunks: true },
  { streaming: false },
];

const table = servers.flatMap((server) =>
  options.map((options) => [options, server.name, server.createServer] as const),
);

test.each(table)(
  "AIGNEClient should return correct process options %p for %s server",
  async (options, _, createServer) => {
    const { url, aigne, close } = await createServer();
    try {
      assert(aigne.model instanceof ChatModel);

      spyOn(aigne.model, "process").mockReturnValueOnce(
        Promise.resolve(stringToAgentResponseStream("Hello world!")),
      );

      const client = new AIGNEHTTPClient({ url });
      const response = await client.invoke("chat", { message: "hello" }, options);

      if (options.streaming) {
        assert(response instanceof ReadableStream);
        expect(await agentResponseStreamToArraySnapshot(response)).toMatchSnapshot();
      } else {
        expect(response).toMatchSnapshot();
      }
    } finally {
      await close();
    }
  },
);

test.each(table)(
  "AIGNEClient should return error with options %p for %s server",
  async (options, _, createServer) => {
    const { url, aigne, close } = await createServer();

    try {
      assert(aigne.model instanceof ChatModel);

      spyOn(aigne.model, "process").mockReturnValueOnce(
        Promise.resolve(
          arrayToReadableStream([
            { delta: { text: { text: "Hello" } } },
            { delta: { text: { text: ", world" } } },
            new Error("test llm model error"),
          ]),
        ),
      );

      const client = new AIGNEHTTPClient({ url });
      const response = client.invoke("chat", { message: "hello" }, options);

      if (options.streaming) {
        const stream = await response;
        assert(stream instanceof ReadableStream);
        expect(
          agentResponseStreamToArraySnapshot(stream, { catchError: true }),
        ).resolves.toMatchSnapshot();
      } else {
        expect(response).rejects.toThrow("test llm model error");
      }
    } finally {
      await close();
    }
  },
);

test.each(table)(
  "AIGNEClient should return error 'not found agent' with options %p for %s server",
  async (options, _, createServer) => {
    const { url, close } = await createServer();

    try {
      const client = new AIGNEHTTPClient({ url });

      const response = client.invoke("not-exists-agent", {}, options);

      expect(response).rejects.toThrow("Agent not-exists-agent not found");
    } finally {
      await close();
    }
  },
);

test.each(table)(
  "AIGNEClient should return error 'unsupported media type' with options %p for %s server",
  async (options, _, createServer) => {
    const { url, close } = await createServer();

    try {
      const client = new AIGNEHTTPClient({ url });

      const response = client.invoke("chat", "invalid body" as unknown as Message, {
        ...options,
        fetchOptions: { headers: { "Content-Type": "text/plain" } },
      });

      expect(response).rejects.toThrow(
        "Unsupported Media Type: Content-Type must be application/json",
      );
    } finally {
      await close();
    }
  },
);

test.each(table)(
  "AIGNEClient should return error 'invalid request body' with options %p for %s server",
  async (options, _, createServer) => {
    const { url, close } = await createServer();

    try {
      const client = new AIGNEHTTPClient({ url });

      const response = client.invoke("chat", [] as unknown as Message, options);

      expect(response).rejects.toThrow(
        "Invoke agent chat check arguments error: input: Expected object, received array",
      );
    } finally {
      await close();
    }
  },
);

test("AIGNEClient example simple", async () => {
  const { url, close } = await createHonoServer();

  const client = new AIGNEHTTPClient({ url });

  const error = spyOn(console, "error").mockImplementation(() => {});

  client.publish("chat", "Hello world!");
  client.subscribe("chat");
  client.unsubscribe("chat", () => {});
  client.emit("agentFailed", {} as ContextEventMap["agentFailed"][0]);
  client.on("agentFailed", () => {});
  client.once("agentFailed", () => {});
  client.off("agentFailed", () => {});

  expect(error).toHaveBeenCalledTimes(7);

  await close();

  error.mockRestore();
});

test("AIGNEClient should support invoke chat model on the server side", async () => {
  const { url, close, aigne } = await createExpressServer();

  try {
    assert(aigne.model instanceof ChatModel);

    const modelProcess = spyOn(aigne.model, "process").mockReturnValueOnce(
      stringToAgentResponseStream("Hello Bob, How can I help you?"),
    );

    const client = new AIGNEHTTPClient({ url });

    client.userContext.userId = "test_user_id";
    client.userContext.sessionId = "test_session_id";

    const response = await client.model.invoke({
      messages: [{ role: "user", content: "Hello, I'm Bob!" }],
    });
    expect(response).toMatchInlineSnapshot(`
      {
        "text": "Hello Bob, How can I help you?",
      }
    `);
    expect(modelProcess.mock.lastCall?.[0]).toMatchInlineSnapshot(`
      {
        "messages": [
          {
            "content": "Hello, I'm Bob!",
            "role": "user",
          },
        ],
      }
    `);
    expect(modelProcess.mock.lastCall?.[1]).toEqual(
      expect.objectContaining({
        context: expect.objectContaining({
          userContext: { userId: "test_user_id", sessionId: "test_session_id" },
        }),
      }),
    );
  } finally {
    close();
  }
});

test("AIGNEClient should support custom memory for client agent", async () => {
  const { url, close, aigne } = await createExpressServer();

  try {
    assert(aigne.model instanceof ChatModel);

    const modelProcess = spyOn(aigne.model, "process").mockReturnValueOnce(
      stringToAgentResponseStream("Hello Bob, How can I help you?"),
    );

    const client = new AIGNEHTTPClient({ url });

    const clientAgent = await client.getAgent({
      name: "chat",
      memory: new DefaultMemory(),
    });

    expect(clientAgent.memories.length).toBe(1);
    const memory = clientAgent.memories[0];
    expect(memory).toBeInstanceOf(DefaultMemory);
    assert(memory instanceof DefaultMemory);

    const { storage } = memory;
    assert(storage instanceof DefaultMemoryStorage);

    const response = await clientAgent.invoke({ message: "Hello, I'm Bob!" });
    expect(response).toEqual({ message: "Hello Bob, How can I help you?" });

    const memories = await (await storage.db).all("SELECT * FROM Memories");
    expect(memories).toMatchSnapshot(
      memories.map(() => ({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })),
    );

    spyOn(aigne.model, "process").mockReturnValueOnce(
      stringToAgentResponseStream("Your name is Bob."),
    );

    const response2 = await clientAgent.invoke({ message: "My name is?" });
    expect(response2).toEqual({ message: "Your name is Bob." });
    expect(modelProcess.mock.lastCall).toMatchSnapshot([{}, expect.anything()]);
  } finally {
    close();
  }
});

test("AIGNEClient should pass userContext to server side agent", async () => {
  const { url, close, aigne } = await createExpressServer();

  try {
    assert(aigne.model instanceof ChatModel);

    const modelProcess = spyOn(aigne.model, "process").mockReturnValueOnce(
      stringToAgentResponseStream("Hello Bob, How can I help you?"),
    );

    const client = new AIGNEHTTPClient({ url });

    const clientAgent = await client.getAgent({ name: "chat" });

    const response = await client.invoke(
      clientAgent,
      { message: "Hello, I'm Bob!" },
      { userContext: { userId: "test_user_id" } },
    );

    expect(response).toEqual({ message: "Hello Bob, How can I help you?" });

    expect(modelProcess).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        context: expect.objectContaining({
          userContext: { userId: "test_user_id" },
        }),
      }),
    );
  } finally {
    close();
  }
});

async function createExpressServer({
  enableCompression,
  enableJSONMiddleware,
  passBodyDirectly,
}: {
  enableCompression?: boolean;
  enableJSONMiddleware?: boolean;
  passBodyDirectly?: boolean;
} = {}) {
  const port = await detect();
  const url = `http://localhost:${port}/aigne/invoke`;

  const server = express();

  if (enableJSONMiddleware || passBodyDirectly) server.use(express.json());
  if (enableCompression) server.use(compression());

  const aigne = await createAIGNE();
  const aigneServer = new AIGNEHTTPServer(aigne);

  server.post("/aigne/invoke", async (req, res) => {
    await aigneServer.invoke(passBodyDirectly ? req.body : req, res);
  });

  const httpServer = server.listen(port);

  return {
    url,
    aigne,
    close: () => {
      httpServer.closeAllConnections();
      httpServer.close();
    },
  };
}

async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/aigne/invoke`;

  const honoApp = new Hono();

  const aigne = await createAIGNE();
  const aigneServer = new AIGNEHTTPServer(aigne);

  honoApp.post("/aigne/invoke", async (c) => {
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
    useMemoriesFromContext: true,
  });

  return new AIGNE({ model, agents: [chat] });
}
