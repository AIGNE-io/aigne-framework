import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ChatModelInput } from "@aigne/core";
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
  const { url, close } = await createHonoServer();

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

  describe("process", () => {
    test("should process input with client and add headers", async () => {
      const model = new AIGNEHubChatModel({ url });
      const input: ChatModelInput = {
        messages: [{ role: "user" as const, content: "Hello" }],
      };
      const result = await model.invoke(input, {});
      // @ts-ignore
      expect(result.headers["x-aigne-hub-client-did"]).toBe("test-pid");
    });

    test("should use ABT_NODE_DID when BLOCKLET_APP_PID is not available", async () => {
      delete process.env.BLOCKLET_APP_PID;
      process.env.ABT_NODE_DID = "test-did-value";

      const model = new AIGNEHubChatModel({ url });
      const input: ChatModelInput = {
        messages: [{ role: "user" as const, content: "Hello" }],
      };
      const result = await model.invoke(input, {});
      // @ts-ignore
      expect(result.headers["x-aigne-hub-client-did"]).toBe("test-did-value");
    });

    test("should use empty string when neither BLOCKLET_APP_PID nor ABT_NODE_DID is available", async () => {
      delete process.env.BLOCKLET_APP_PID;
      delete process.env.ABT_NODE_DID;

      const model = new AIGNEHubChatModel({ url });
      const input: ChatModelInput = {
        messages: [{ role: "user" as const, content: "Hello" }],
      };
      const result = await model.invoke(input, {});
      // @ts-ignore
      expect(result.headers["x-aigne-hub-client-did"]).toMatch(/@aigne\/aigne-hub/);
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
});
