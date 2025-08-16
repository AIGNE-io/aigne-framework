import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { joinURL } from "ufo";
import { AIGNEHubChatModel } from "../src/blocklet-aigne-hub-model.js";
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
  const model = new AIGNEHubChatModel({ url: url });

  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
    process.env.BLOCKLET_AIGNE_API_URL = url;
  });

  afterEach(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
    delete process.env.BLOCKLET_AIGNE_API_URL;
  });

  afterAll(async () => {
    await close();
  });

  describe("constructor", () => {
    test("should create instance with options", () => {
      expect(model.options.url).toBe(url);
      expect(model.options.apiKey).toBeUndefined();
      expect(model.options.model).toBeUndefined();
    });
  });

  describe("client", () => {
    test("should create client on first call", async () => {
      const client = await model.client();
      expect(client).toBeDefined();
    });

    test("should reuse client on subsequent calls", async () => {
      const client1 = await model.client();
      const client2 = await model.client();
      expect(client1).toBe(client2);
    });

    test("should throw error for unsupported provider", async () => {
      process.env.BLOCKLET_AIGNE_API_PROVIDER = "unsupported";
      await expect(model.client()).rejects.toThrow(/Unsupported model provider/);
    });
  });

  describe("getCredential", () => {
    test("should return credentials from environment variables", async () => {
      const credential = await model.getCredential();

      expect(credential.url).toBe(joinURL(url, "ai-kit"));
      expect(credential.apiKey).toBe("test-api-key");
      expect(credential.model).toBe("openai/gpt-4o-mini");
    });
  });

  describe("error handling", () => {
    test("should handle credential parsing errors gracefully", async () => {
      process.env.BLOCKLET_AIGNE_API_CREDENTIAL = '{"invalid": "json"';

      const credential = await model.getCredential();
      expect(credential).toBeDefined();
    });

    test("should handle missing environment variables", async () => {
      delete process.env.BLOCKLET_AIGNE_API_PROVIDER;
      delete process.env.BLOCKLET_AIGNE_API_MODEL;
      delete process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
      delete process.env.BLOCKLET_AIGNE_API_URL;

      const credential = await model.getCredential();
      expect(credential.url).toBe(joinURL(url, "ai-kit"));
    });
  });

  describe("other model options", () => {
    test("gemini-2.0-flash", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "google/gemini-2.0-flash";
      const model = new AIGNEHubChatModel({ url: url });
      const credential = await model.getCredential();
      expect(credential.model).toBe("google/gemini-2.0-flash");
    });

    test("deepseek-r1", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "deepseek/deepseek-r1";
      const model = new AIGNEHubChatModel({ url: url });
      const credential = await model.getCredential();
      expect(credential.model).toBe("deepseek/deepseek-r1");
    });
  });
});
