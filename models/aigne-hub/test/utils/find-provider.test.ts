import { describe, expect, test } from "bun:test";
import {
  getDefaultProviderForModel,
  getSupportedProviders,
  inferVendorFromModel,
  resolveProviderModelId,
} from "../../src/utils/find-provider.js";

describe("inferVendorFromModel", () => {
  describe("Google models", () => {
    test("should identify gemini models", () => {
      expect(inferVendorFromModel("gemini-1.5-pro")).toBe("google");
      expect(inferVendorFromModel("gemini-2.0-flash")).toBe("google");
      expect(inferVendorFromModel("GEMINI-PRO")).toBe("google");
    });

    test("should identify imagen models", () => {
      expect(inferVendorFromModel("imagen-3")).toBe("google");
      expect(inferVendorFromModel("IMAGEN-2")).toBe("google");
    });

    test("should identify veo models", () => {
      expect(inferVendorFromModel("veo-2")).toBe("google");
      expect(inferVendorFromModel("VEO-1")).toBe("google");
    });

    test("should identify gemma models", () => {
      expect(inferVendorFromModel("gemma-7b")).toBe("google");
      expect(inferVendorFromModel("GEMMA-2B")).toBe("google");
    });
  });

  describe("OpenAI models", () => {
    test("should identify gpt models", () => {
      expect(inferVendorFromModel("gpt-4")).toBe("openai");
      expect(inferVendorFromModel("gpt-3.5-turbo")).toBe("openai");
      expect(inferVendorFromModel("GPT-5")).toBe("openai");
    });

    test("should identify o1/o3 models", () => {
      expect(inferVendorFromModel("o1-preview")).toBe("openai");
      expect(inferVendorFromModel("o3-mini")).toBe("openai");
      expect(inferVendorFromModel("O1-MINI")).toBe("openai");
    });

    test("should identify dall-e models", () => {
      expect(inferVendorFromModel("dall-e-3")).toBe("openai");
      expect(inferVendorFromModel("DALL-E-2")).toBe("openai");
    });

    test("should identify text-embedding models", () => {
      expect(inferVendorFromModel("text-embedding-ada-002")).toBe("openai");
      expect(inferVendorFromModel("TEXT-EMBEDDING-3-SMALL")).toBe("openai");
    });

    test("should identify sora models", () => {
      expect(inferVendorFromModel("sora-1")).toBe("openai");
      expect(inferVendorFromModel("SORA-2")).toBe("openai");
    });
  });

  describe("Anthropic models", () => {
    test("should identify claude models", () => {
      expect(inferVendorFromModel("claude-3-opus")).toBe("anthropic");
      expect(inferVendorFromModel("claude-3.5-sonnet")).toBe("anthropic");
      expect(inferVendorFromModel("CLAUDE-2")).toBe("anthropic");
    });
  });

  describe("DeepSeek models", () => {
    test("should identify deepseek models", () => {
      expect(inferVendorFromModel("deepseek-chat")).toBe("deepseek");
      expect(inferVendorFromModel("deepseek-coder")).toBe("deepseek");
      expect(inferVendorFromModel("DEEPSEEK-V3")).toBe("deepseek");
    });
  });

  describe("XAI models", () => {
    test("should identify grok models", () => {
      expect(inferVendorFromModel("grok-1")).toBe("xai");
      expect(inferVendorFromModel("grok-2")).toBe("xai");
      expect(inferVendorFromModel("GROK-BETA")).toBe("xai");
    });
  });

  describe("Doubao models", () => {
    test("should identify doubao models", () => {
      expect(inferVendorFromModel("doubao-pro")).toBe("doubao");
      expect(inferVendorFromModel("DOUBAO-LITE")).toBe("doubao");
    });
  });

  describe("Meta models", () => {
    test("should identify llama models", () => {
      expect(inferVendorFromModel("llama-3.1")).toBe("meta");
      expect(inferVendorFromModel("llama2")).toBe("meta");
      expect(inferVendorFromModel("LLAMA-3-70B")).toBe("meta");
    });
  });

  describe("Mistral models", () => {
    test("should identify mistral models", () => {
      expect(inferVendorFromModel("mistral-large")).toBe("mistral");
      expect(inferVendorFromModel("mistral-small")).toBe("mistral");
      expect(inferVendorFromModel("MISTRAL-7B")).toBe("mistral");
    });

    test("should identify mixtral models", () => {
      expect(inferVendorFromModel("mixtral-8x7b")).toBe("mistral");
      expect(inferVendorFromModel("MIXTRAL-8X22B")).toBe("mistral");
    });
  });

  describe("Qwen models", () => {
    test("should identify qwen models", () => {
      expect(inferVendorFromModel("qwen-72b")).toBe("qwen");
      expect(inferVendorFromModel("qwen2")).toBe("qwen");
      expect(inferVendorFromModel("QWEN-TURBO")).toBe("qwen");
    });
  });

  describe("Yi models", () => {
    test("should identify yi models", () => {
      expect(inferVendorFromModel("yi-34b")).toBe("yi");
      expect(inferVendorFromModel("yi-large")).toBe("yi");
      expect(inferVendorFromModel("YI-6B")).toBe("yi");
    });
  });

  describe("Microsoft models", () => {
    test("should identify phi models", () => {
      expect(inferVendorFromModel("phi-2")).toBe("microsoft");
      expect(inferVendorFromModel("phi-3")).toBe("microsoft");
      expect(inferVendorFromModel("PHI-SMALL")).toBe("microsoft");
    });
  });

  describe("Edge cases", () => {
    test("should return undefined for empty string", () => {
      expect(inferVendorFromModel("")).toBeUndefined();
    });

    test("should return undefined for non-matching model", () => {
      expect(inferVendorFromModel("unknown-model")).toBeUndefined();
      expect(inferVendorFromModel("random-123")).toBeUndefined();
    });

    test("should be case insensitive", () => {
      expect(inferVendorFromModel("GPT-4")).toBe("openai");
      expect(inferVendorFromModel("gpt-4")).toBe("openai");
      expect(inferVendorFromModel("GpT-4")).toBe("openai");
    });

    test("should handle models with version numbers", () => {
      expect(inferVendorFromModel("gpt-4-0125-preview")).toBe("openai");
      expect(inferVendorFromModel("claude-3-opus-20240229")).toBe("anthropic");
    });
  });
});

describe("getDefaultProviderForModel", () => {
  describe("Models with explicit defaultProvider", () => {
    test("should return google for gemini models", () => {
      expect(getDefaultProviderForModel("gemini-pro")).toBe("google");
      expect(getDefaultProviderForModel("imagen-2")).toBe("google");
      expect(getDefaultProviderForModel("veo-1")).toBe("google");
    });

    test("should return openai for gpt models", () => {
      expect(getDefaultProviderForModel("gpt-4")).toBe("openai");
      expect(getDefaultProviderForModel("o1-preview")).toBe("openai");
      expect(getDefaultProviderForModel("dall-e-3")).toBe("openai");
    });

    test("should return anthropic for claude models", () => {
      expect(getDefaultProviderForModel("claude-3-opus")).toBe("anthropic");
    });

    test("should return deepseek for deepseek models", () => {
      expect(getDefaultProviderForModel("deepseek-chat")).toBe("deepseek");
    });

    test("should return xai for grok models", () => {
      expect(getDefaultProviderForModel("grok-1")).toBe("xai");
    });

    test("should return doubao for doubao models", () => {
      expect(getDefaultProviderForModel("doubao-pro")).toBe("doubao");
    });
  });

  describe("Models without explicit defaultProvider", () => {
    test("should return first supported provider for llama", () => {
      expect(getDefaultProviderForModel("llama-3")).toBe("openrouter");
    });

    test("should return first supported provider for mistral", () => {
      expect(getDefaultProviderForModel("mistral-7b")).toBe("openrouter");
      expect(getDefaultProviderForModel("mixtral-8x7b")).toBe("openrouter");
    });

    test("should return first supported provider for qwen", () => {
      expect(getDefaultProviderForModel("qwen-72b")).toBe("openrouter");
    });

    test("should return first supported provider for gemma", () => {
      expect(getDefaultProviderForModel("gemma-7b")).toBe("openrouter");
    });

    test("should return first supported provider for yi", () => {
      expect(getDefaultProviderForModel("yi-34b")).toBe("openrouter");
    });

    test("should return first supported provider for phi", () => {
      expect(getDefaultProviderForModel("phi-2")).toBe("openrouter");
    });
  });

  describe("Edge cases", () => {
    test("should return null for empty string", () => {
      expect(getDefaultProviderForModel("")).toBeNull();
    });

    test("should return null for non-matching model", () => {
      expect(getDefaultProviderForModel("unknown-model")).toBeNull();
      expect(getDefaultProviderForModel("random-123")).toBeNull();
    });

    test("should be case insensitive", () => {
      expect(getDefaultProviderForModel("GPT-4")).toBe("openai");
      expect(getDefaultProviderForModel("CLAUDE-3")).toBe("anthropic");
    });
  });
});

describe("getSupportedProviders", () => {
  describe("Provider ranking and sorting", () => {
    test("should return sorted providers for gemini (rank 1,3,3)", () => {
      const providers = getSupportedProviders("gemini-pro");
      expect(providers).toEqual(["google", "openrouter", "poe"]);
    });

    test("should return sorted providers for gpt (rank 1,3,3)", () => {
      const providers = getSupportedProviders("gpt-4");
      expect(providers).toEqual(["openai", "openrouter", "poe"]);
    });

    test("should return sorted providers for claude (rank 1,2,3,3)", () => {
      const providers = getSupportedProviders("claude-3-opus");
      expect(providers).toEqual(["anthropic", "bedrock", "openrouter", "poe"]);
    });

    test("should return sorted providers for deepseek (rank 1,3,4)", () => {
      const providers = getSupportedProviders("deepseek-chat");
      expect(providers).toEqual(["deepseek", "openrouter", "ollama"]);
    });

    test("should return sorted providers for grok (rank 1,3,3)", () => {
      const providers = getSupportedProviders("grok-1");
      expect(providers).toEqual(["xai", "openrouter", "poe"]);
    });

    test("should return sorted providers for doubao (rank 1)", () => {
      const providers = getSupportedProviders("doubao-pro");
      expect(providers).toEqual(["doubao"]);
    });

    test("should return sorted providers for llama (rank 2,3,4)", () => {
      const providers = getSupportedProviders("llama-3");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for mistral (rank 2,3,4)", () => {
      const providers = getSupportedProviders("mistral-7b");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for mixtral (rank 2,3,4)", () => {
      const providers = getSupportedProviders("mixtral-8x7b");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for qwen (rank 2,3,4)", () => {
      const providers = getSupportedProviders("qwen-72b");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for gemma (rank 2,3,4)", () => {
      const providers = getSupportedProviders("gemma-7b");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for yi (rank 2,3,4)", () => {
      const providers = getSupportedProviders("yi-34b");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });

    test("should return sorted providers for phi (rank 2,3,4)", () => {
      const providers = getSupportedProviders("phi-2");
      expect(providers).toEqual(["bedrock", "openrouter", "ollama"]);
    });
  });

  describe("Edge cases", () => {
    test("should return empty array for empty string", () => {
      expect(getSupportedProviders("")).toEqual([]);
    });

    test("should return empty array for non-matching model", () => {
      expect(getSupportedProviders("unknown-model")).toEqual([]);
      expect(getSupportedProviders("random-123")).toEqual([]);
    });

    test("should be case insensitive", () => {
      const providers1 = getSupportedProviders("GPT-4");
      const providers2 = getSupportedProviders("gpt-4");
      expect(providers1).toEqual(providers2);
    });

    test("should handle model names with versions", () => {
      const providers = getSupportedProviders("gpt-4-0125-preview");
      expect(providers).toEqual(["openai", "openrouter", "poe"]);
    });
  });

  describe("All model patterns coverage", () => {
    test("should handle imagen models", () => {
      expect(getSupportedProviders("imagen-3")).toEqual(["google", "openrouter", "poe"]);
    });

    test("should handle veo models", () => {
      expect(getSupportedProviders("veo-2")).toEqual(["google", "openrouter", "poe"]);
    });

    test("should handle o1 models", () => {
      expect(getSupportedProviders("o1-preview")).toEqual(["openai", "openrouter", "poe"]);
    });

    test("should handle o3 models", () => {
      expect(getSupportedProviders("o3-mini")).toEqual(["openai", "openrouter", "poe"]);
    });

    test("should handle dall-e models", () => {
      expect(getSupportedProviders("dall-e-3")).toEqual(["openai", "openrouter", "poe"]);
    });

    test("should handle text-embedding models", () => {
      expect(getSupportedProviders("text-embedding-ada-002")).toEqual([
        "openai",
        "openrouter",
        "poe",
      ]);
    });

    test("should handle sora models", () => {
      expect(getSupportedProviders("sora-1")).toEqual(["openai", "openrouter", "poe"]);
    });
  });
});

describe("resolveProviderModelId - Platform-specific formatting", () => {
  test("should format model ID correctly for OpenRouter", () => {
    expect(resolveProviderModelId("openrouter", "gemini-2.0-flash-exp", "google")).toBe(
      "google/gemini-2.0-flash-exp",
    );
    expect(resolveProviderModelId("openrouter", "gpt-4o", "openai")).toBe("openai/gpt-4o");
    expect(resolveProviderModelId("openrouter", "claude-3-5-sonnet", "anthropic")).toBe(
      "anthropic/claude-3-5-sonnet",
    );
  });

  test("should format model ID correctly for Bedrock", () => {
    expect(resolveProviderModelId("bedrock", "claude-3-5-sonnet-20241022", "anthropic")).toBe(
      "anthropic.claude-3-5-sonnet-20241022",
    );
    expect(resolveProviderModelId("bedrock", "llama-3-70b", "meta")).toBe("meta.llama-3-70b");
  });

  test("should handle Bedrock models already in correct format", () => {
    const bedrockModel = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    expect(resolveProviderModelId("bedrock", bedrockModel, "anthropic")).toBe(bedrockModel);
  });

  test("should keep model name unchanged for direct providers", () => {
    expect(resolveProviderModelId("google", "gemini-2.0-flash-exp")).toBe("gemini-2.0-flash-exp");
    expect(resolveProviderModelId("openai", "gpt-4o")).toBe("gpt-4o");
    expect(resolveProviderModelId("anthropic", "claude-3-5-sonnet")).toBe("claude-3-5-sonnet");
    expect(resolveProviderModelId("deepseek", "deepseek-chat")).toBe("deepseek-chat");
  });

  test("should keep model name unchanged for Poe", () => {
    expect(resolveProviderModelId("poe", "gemini-2.0-flash-exp", "google")).toBe(
      "gemini-2.0-flash-exp",
    );
    expect(resolveProviderModelId("poe", "gpt-4o", "openai")).toBe("gpt-4o");
  });

  test("should infer vendor when not provided", () => {
    expect(resolveProviderModelId("openrouter", "gemini-2.0-flash-exp")).toBe(
      "google/gemini-2.0-flash-exp",
    );
    expect(resolveProviderModelId("openrouter", "gpt-4o")).toBe("openai/gpt-4o");
    expect(resolveProviderModelId("bedrock", "claude-3-5-sonnet")).toBe(
      "anthropic.claude-3-5-sonnet",
    );
  });

  test("should handle models with vendor prefix already present", () => {
    expect(resolveProviderModelId("openrouter", "google/gemini-2.0-flash-exp", "google")).toBe(
      "google/gemini-2.0-flash-exp",
    );
  });
});
