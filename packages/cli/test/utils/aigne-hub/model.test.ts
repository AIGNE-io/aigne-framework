import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { rm, writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE } from "@aigne/cli/utils/aigne-hub/constants.js";
import {
  findConfiguredProvider,
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

describe("findConfiguredProvider", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.OPEN_ROUTER_API_KEY;
    delete process.env.POE_API_KEY;
  });

  describe("Early returns", () => {
    test("should return undefined when provider is not aignehub", () => {
      const result = findConfiguredProvider("openai", "gpt-4");
      expect(result).toBeUndefined();
    });

    test("should return undefined when provider is explicitly different", () => {
      const result = findConfiguredProvider("anthropic", "claude-3-opus");
      expect(result).toBeUndefined();
    });

    test("should return undefined when name is undefined", () => {
      const result = findConfiguredProvider("aignehub", undefined);
      expect(result).toBeUndefined();
    });

    test("should return undefined when name is empty string", () => {
      const result = findConfiguredProvider("aignehub", "");
      expect(result).toBeUndefined();
    });

    test("should return undefined when both provider and name are undefined", () => {
      const result = findConfiguredProvider(undefined, undefined);
      expect(result).toBeUndefined();
    });

    test("should return undefined when provider is undefined and name is empty", () => {
      const result = findConfiguredProvider(undefined, "");
      expect(result).toBeUndefined();
    });
  });

  describe("Case sensitivity", () => {
    test("should handle provider with different cases - AIGNEHUB", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("AIGNEHUB", "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });

    test("should handle provider with different cases - AigneHub", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("AigneHub", "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });

    test("should handle provider with different cases - aignehub", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });
  });

  describe("OpenAI models", () => {
    test("should find configured provider for gpt-4 with OPENAI_API_KEY", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });

    test("should find configured provider for gpt-3.5-turbo", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-3.5-turbo");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-3.5-turbo",
      });
    });

    test("should find configured provider for o1-preview", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "o1-preview");
      expect(result).toEqual({
        provider: "openai",
        model: "o1-preview",
      });
    });

    test("should find configured provider for o3-mini", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "o3-mini");
      expect(result).toEqual({
        provider: "openai",
        model: "o3-mini",
      });
    });

    test("should find configured provider for dall-e-3", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "dall-e-3");
      expect(result).toEqual({
        provider: "openai",
        model: "dall-e-3",
      });
    });

    test("should find configured provider for text-embedding models", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "text-embedding-ada-002");
      expect(result).toEqual({
        provider: "openai",
        model: "text-embedding-ada-002",
      });
    });

    test("should find configured provider for sora models", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "sora-1");
      expect(result).toEqual({
        provider: "openai",
        model: "sora-1",
      });
    });

    test("should return undefined for gpt models without OPENAI_API_KEY", () => {
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toBeUndefined();
    });
  });

  describe("Anthropic models", () => {
    test("should find configured provider for claude-3-opus with ANTHROPIC_API_KEY", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-3-opus",
      });
    });

    test("should find configured provider for claude-3.5-sonnet", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3.5-sonnet");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-3.5-sonnet",
      });
    });

    test("should find configured provider for claude-2", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-2");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-2",
      });
    });

    test("should return undefined for claude models without any API keys", () => {
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toBeUndefined();
    });
  });

  describe("Google models", () => {
    test("should find configured provider for gemini-pro with GEMINI_API_KEY", () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gemini-pro");
      expect(result).toEqual({
        provider: "google",
        model: "gemini-pro",
      });
    });

    test("should find configured provider for gemini-pro with GOOGLE_API_KEY", () => {
      process.env.GOOGLE_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gemini-pro");
      expect(result).toEqual({
        provider: "google",
        model: "gemini-pro",
      });
    });

    test("should find configured provider for imagen-3", () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "imagen-3");
      expect(result).toEqual({
        provider: "google",
        model: "imagen-3",
      });
    });

    test("should find configured provider for veo-2", () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "veo-2");
      expect(result).toEqual({
        provider: "google",
        model: "veo-2",
      });
    });

    test("should return undefined for gemini models without API keys", () => {
      const result = findConfiguredProvider("aignehub", "gemini-pro");
      expect(result).toBeUndefined();
    });
  });

  describe("DeepSeek models", () => {
    test("should find configured provider for deepseek-chat with DEEPSEEK_API_KEY", () => {
      process.env.DEEPSEEK_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "deepseek-chat");
      expect(result).toEqual({
        provider: "deepseek",
        model: "deepseek-chat",
      });
    });

    test("should find configured provider for deepseek-coder", () => {
      process.env.DEEPSEEK_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "deepseek-coder");
      expect(result).toEqual({
        provider: "deepseek",
        model: "deepseek-coder",
      });
    });

    test("should return undefined for deepseek models without API keys", () => {
      const result = findConfiguredProvider("aignehub", "deepseek-chat");
      expect(result).toBeUndefined();
    });
  });

  describe("XAI models", () => {
    test("should find configured provider for grok-1 with XAI_API_KEY", () => {
      process.env.XAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "grok-1");
      expect(result).toEqual({
        provider: "xai",
        model: "grok-1",
      });
    });

    test("should find configured provider for grok-2", () => {
      process.env.XAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "grok-2");
      expect(result).toEqual({
        provider: "xai",
        model: "grok-2",
      });
    });

    test("should return undefined for grok models without API keys", () => {
      const result = findConfiguredProvider("aignehub", "grok-1");
      expect(result).toBeUndefined();
    });
  });

  describe("Doubao models", () => {
    test("should find configured provider for doubao-pro with DOUBAO_API_KEY", () => {
      process.env.DOUBAO_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "doubao-pro");
      expect(result).toEqual({
        provider: "doubao",
        model: "doubao-pro",
      });
    });

    test("should return undefined for doubao models without API key", () => {
      const result = findConfiguredProvider("aignehub", "doubao-pro");
      expect(result).toBeUndefined();
    });
  });

  describe("Multi-provider fallback", () => {
    test("should use openrouter when primary provider for claude not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toEqual({
        provider: "openrouter",
        model: "anthropic/claude-3-opus",
      });
    });

    test("should use bedrock when primary and openrouter not configured for claude", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toEqual({
        provider: "bedrock",
        model: "anthropic.claude-3-opus",
      });
    });

    test("should use bedrock with full version for claude", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-5-sonnet-20241022");
      expect(result).toEqual({
        provider: "bedrock",
        model: "anthropic.claude-3-5-sonnet-20241022",
      });
    });

    test("should use poe as last resort for claude", () => {
      process.env.POE_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toEqual({
        provider: "poe",
        model: "claude-3-opus",
      });
    });

    test("should use openrouter when primary provider for gpt not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toEqual({
        provider: "openrouter",
        model: "openai/gpt-4",
      });
    });

    test("should use openrouter for gemini when primary provider not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gemini-2.0-flash-exp");
      expect(result).toEqual({
        provider: "openrouter",
        model: "google/gemini-2.0-flash-exp",
      });
    });

    test("should use poe for gpt when openai and openrouter not configured", () => {
      process.env.POE_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toEqual({
        provider: "poe",
        model: "gpt-4",
      });
    });

    test("should use openrouter when primary provider for deepseek not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "deepseek-chat");
      expect(result).toEqual({
        provider: "openrouter",
        model: "deepseek/deepseek-chat",
      });
    });

    test("should use ollama as last resort for deepseek", () => {
      process.env.OLLAMA_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "deepseek-chat");
      expect(result).toEqual({
        provider: "ollama",
        model: "deepseek-chat",
      });
    });
  });

  describe("Models without explicit default provider", () => {
    test("should use bedrock for llama when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "llama-3");
      expect(result).toEqual({
        provider: "bedrock",
        model: "meta.llama-3",
      });
    });

    test("should use bedrock for llama with full version", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "llama-3-70b-instruct");
      expect(result).toEqual({
        provider: "bedrock",
        model: "meta.llama-3-70b-instruct",
      });
    });

    test("should use openrouter for llama when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "llama-3");
      expect(result).toEqual({
        provider: "openrouter",
        model: "meta/llama-3",
      });
    });

    test("should use ollama for llama when other providers not configured", () => {
      process.env.OLLAMA_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "llama-3");
      expect(result).toEqual({
        provider: "ollama",
        model: "llama-3",
      });
    });

    test("should use bedrock for mistral when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "mistral-7b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "mistral.mistral-7b",
      });
    });

    test("should use openrouter for mistral when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "mistral-7b");
      expect(result).toEqual({
        provider: "openrouter",
        model: "mistral/mistral-7b",
      });
    });

    test("should use ollama for mistral when bedrock and openrouter not configured", () => {
      process.env.OLLAMA_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "mistral-7b");
      expect(result).toEqual({
        provider: "ollama",
        model: "mistral-7b",
      });
    });

    test("should use bedrock for mixtral when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "mixtral-8x7b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "mistral.mixtral-8x7b",
      });
    });

    test("should use openrouter for mixtral when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "mixtral-8x7b");
      expect(result).toEqual({
        provider: "openrouter",
        model: "mistral/mixtral-8x7b",
      });
    });

    test("should use bedrock for qwen when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "qwen-72b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "qwen.qwen-72b",
      });
    });

    test("should use openrouter for qwen when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "qwen-72b");
      expect(result).toEqual({
        provider: "openrouter",
        model: "qwen/qwen-72b",
      });
    });

    test("should use bedrock for gemma when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "gemma-7b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "google.gemma-7b",
      });
    });

    test("should use openrouter for gemma when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gemma-7b");
      expect(result).toEqual({
        provider: "openrouter",
        model: "google/gemma-7b",
      });
    });

    test("should use bedrock for yi when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "yi-34b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "yi.yi-34b",
      });
    });

    test("should use openrouter for yi when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "yi-34b");
      expect(result).toEqual({
        provider: "openrouter",
        model: "yi/yi-34b",
      });
    });

    test("should use bedrock for phi when configured", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "phi-2");
      expect(result).toEqual({
        provider: "bedrock",
        model: "microsoft.phi-2",
      });
    });

    test("should use openrouter for phi when bedrock not configured", () => {
      process.env.OPEN_ROUTER_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "phi-2");
      expect(result).toEqual({
        provider: "openrouter",
        model: "microsoft/phi-2",
      });
    });

    test("should return undefined for llama when no providers configured", () => {
      const result = findConfiguredProvider("aignehub", "llama-3");
      expect(result).toBeUndefined();
    });
  });

  describe("Model name formats and versions", () => {
    test("should handle model with version numbers - gpt-4-0125-preview", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gpt-4-0125-preview");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4-0125-preview",
      });
    });

    test("should handle model with version numbers - claude-3-opus-20240229", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus-20240229");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-3-opus-20240229",
      });
    });

    test("should handle gemini model with version", () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "gemini-1.5-pro");
      expect(result).toEqual({
        provider: "google",
        model: "gemini-1.5-pro",
      });
    });

    test("should handle o1 models", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "o1-mini");
      expect(result).toEqual({
        provider: "openai",
        model: "o1-mini",
      });
    });

    test("should handle o3 models", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "o3-mini");
      expect(result).toEqual({
        provider: "openai",
        model: "o3-mini",
      });
    });

    test("should handle mixtral models with bedrock", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "mixtral-8x7b");
      expect(result).toEqual({
        provider: "bedrock",
        model: "mistral.mixtral-8x7b",
      });
    });

    test("should handle llama2 model with bedrock", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "llama2");
      expect(result).toEqual({
        provider: "bedrock",
        model: "meta.llama2",
      });
    });

    test("should handle qwen2 model with bedrock", () => {
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      const result = findConfiguredProvider("aignehub", "qwen2");
      expect(result).toEqual({
        provider: "bedrock",
        model: "qwen.qwen2",
      });
    });
  });

  describe("Unsupported models", () => {
    test("should return undefined for completely unknown model", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "unknown-model-xyz");
      expect(result).toBeUndefined();
    });

    test("should return undefined for random string", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "random-123-abc");
      expect(result).toBeUndefined();
    });

    test("should return undefined for partial model name match", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "notgpt-4");
      expect(result).toBeUndefined();
    });
  });

  describe("Provider undefined scenarios", () => {
    test("should work when provider is undefined with configured openai", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider(undefined, "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });

    test("should work when provider is undefined with configured anthropic", () => {
      process.env.ANTHROPIC_API_KEY = "test-key";
      const result = findConfiguredProvider(undefined, "claude-3-opus");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-3-opus",
      });
    });

    test("should work when provider is undefined with configured google", () => {
      process.env.GEMINI_API_KEY = "test-key";
      const result = findConfiguredProvider(undefined, "gemini-pro");
      expect(result).toEqual({
        provider: "google",
        model: "gemini-pro",
      });
    });
  });

  describe("Multiple API keys configured", () => {
    test("should prefer first in ranking when multiple providers configured for claude", () => {
      process.env.ANTHROPIC_API_KEY = "anthropic-key";
      process.env.AWS_ACCESS_KEY_ID = "aws-key";
      process.env.OPEN_ROUTER_API_KEY = "openrouter-key";
      process.env.POE_API_KEY = "poe-key";
      const result = findConfiguredProvider("aignehub", "claude-3-opus");
      expect(result).toEqual({
        provider: "anthropic",
        model: "claude-3-opus",
      });
    });

    test("should prefer first in ranking when multiple providers configured for gpt", () => {
      process.env.OPENAI_API_KEY = "openai-key";
      process.env.OPEN_ROUTER_API_KEY = "openrouter-key";
      process.env.POE_API_KEY = "poe-key";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toEqual({
        provider: "openai",
        model: "gpt-4",
      });
    });

    test("should prefer first in ranking when multiple providers configured for deepseek", () => {
      process.env.DEEPSEEK_API_KEY = "deepseek-key";
      process.env.OPEN_ROUTER_API_KEY = "openrouter-key";
      process.env.OLLAMA_API_KEY = "ollama-key";
      const result = findConfiguredProvider("aignehub", "deepseek-chat");
      expect(result).toEqual({
        provider: "deepseek",
        model: "deepseek-chat",
      });
    });
  });

  describe("Edge cases", () => {
    test("should handle empty API key value", () => {
      process.env.OPENAI_API_KEY = "";
      const result = findConfiguredProvider("aignehub", "gpt-4");
      expect(result).toBeUndefined();
    });

    test("should handle whitespace-only model name", () => {
      process.env.OPENAI_API_KEY = "test-key";
      const result = findConfiguredProvider("aignehub", "   ");
      expect(result).toBeUndefined();
    });
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
