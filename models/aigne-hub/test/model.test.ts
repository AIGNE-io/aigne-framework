import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { stringify } from "yaml";
import { AIGNE_ENV_FILE } from "../src/util/constants.js";
import {
  availableModels,
  findModel,
  formatModelName,
  loadModel,
  parseModelOption,
} from "../src/util/model.js";
import { createHonoServer } from "./_mocks_/utils.js";

describe("model", () => {
  beforeEach(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
    // Reset environment variables
    delete process.env.MODEL_PROVIDER;
    delete process.env.MODEL_NAME;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.OLLAMA_API_KEY;
    delete process.env.OPEN_ROUTER_API_KEY;
    delete process.env.XAI_API_KEY;
    delete process.env.AIGNE_HUB_API_KEY;
    delete process.env.HTTPS_PROXY;
    delete process.env.https_proxy;
    delete process.env.HTTP_PROXY;
    delete process.env.http_proxy;
    delete process.env.ALL_PROXY;
    delete process.env.all_proxy;
  });

  describe("availableModels", () => {
    test("should handle proxy configuration", () => {
      process.env.HTTPS_PROXY = "http://proxy.example.com:8080";

      const models = availableModels();
      const openaiModel = models.find((m) => m.name === "OpenAIChatModel");

      expect(openaiModel).toBeDefined();
      // The model should be created with proxy configuration
      expect(openaiModel?.create).toBeDefined();
    });

    test("should handle multiple proxy environment variables", () => {
      process.env.HTTP_PROXY = "http://proxy.example.com:8080";

      const models = availableModels();
      expect(models).toHaveLength(9);
    });

    test("should create models with correct client options", () => {
      const models = availableModels();
      const openaiModel = models.find((m) => m.name === "OpenAIChatModel");

      if (openaiModel) {
        const instance = openaiModel.create({ model: "gpt-4" });
        expect(instance).toBeDefined();
      }
    });
  });

  describe("findModel", () => {
    test("should find model by exact name match", () => {
      const models = availableModels();
      const result = findModel(models, "openai");

      expect(result?.name).toBe("OpenAIChatModel");
    });

    test("should find model by partial name match", () => {
      const models = availableModels();
      const result = findModel(models, "anthropic");

      expect(result?.name).toBe("AnthropicChatModel");
    });

    test("should find model with multiple names", () => {
      const models = availableModels();
      const result = findModel(models, "google");

      expect(result?.name).toEqual(["GeminiChatModel", "google"]);
    });

    test("should return undefined for non-existent model", () => {
      const models = availableModels();
      const result = findModel(models, "nonexistent");

      expect(result).toBeUndefined();
    });

    test("should handle case insensitive matching", () => {
      const models = availableModels();
      const result = findModel(models, "OPENAI");

      expect(result?.name).toBe("OpenAIChatModel");
    });
  });

  describe("parseModelOption", () => {
    test("should parse model with provider and name", () => {
      const result = parseModelOption("openai:gpt-4");

      expect(result.provider).toBe("openai");
      expect(result.name).toBe("gpt-4");
    });

    test("should parse model with only provider", () => {
      const result = parseModelOption("openai");

      expect(result.provider).toBe("openai");
      expect(result.name).toBeUndefined();
    });

    test("should handle undefined model", () => {
      const result = parseModelOption();

      expect(result.provider).toBeUndefined();
      expect(result.name).toBeUndefined();
    });

    test("should handle complex model names", () => {
      const result = parseModelOption("anthropic:claude-3-sonnet-20240229-v1:0");

      expect(result.provider).toBe("anthropic");
      expect(result.name).toBe("claude-3-sonnet-20240229-v1:0");
    });

    test("should handle model names with special characters", () => {
      const result = parseModelOption("bedrock:anthropic.claude-3-sonnet-20240229-v1:0");

      expect(result.provider).toBe("bedrock");
      expect(result.name).toBe("anthropic.claude-3-sonnet-20240229-v1:0");
    });
  });

  describe("formatModelName", () => {
    const originalEnv = process.env.NODE_ENV;
    beforeAll(() => {
      process.env.NODE_ENV = "dev";
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    const mockInquirerPrompt: any = mock(async () => ({ useAigneHub: true }));

    afterEach(() => {
      mockInquirerPrompt.mockClear();
    });

    test("should return model as-is when NODE_ENV is test", async () => {
      process.env.OPENAI_API_KEY = undefined;

      const result = await formatModelName("openai:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-4");
    });

    test("should return default aignehub model when no model provided", async () => {
      const result = await formatModelName("", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-5-mini");
    });

    test("should return model as-is when provider is aignehub", async () => {
      const result = await formatModelName("aignehub:openai/gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-4");
    });

    test("should return model as-is when provider contains aignehub", async () => {
      const result = await formatModelName("my-aignehub:openai/gpt-4", mockInquirerPrompt);

      expect(result).toBe("my-aignehub:openai/gpt-4");
    });

    test("should throw error for unsupported model", async () => {
      await expect(formatModelName("unsupported:gpt-4", mockInquirerPrompt)).rejects.toThrow(
        "Unsupported model: unsupported gpt-4",
      );
    });

    test("should handle case-insensitive model matching", async () => {
      const result = await formatModelName("OPENAI:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:OPENAI/gpt-4");
    });

    test("should handle providers with hyphens", async () => {
      const result = await formatModelName("open-ai:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:open-ai/gpt-4");
    });

    test("should handle complex model names", async () => {
      process.env.ANTHROPIC_API_KEY = undefined;

      const result = await formatModelName("anthropic:claude-3-sonnet", mockInquirerPrompt);

      expect(result).toBe("aignehub:anthropic/claude-3-sonnet");
    });

    test("should handle models with special characters", async () => {
      const result = await formatModelName("openai:gpt-4-turbo-preview", mockInquirerPrompt);

      expect(result).toBe("aignehub:openai/gpt-4-turbo-preview");
    });
  });

  describe("loadModel", async () => {
    const { close } = await createHonoServer();

    beforeEach(async () => {
      await rm(AIGNE_ENV_FILE, { force: true });
    });

    test("should load model with environment variables", async () => {
      process.env.MODEL_PROVIDER = "openai";
      process.env.MODEL_NAME = "gpt-4";
      process.env.OPENAI_API_KEY = "test-key";

      const model = await loadModel();

      expect(model).toBeDefined();
      expect(model?.constructor.name).toBe("OpenAIChatModel");
    });

    test("should load model with explicit parameters", async () => {
      process.env.OPENAI_API_KEY = "test-key";

      const model = await loadModel({ provider: "openai", name: "gpt-4", temperature: 0.7 });

      expect(model).toBeDefined();
      expect(model?.constructor.name).toBe("OpenAIChatModel");
    });

    test("should load AIGNE Hub model", async () => {
      const testContent = {
        "hub.aigne.io": {
          AIGNE_HUB_API_KEY: "test-key",
          AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const model = await loadModel({ provider: "aignehub", name: "openai/gpt-4" });

      expect(model).toBeDefined();
      expect(model?.constructor.name).toBe("AIGNEHubChatModel");
    });

    test("should handle model with temperature and other parameters", async () => {
      process.env.OPENAI_API_KEY = "test-key";

      const model = await loadModel({
        provider: "openai",
        name: "gpt-4",
        temperature: 0.8,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.2,
      });

      expect(model).toBeDefined();
    });

    test("should throw error for unsupported model", async () => {
      await expect(loadModel({ provider: "unsupported", name: "model" })).rejects.toThrow(
        "Unsupported model: unsupported model",
      );
    });

    test("should use default model provider when not specified", async () => {
      process.env.OPENAI_API_KEY = "test-key";

      const model = await loadModel({ name: "gpt-4" });

      expect(model).toBeDefined();
      expect(model?.constructor.name).toBe("OpenAIChatModel");
    });

    test("should handle model options override", async () => {
      process.env.OPENAI_API_KEY = "test-key";

      const model = await loadModel(
        { provider: "openai", name: "gpt-4", temperature: 0.5 },
        { temperature: 0.9 },
      );

      expect(model).toBeDefined();
    });

    afterAll(async () => {
      await close();
    });
  });
});
