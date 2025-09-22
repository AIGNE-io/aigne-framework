import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { FileOutputType } from "@aigne/core";
import { joinURL } from "ufo";
import { AIGNEHubImageModel as AIGNEHubImageModel2 } from "../src/aigne-hub-image-model.js";
import { AIGNEHubImageModel } from "../src/index.js";
import { createHonoServer } from "./_mocks_/server.js";

const mockEnv = {
  BLOCKLET_AIGNE_API_PROVIDER: "aigne-hub",
  BLOCKLET_AIGNE_API_MODEL: "openai/gpt-image-1",
  BLOCKLET_AIGNE_API_CREDENTIAL: JSON.stringify({ apiKey: "test-api-key" }),
  BLOCKLET_APP_PID: "test-pid",
  ABT_NODE_DID: "test-did",
};

describe("AIGNEHubImageModel", async () => {
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
      const model = new AIGNEHubImageModel({ url });
      expect(model.options.url).toBe(url);
      expect(model.options.apiKey).toBeUndefined();
      expect(model.options.model).toBeUndefined();
    });
  });

  describe("client", () => {
    test("should create client on first call", async () => {
      const model = new AIGNEHubImageModel({ url });
      const client = model["client"];
      expect(client).toBeDefined();
    });

    test("should throw error for unsupported provider", async () => {
      process.env.BLOCKLET_AIGNE_API_PROVIDER = "unsupported";
      expect(() => new AIGNEHubImageModel({ url })).toThrowError(/Unsupported model provider/);
    });
  });

  describe("credential", () => {
    test("should return credentials from environment variables", async () => {
      const model = new AIGNEHubImageModel({ url });
      const credential = await model.credential;

      expect(credential.url).toBe(joinURL(url, "ai-kit/api/v2/image"));
      expect(credential.apiKey).toBe("test-api-key");
      expect(credential.model).toBe("openai/gpt-image-1");
    });
  });

  describe("error handling", () => {
    test("should handle credential parsing errors gracefully", async () => {
      process.env.BLOCKLET_AIGNE_API_CREDENTIAL = '{"invalid": "json"';

      const model = new AIGNEHubImageModel({ url });

      const credential = await model.credential;
      expect(credential).toBeDefined();
    });

    test("should handle missing environment variables", async () => {
      delete process.env.BLOCKLET_AIGNE_API_PROVIDER;
      delete process.env.BLOCKLET_AIGNE_API_MODEL;
      delete process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
      delete process.env.BLOCKLET_AIGNE_API_URL;

      const model = new AIGNEHubImageModel({ url });

      const credential = await model.credential;
      expect(credential.url).toBe(joinURL(url, "ai-kit/api/v2/image"));
    });
  });

  describe("other model options", () => {
    test("imagen-4.0-generate-001", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "google/imagen-4.0-generate-001";
      const model = new AIGNEHubImageModel({ url: url });
      const credential = await model.credential;
      expect(credential.model).toBe("google/imagen-4.0-generate-001");
    });
  });

  test("AIGNEHubImageModel example simple", async () => {
    const client = new AIGNEHubImageModel({
      url,
      apiKey: "123",
      model: "openai/dall-e-3",
    });

    const response = await client.invoke({ prompt: "hello", outputType: FileOutputType.file });
    expect(response).toMatchInlineSnapshot(`
      {
        "images": [
          {
            "data": "test image base64",
            "type": "file",
          },
        ],
        "model": "openai/dall-e-3",
        "usage": {
          "aigneHubCredits": 100,
          "inputTokens": 0,
          "outputTokens": 0,
        },
      }
    `);
  });

  test("AIGNEHubImageModel2 example simple", async () => {
    const client = new AIGNEHubImageModel2({
      url,
      apiKey: "123",
      model: "openai/dall-e-3",
    });

    const response = await client.invoke({ prompt: "hello", outputType: FileOutputType.file });
    expect(response).toMatchInlineSnapshot(`
      {
        "images": [
          {
            "data": "test image base64",
            "type": "file",
          },
        ],
        "model": "openai/dall-e-3",
        "usage": {
          "aigneHubCredits": 100,
          "inputTokens": 0,
          "outputTokens": 0,
        },
      }
    `);
  });
});
