import { describe, expect, test } from "bun:test";
import { findImageModel, findModel } from "../../src/utils/model.js";

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
      expect(result.all).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "OpenAIChatModel" }),
          expect.objectContaining({ name: "AnthropicChatModel" }),
          expect.objectContaining({ name: "BedrockChatModel" }),
          expect.objectContaining({ name: "DeepSeekChatModel" }),
          expect.objectContaining({ name: ["GeminiChatModel", "google"] }),
          expect.objectContaining({ name: "OllamaChatModel" }),
          expect.objectContaining({ name: "OpenRouterChatModel" }),
          expect.objectContaining({ name: "XAIChatModel" }),
          expect.objectContaining({ name: "DoubaoChatModel" }),
          expect.objectContaining({ name: "PoeChatModel" }),
          expect.objectContaining({ name: "AIGNEHubChatModel" }),
        ]),
      );
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
      expect(result.all).toHaveLength(4);
    });

    test("should find partial image model match", () => {
      const result = findImageModel("gemini");
      expect(result.match).toBeDefined();
      expect(result.match?.name).toBe("GeminiImageModel");
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
      expect(result.all).toHaveLength(4);
    });

    test("should return all available image models", () => {
      const result = findImageModel("any");
      expect(result.all).toHaveLength(4);
      expect(result.all).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "OpenAIImageModel" }),
          expect.objectContaining({ name: "GeminiImageModel" }),
          expect.objectContaining({ name: "IdeogramImageModel" }),
          expect.objectContaining({ name: "AIGNEHubImageModel" }),
        ]),
      );
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
      expect(result.match?.name).toBe("GeminiImageModel");
    });
  });
});
