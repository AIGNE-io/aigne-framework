import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE } from "@aigne/cli/utils/aigne-hub/constants.js";
import {
  formatModelName,
  loadChatModel as loadModel,
  maskApiKey,
} from "@aigne/cli/utils/aigne-hub/model.js";
import { stringify } from "yaml";
import { createHonoServer } from "../../_mocks_/server.js";

const mockInquirerPrompt = mock(async (prompt: any) => {
  if (prompt.name === "subscribe") {
    return { subscribe: "custom" };
  }

  return {};
});

describe("maskApiKey", () => {
  test("should mask api key", () => {
    const result = maskApiKey("1234567890");
    expect(result).toBe("1234********7890");
  });

  test("should mask api key", () => {
    const result = maskApiKey("123");
    expect(result).toBe("123");
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
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("openai/gpt-4");
  });

  test("should return default aignehub model when no model provided", async () => {
    const result = await formatModelName("", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("openai/gpt-5-mini");
  });

  test("should return model as-is when provider is aignehub", async () => {
    const result = await formatModelName("aignehub:openai/gpt-4", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("openai/gpt-4");
  });

  test("should handle case-insensitive model matching", async () => {
    const result = await formatModelName("OPENAI:gpt-4", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("OPENAI/gpt-4");
  });

  test("should handle providers with hyphens", async () => {
    const result = await formatModelName("open-ai:gpt-4", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("openai/gpt-4");
  });

  test("should handle complex model names", async () => {
    process.env.ANTHROPIC_API_KEY = undefined;

    const result = await formatModelName("anthropic:claude-3-sonnet", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("anthropic/claude-3-sonnet");
  });

  test("should handle models with special characters", async () => {
    const result = await formatModelName("openai:gpt-4-turbo-preview", mockInquirerPrompt);
    expect(result.provider).toBe("aignehub");
    expect(result.model).toBe("openai/gpt-4-turbo-preview");
  });
});

describe("loadModel", async () => {
  const { url, close } = await createHonoServer();

  beforeEach(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });

  test("should load model with environment variables", async () => {
    process.env.MODEL_PROVIDER = "openai";
    process.env.MODEL_NAME = "gpt-4";
    process.env.OPENAI_API_KEY = "test-key";

    const model = await loadModel({
      inquirerPromptFn: mockInquirerPrompt,
      aigneHubUrl: url,
    });

    expect(model).toBeDefined();
    expect(model?.constructor.name).toBe("AIGNEHubChatModel");
  });

  test("should load model with explicit parameters", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const model = await loadModel({ model: "openai:gpt-4", temperature: 0.7 });

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

    const model = await loadModel({ model: "aignehub:openai/gpt-4" });

    expect(model).toBeDefined();
    expect(model?.constructor.name).toBe("AIGNEHubChatModel");
  });

  test("should handle model with temperature and other parameters", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const model = await loadModel({
      model: "openai:gpt-4",
      temperature: 0.8,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.2,
    });

    expect(model).toBeDefined();
  });

  test("should use default model provider when not specified", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const model = await loadModel({
      model: "openai:gpt-4",
      inquirerPromptFn: mockInquirerPrompt,
      aigneHubUrl: url,
    });

    expect(model).toBeDefined();
    expect(model?.constructor.name).toBe("OpenAIChatModel");
  });

  test("should handle model options override", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const model = await loadModel({
      model: "openai:gpt-4",
      temperature: 0.5,
    });

    expect(model).toBeDefined();
  });

  afterAll(async () => {
    await close();
  });
});
