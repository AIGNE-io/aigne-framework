import { describe, expect, test } from "bun:test";
import { findImageModel, findModel, parseModel } from "../../src/utils/model.js";

describe("findModel", async () => {
  describe("findModel function", () => {
    test("should find exact model match", () => {
      const result = findModel("OpenAI");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OpenAIChatModel");
      expect(result.all).toHaveLength(11);
    });

    test("should find partial model match", () => {
      const result = findModel("anthropic");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("AnthropicChatModel");
    });

    test("should find model by alias", () => {
      const result = findModel("google");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toContain("GeminiChatModel");
    });

    test("should handle hyphenated names", () => {
      const result = findModel("open-ai");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OpenAIChatModel");
    });

    test("should handle multiple hyphens", () => {
      const result = findModel("open-router");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OpenRouterChatModel");
    });

    test("should be case insensitive", () => {
      const result1 = findModel("OPENAI");
      const result2 = findModel("openai");
      const result3 = findModel("OpenAI");

      expect(result1.match?.name).toBe("OpenAIChatModel");
      expect(result2.match?.name).toBe("OpenAIChatModel");
      expect(result3.match?.name).toBe("OpenAIChatModel");
    });

    test("should return undefined for non-matching provider", () => {
      const result = findModel("nonexistent");
      expect(result.match).toBeUndefined();
      expect(result.all).toHaveLength(11);
    });

    test("should return all available models", () => {
      const result = findModel("any");
      expect(result.all).toHaveLength(11);
      expect(result.all.map((i) => i.name)).toMatchInlineSnapshot(`
        [
          "OpenAIChatModel",
          "AnthropicChatModel",
          "BedrockChatModel",
          "DeepSeekChatModel",
          [
            "GeminiChatModel",
            "google",
          ],
          "OllamaChatModel",
          "OpenRouterChatModel",
          "XAIChatModel",
          "DoubaoChatModel",
          "PoeChatModel",
          "AIGNEHubChatModel",
        ]
      `);
    });

    test("should handle special characters", () => {
      const result = findModel("open_ai");
      expect(result.match).toBeUndefined();
    });

    test("should find AIGNE Hub model", () => {
      const result = findModel("aigne-hub");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("AIGNEHubChatModel");
    });

    test("should find Bedrock model", () => {
      const result = findModel("bedrock");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("BedrockChatModel");
    });

    test("should find DeepSeek model", () => {
      const result = findModel("deepseek");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("DeepSeekChatModel");
    });

    test("should find Doubao model", () => {
      const result = findModel("doubao");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("DoubaoChatModel");
    });

    test("should find Ollama model", () => {
      const result = findModel("ollama");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OllamaChatModel");
    });

    test("should find Poe model", () => {
      const result = findModel("poe");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("PoeChatModel");
    });

    test("should find XAI model", () => {
      const result = findModel("xai");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("XAIChatModel");
    });
  });
});

describe("findImageModel", async () => {
  describe("findImageModel function", () => {
    test("should find exact image model match", () => {
      const result = findImageModel("OpenAI");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OpenAIImageModel");
      expect(result.all).toHaveLength(5);
    });

    test("should find partial image model match", () => {
      const result = findImageModel("gemini");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toMatchInlineSnapshot(`
        [
          "GeminiImageModel",
          "google",
        ]
      `);
    });

    test("should handle hyphenated names", () => {
      const result = findImageModel("aigne-hub");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("AIGNEHubImageModel");
    });

    test("should be case insensitive", () => {
      const result1 = findImageModel("OPENAI");
      const result2 = findImageModel("openai");
      const result3 = findImageModel("OpenAI");

      expect(result1.match?.name).toBe("OpenAIImageModel");
      expect(result2.match?.name).toBe("OpenAIImageModel");
      expect(result3.match?.name).toBe("OpenAIImageModel");
    });

    test("should return undefined for non-matching provider", () => {
      const result = findImageModel("nonexistent");
      expect(result.match).toBeUndefined();
      expect(result.all).toHaveLength(5);
    });

    test("should return all available image models", () => {
      const result = findImageModel("any");
      expect(result.all).toHaveLength(5);
      expect(result.all.map((i) => i.name)).toMatchInlineSnapshot(`
        [
          "OpenAIImageModel",
          [
            "GeminiImageModel",
            "google",
          ],
          "IdeogramImageModel",
          "DoubaoImageModel",
          "AIGNEHubImageModel",
        ]
      `);
    });

    test("should find Ideogram image model", () => {
      const result = findImageModel("ideogram");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("IdeogramImageModel");
    });

    test("should find AIGNE Hub image model", () => {
      const result = findImageModel("aigne-hub");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("AIGNEHubImageModel");
    });

    test("should handle special characters", () => {
      const result = findImageModel("open_ai");
      expect(result.match).toBeUndefined();
    });

    test("should find OpenAI image model", () => {
      const result = findImageModel("openai");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("OpenAIImageModel");
    });

    test("should find Gemini image model", () => {
      const result = findImageModel("gemini");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toMatchInlineSnapshot(`
        [
          "GeminiImageModel",
          "google",
        ]
      `);
    });
  });
});

describe("parseModel", () => {
  test("should parse model with provider and name", () => {
    expect(parseModel("openai:gpt-4")).toMatchInlineSnapshot(`
      {
        "model": "gpt-4",
        "provider": "openai",
      }
    `);
  });

  test("should parse model with only provider", () => {
    expect(parseModel("openai")).toMatchInlineSnapshot(`
      {
        "model": undefined,
        "provider": "openai",
      }
    `);
  });

  test("should handle complex model names", () => {
    expect(parseModel("anthropic:claude-3-sonnet-20240229-v1:0")).toMatchInlineSnapshot(`
      {
        "model": "claude-3-sonnet-20240229-v1:0",
        "provider": "anthropic",
      }
    `);
    expect(parseModel("anthropic/claude-3-sonnet-20240229-v1:0")).toMatchInlineSnapshot(`
      {
        "model": "claude-3-sonnet-20240229-v1:0",
        "provider": "anthropic",
      }
    `);
  });

  test("should handle model names with special characters", () => {
    expect(parseModel("bedrock:anthropic.claude-3-sonnet-20240229-v1:0")).toMatchInlineSnapshot(`
      {
        "model": "anthropic.claude-3-sonnet-20240229-v1:0",
        "provider": "bedrock",
      }
    `);
    expect(parseModel("bedrock/anthropic.claude-3-sonnet-20240229-v1:0")).toMatchInlineSnapshot(`
      {
        "model": "anthropic.claude-3-sonnet-20240229-v1:0",
        "provider": "bedrock",
      }
    `);
  });
});
