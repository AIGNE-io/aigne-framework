import { afterAll, afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { ChatModel, isAgentResponseDelta } from "@aigne/core";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { joinURL } from "ufo";
import { AIGNEHubChatModel } from "../src/index.js";
import { createHonoServer } from "./_mocks_/server.js";

const mockEnv = {
  BLOCKLET_AIGNE_API_PROVIDER: "aigne-hub",
  BLOCKLET_AIGNE_API_MODEL: "openai/gpt-4o-mini",
  BLOCKLET_AIGNE_API_CREDENTIAL: JSON.stringify({ apiKey: "test-api-key" }),
  BLOCKLET_APP_PID: "test-pid",
  ABT_NODE_DID: "test-did",
};

describe("AIGNEHubChatModel", async () => {
  const { url, aigne, close } = await createHonoServer();

  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
    process.env.BLOCKLET_AIGNE_API_URL = url;
  });

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => delete process.env[key]);
    delete process.env.BLOCKLET_AIGNE_API_URL;
  });

  afterAll(async () => {
    await close();
  });

  describe("constructor", () => {
    test("should create instance with options", () => {
      const model = new AIGNEHubChatModel({ url });
      expect(model.options.url).toBe(url);
      expect(model.options.apiKey).toBeUndefined();
      expect(model.options.model).toBeUndefined();
    });
  });

  describe("client", () => {
    test("should create client on first call", async () => {
      const model = new AIGNEHubChatModel({ url });
      const client = model["client"];
      expect(client).toBeDefined();
    });

    test("should throw error for unsupported provider", async () => {
      process.env.BLOCKLET_AIGNE_API_PROVIDER = "unsupported";
      expect(() => new AIGNEHubChatModel({ url })).toThrowError(/Unsupported model provider/);
    });
  });

  describe("credential", () => {
    test("should return credentials from environment variables", async () => {
      const model = new AIGNEHubChatModel({ url });
      const credential = await model.credential;

      expect(credential.url).toBe(joinURL(url, "ai-kit/api/v2/chat"));
      expect(credential.apiKey).toBe("test-api-key");
      expect(credential.model).toBe("openai/gpt-4o-mini");
    });
  });

  describe("error handling", () => {
    test("should handle credential parsing errors gracefully", async () => {
      process.env.BLOCKLET_AIGNE_API_CREDENTIAL = '{"invalid": "json"';

      const model = new AIGNEHubChatModel({ url });

      const credential = await model.credential;
      expect(credential).toBeDefined();
    });

    test("should handle missing environment variables", async () => {
      delete process.env.BLOCKLET_AIGNE_API_PROVIDER;
      delete process.env.BLOCKLET_AIGNE_API_MODEL;
      delete process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
      delete process.env.BLOCKLET_AIGNE_API_URL;

      const model = new AIGNEHubChatModel({ url });

      const credential = await model.credential;
      expect(credential.url).toBe(joinURL(url, "ai-kit/api/v2/chat"));
    });
  });

  describe("other model options", () => {
    test("gemini-2.0-flash", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "google/gemini-2.0-flash";
      const model = new AIGNEHubChatModel({ url: url });
      const credential = await model.credential;
      expect(credential.model).toBe("google/gemini-2.0-flash");
    });

    test("deepseek-r1", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "deepseek/deepseek-r1";
      const model = new AIGNEHubChatModel({ url: url });
      const credential = await model.credential;
      expect(credential.model).toBe("deepseek/deepseek-r1");
    });
  });

  test("AIGNEHubChatModel example simple", async () => {
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
  });

  test("AIGNEHubChatModel example with streaming", async () => {
    assert(aigne.model instanceof ChatModel);

    const processSpy = spyOn(aigne.model, "process").mockReturnValueOnce(
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
    expect(processSpy.mock.calls.at(-1)?.[0]).toMatchInlineSnapshot(`
      {
        "messages": [
          {
            "content": "hello",
            "role": "user",
          },
        ],
        "modelOptions": {
          "model": "openai/gpt-4o-mini",
          "parallelToolCalls": true,
        },
      }
    `);
  });
});
