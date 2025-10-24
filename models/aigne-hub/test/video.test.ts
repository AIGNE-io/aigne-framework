import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { joinURL } from "ufo";
import { AIGNEHubVideoModel as AIGNEHubVideoModel2 } from "../src/aigne-hub-video-model.js";
import { AIGNEHubVideoModel } from "../src/index.js";
import { createHonoServer } from "./_mocks_/server.js";

const mockEnv = {
  BLOCKLET_AIGNE_API_PROVIDER: "aigne-hub",
  BLOCKLET_AIGNE_API_MODEL: "openai/sora-2",
  BLOCKLET_AIGNE_API_CREDENTIAL: JSON.stringify({ apiKey: "test-api-key" }),
  BLOCKLET_APP_PID: "test-pid",
  ABT_NODE_DID: "test-did",
};

describe("AIGNEHubVideoModel", async () => {
  const { url: baseURL, close } = await createHonoServer();

  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
    process.env.BLOCKLET_AIGNE_API_URL = baseURL;
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
      const model = new AIGNEHubVideoModel({ baseURL });
      expect(model.options.baseURL).toBe(baseURL);
      expect(model.options.apiKey).toBeUndefined();
      expect(model.options.model).toBeUndefined();
    });
  });

  describe("client", () => {
    test("should create client on first call", async () => {
      const model = new AIGNEHubVideoModel({ baseURL });
      const client = model["client"];
      expect(client).toBeDefined();
    });

    test("should throw error for unsupported provider", async () => {
      process.env.BLOCKLET_AIGNE_API_PROVIDER = "unsupported";
      expect(() => new AIGNEHubVideoModel({ baseURL })).toThrowError(/Unsupported model provider/);
    });
  });

  describe("credential", () => {
    test("should return credentials from environment variables", async () => {
      const model = new AIGNEHubVideoModel({ baseURL });
      const credential = await model.credential;

      expect(credential.url).toBe(joinURL(baseURL, "ai-kit/api/v2/video"));
      expect(credential.apiKey).toBe("test-api-key");
      expect(credential.model).toBe("openai/sora-2");
    });
  });

  describe("error handling", () => {
    test("should handle credential parsing errors gracefully", async () => {
      process.env.BLOCKLET_AIGNE_API_CREDENTIAL = '{"invalid": "json"';

      const model = new AIGNEHubVideoModel({ baseURL });

      const credential = await model.credential;
      expect(credential).toBeDefined();
    });

    test("should handle missing environment variables", async () => {
      delete process.env.BLOCKLET_AIGNE_API_PROVIDER;
      delete process.env.BLOCKLET_AIGNE_API_MODEL;
      delete process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
      delete process.env.BLOCKLET_AIGNE_API_URL;

      const model = new AIGNEHubVideoModel({ baseURL });

      const credential = await model.credential;
      expect(credential.url).toBe(joinURL(baseURL, "ai-kit/api/v2/video"));
    });
  });

  describe("other model options", () => {
    test("openai/sora-2", async () => {
      process.env.BLOCKLET_AIGNE_API_MODEL = "openai/sora-2";
      const model = new AIGNEHubVideoModel({ baseURL });
      const credential = await model.credential;
      expect(credential.model).toBe("openai/sora-2");
    });
  });

  test("AIGNEHubVideoModel example simple", async () => {
    const client = new AIGNEHubVideoModel({
      baseURL,
      apiKey: "123",
      model: "openai/sora-2",
    });

    const response = await client.invoke({ prompt: "hello", outputFileType: "file" });
    expect(response).toMatchInlineSnapshot(`
      {
        "model": "openai/sora-2",
        "usage": {
          "aigneHubCredits": 200,
          "inputTokens": 0,
          "outputTokens": 0,
        },
        "videos": [
          {
            "data": "data:video/mp4;base64,test-video-data",
            "type": "file",
          },
        ],
      }
    `);
  });

  test("AIGNEHubVideoModel2 example simple", async () => {
    const client = new AIGNEHubVideoModel2({
      baseURL,
      apiKey: "123",
      model: "openai/sora-2",
    });

    const response = await client.invoke({ prompt: "hello", outputFileType: "file" });
    expect(response).toMatchInlineSnapshot(`
      {
        "model": "openai/sora-2",
        "usage": {
          "aigneHubCredits": 200,
          "inputTokens": 0,
          "outputTokens": 0,
        },
        "videos": [
          {
            "data": "data:video/mp4;base64,test-video-data",
            "type": "file",
          },
        ],
      }
    `);
  });
});
