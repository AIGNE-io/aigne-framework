import { describe, expect, spyOn, test } from "bun:test";
import { checkModelAvailability, fetchHubModels } from "../../src/utils/aigne-hub-models.js";

describe("aigne-hub-models", () => {
  describe("checkModelAvailability", () => {
    test("should return available=true when model is available", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ available: true })),
      );

      const result = await checkModelAvailability({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        model: "openai/gpt-4o",
      });

      expect(result).toEqual({
        model: "openai/gpt-4o",
        available: true,
        error: undefined,
      });
    });

    test("should return available=false when model is not available", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            available: false,
            error: "No providers available",
            code: 503,
          }),
        ),
      );

      const result = await checkModelAvailability({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        model: "openai/gpt-99",
      });

      expect(result).toEqual({
        model: "openai/gpt-99",
        available: false,
        error: "No providers available",
      });
    });

    test("should convert http to https", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ available: true })),
      );

      await checkModelAvailability({
        baseUrl: "http://hub.aigne.io",
        apiKey: "test-key",
        model: "openai/gpt-4o",
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("https://hub.aigne.io"),
        expect.any(Object),
      );
    });

    test("should encode model name in URL", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ available: true })),
      );

      await checkModelAvailability({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        model: "openai/gpt-4o",
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("model=openai%2Fgpt-4o"),
        expect.any(Object),
      );
    });

    test("should throw error on non-2xx response", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401, statusText: "Unauthorized" }),
      );

      expect(
        checkModelAvailability({
          baseUrl: "https://hub.aigne.io",
          apiKey: "invalid-key",
          model: "openai/gpt-4o",
        }),
      ).rejects.toThrow("401");
    });
  });

  describe("fetchHubModels", () => {
    const mockModelRatesResponse = {
      count: 5,
      list: [
        {
          model: "gpt-4o",
          modelDisplay: "GPT-4o",
          type: "chatCompletion",
          provider: { name: "openai", displayName: "OpenAI" },
          status: { available: true },
        },
        {
          model: "gpt-4o-mini",
          modelDisplay: "GPT-4o Mini",
          type: "chatCompletion",
          provider: { name: "openai", displayName: "OpenAI" },
          status: { available: true },
        },
        {
          model: "claude-3-5-sonnet",
          modelDisplay: "Claude 3.5 Sonnet",
          type: "chatCompletion",
          provider: { name: "anthropic", displayName: "Anthropic" },
          status: { available: true },
        },
        {
          model: "dall-e-3",
          modelDisplay: "DALL-E 3",
          type: "imageGeneration",
          provider: { name: "openai", displayName: "OpenAI" },
          status: { available: true },
        },
        {
          model: "gemini-unavailable",
          modelDisplay: "Gemini Unavailable",
          type: "chatCompletion",
          provider: { name: "google", displayName: "Google AI" },
          status: { available: false },
        },
      ],
      paging: { page: 1, pageSize: 200 },
    };

    test("should fetch and return available models", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockModelRatesResponse)),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
      });

      // Should exclude unavailable models
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        id: "openai/gpt-4o",
        provider: "openai",
        model: "gpt-4o",
        type: "chat",
        available: true,
      });
    });

    test("should filter by type", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockModelRatesResponse)),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        type: "chat",
      });

      // Should only return chat models (excluding unavailable)
      expect(result).toHaveLength(3);
      expect(result.every((m) => m.type === "chat")).toBe(true);
    });

    test("should filter by type=image", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockModelRatesResponse)),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        type: "image",
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("openai/dall-e-3");
    });

    test("should pass search keyword to API as model param", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 2,
            list: [
              {
                model: "gpt-4o",
                modelDisplay: "GPT-4o",
                type: "chatCompletion",
                provider: { name: "openai", displayName: "OpenAI" },
                status: { available: true },
              },
              {
                model: "gpt-4o-mini",
                modelDisplay: "GPT-4o Mini",
                type: "chatCompletion",
                provider: { name: "openai", displayName: "OpenAI" },
                status: { available: true },
              },
            ],
            paging: { page: 1, pageSize: 200 },
          }),
        ),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        search: "gpt-4",
      });

      // Verify API was called with model param
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("model=gpt-4"),
        expect.any(Object),
      );
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.model)).toEqual(["gpt-4o", "gpt-4o-mini"]);
    });

    test("should not include model param when no search provided", async () => {
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockModelRatesResponse)),
      );

      await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
      });

      // Verify API was called without model param (check the last call)
      const lastCallIndex = fetchSpy.mock.calls.length - 1;
      const callUrl = fetchSpy.mock.calls[lastCallIndex]?.[0] as string;
      expect(callUrl).toContain("/api/ai-providers/model-rates");
      expect(callUrl).not.toContain("model=");
    });

    test("should apply limit", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockModelRatesResponse)),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        limit: 2,
      });

      expect(result).toHaveLength(2);
    });

    test("should combine type and search filters", async () => {
      // API returns filtered results by search, then we filter by type locally
      const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 1,
            list: [
              {
                model: "claude-3-5-sonnet",
                modelDisplay: "Claude 3.5 Sonnet",
                type: "chatCompletion",
                provider: { name: "anthropic", displayName: "Anthropic" },
                status: { available: true },
              },
            ],
            paging: { page: 1, pageSize: 200 },
          }),
        ),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        type: "chat",
        search: "claude",
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("model=claude"),
        expect.any(Object),
      );
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("anthropic/claude-3-5-sonnet");
    });

    test("should return empty array when no models match", async () => {
      // API returns empty list when search doesn't match
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 0,
            list: [],
            paging: { page: 1, pageSize: 200 },
          }),
        ),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
        search: "nonexistent",
      });

      expect(result).toHaveLength(0);
    });

    test("should include models with null status as available", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            count: 2,
            list: [
              {
                model: "gpt-4o",
                modelDisplay: "GPT-4o",
                type: "chatCompletion",
                provider: { name: "openai", displayName: "OpenAI" },
                status: { available: true },
              },
              {
                model: "gpt-null-status",
                modelDisplay: "GPT Null Status",
                type: "chatCompletion",
                provider: { name: "openai", displayName: "OpenAI" },
                status: null,
              },
            ],
            paging: { page: 1, pageSize: 200 },
          }),
        ),
      );

      const result = await fetchHubModels({
        baseUrl: "https://hub.aigne.io",
        apiKey: "test-key",
      });

      // Both models should be included (null status is treated as available)
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.model)).toEqual(["gpt-4o", "gpt-null-status"]);
    });

    test("should throw error on non-2xx response", async () => {
      spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" }),
      );

      expect(
        fetchHubModels({
          baseUrl: "https://hub.aigne.io",
          apiKey: "test-key",
        }),
      ).rejects.toThrow("500");
    });
  });
});
