import { expect, spyOn, test } from "bun:test";
import { checkModelAvailability, fetchHubModels } from "@aigne/cli/utils/aigne-hub-models.js";

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

test("checkModelAvailability should return available=true when model is available", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify({ available: true }))),
  );

  const result = await checkModelAvailability({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    model: "openai/gpt-4o",
  });

  console.log("[TEST 1] checkModelAvailability result:", JSON.stringify(result));
  console.log("[TEST 1] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 1] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  expect(result).toEqual({
    model: "openai/gpt-4o",
    available: true,
    error: undefined,
  });

  fetchSpy.mockRestore();
});

test("checkModelAvailability should return available=false when model is not available", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
      new Response(
        JSON.stringify({
          available: false,
          error: "No providers available",
          code: 503,
        }),
      ),
    ),
  );

  const result = await checkModelAvailability({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    model: "openai/gpt-99",
  });

  console.log("[TEST 2] checkModelAvailability result:", JSON.stringify(result));
  console.log("[TEST 2] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 2] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  expect(result).toEqual({
    model: "openai/gpt-99",
    available: false,
    error: "No providers available",
  });

  fetchSpy.mockRestore();
});

test("checkModelAvailability should convert http to https", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify({ available: true }))),
  );

  await checkModelAvailability({
    baseUrl: "http://hub.mock.aigne.io",
    apiKey: "test-key",
    model: "openai/gpt-4o",
  });

  console.log("[TEST 3] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 3] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("https://hub.mock.aigne.io"),
    expect.any(Object),
  );

  fetchSpy.mockRestore();
});

test("checkModelAvailability should encode model name in URL", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify({ available: true }))),
  );

  await checkModelAvailability({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    model: "openai/gpt-4o",
  });

  console.log("[TEST 4] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 4] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("model=openai%2Fgpt-4o"),
    expect.any(Object),
  );

  fetchSpy.mockRestore();
});

test("checkModelAvailability should throw error on non-2xx response", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response("Unauthorized", { status: 401, statusText: "Unauthorized" })),
  );

  console.log(
    "[TEST 5] Before checkModelAvailability, fetchSpy.mock.calls.length:",
    fetchSpy.mock.calls.length,
  );

  await expect(
    checkModelAvailability({
      baseUrl: "https://hub.mock.aigne.io",
      apiKey: "invalid-key",
      model: "openai/gpt-4o",
    }),
  ).rejects.toThrow("401");

  console.log("[TEST 5] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 5] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  fetchSpy.mockRestore();
});

test("fetchHubModels should fetch and return available models", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify(mockModelRatesResponse))),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
  });

  console.log("[TEST 6] fetchHubModels result length:", result.length);
  console.log("[TEST 6] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 6] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  // Should exclude unavailable models
  expect(result).toHaveLength(4);
  expect(result[0]).toEqual({
    id: "openai/gpt-4o",
    provider: "openai",
    model: "gpt-4o",
    type: "chat",
    available: true,
  });

  fetchSpy.mockRestore();
});

test("fetchHubModels should filter by type", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify(mockModelRatesResponse))),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    type: "chat",
  });

  console.log("[TEST 7] fetchHubModels result length:", result.length);
  console.log("[TEST 7] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);

  // Should only return chat models (excluding unavailable)
  expect(result).toHaveLength(3);
  expect(result.every((m) => m.type === "chat")).toBe(true);

  fetchSpy.mockRestore();
});

test("fetchHubModels should filter by type=image", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify(mockModelRatesResponse))),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    type: "image",
  });

  console.log("[TEST 8] fetchHubModels result length:", result.length);
  console.log("[TEST 8] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);

  expect(result).toHaveLength(1);
  expect(result[0]?.id).toBe("openai/dall-e-3");

  fetchSpy.mockRestore();
});

test("fetchHubModels should pass search keyword to API as model param", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
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
    ),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    search: "gpt-4",
  });

  console.log(
    "[TEST 9] fetchHubModels result:",
    result.map((m) => m.model),
  );
  console.log("[TEST 9] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 9] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  // Verify API was called with model param
  expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("model=gpt-4"), expect.any(Object));
  expect(result).toHaveLength(2);
  expect(result.map((m) => m.model)).toEqual(["gpt-4o", "gpt-4o-mini"]);

  fetchSpy.mockRestore();
});

test("fetchHubModels should not include model param when no search provided", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify(mockModelRatesResponse))),
  );

  await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
  });

  console.log("[TEST 10] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log(
    "[TEST 10] All calls:",
    fetchSpy.mock.calls.map((c) => c[0]),
  );

  // Verify API was called without model param - check the last call
  const lastCallIndex = fetchSpy.mock.calls.length - 1;
  const callUrl = fetchSpy.mock.calls[lastCallIndex]?.[0] as string;
  expect(callUrl).toContain("/api/ai-providers/model-rates");
  expect(callUrl).not.toContain("model=");

  fetchSpy.mockRestore();
});

test("fetchHubModels should apply limit", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(new Response(JSON.stringify(mockModelRatesResponse))),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    limit: 2,
  });

  console.log("[TEST 11] fetchHubModels result length:", result.length);
  console.log("[TEST 11] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);

  expect(result).toHaveLength(2);

  fetchSpy.mockRestore();
});

test("fetchHubModels should combine type and search filters", async () => {
  // API returns filtered results by search, then we filter by type locally
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
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
    ),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    type: "chat",
    search: "claude",
  });

  console.log("[TEST 12] fetchHubModels result:", result);
  console.log("[TEST 12] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 12] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  expect(fetchSpy).toHaveBeenCalledWith(
    expect.stringContaining("model=claude"),
    expect.any(Object),
  );
  expect(result).toHaveLength(1);
  expect(result[0]?.id).toBe("anthropic/claude-3-5-sonnet");

  fetchSpy.mockRestore();
});

test("fetchHubModels should return empty array when no models match", async () => {
  // API returns empty list when search doesn't match
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
      new Response(
        JSON.stringify({
          count: 0,
          list: [],
          paging: { page: 1, pageSize: 200 },
        }),
      ),
    ),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
    search: "nonexistent",
  });

  console.log("[TEST 13] fetchHubModels result length:", result.length);
  console.log("[TEST 13] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);

  expect(result).toHaveLength(0);

  fetchSpy.mockRestore();
});

test("fetchHubModels should include models with null status as available", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
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
    ),
  );

  const result = await fetchHubModels({
    baseUrl: "https://hub.mock.aigne.io",
    apiKey: "test-key",
  });

  console.log(
    "[TEST 14] fetchHubModels result:",
    result.map((m) => m.model),
  );
  console.log("[TEST 14] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);

  // Both models should be included (null status is treated as available)
  expect(result).toHaveLength(2);
  expect(result.map((m) => m.model)).toEqual(["gpt-4o", "gpt-null-status"]);

  fetchSpy.mockRestore();
});

test("fetchHubModels should throw error on non-2xx response", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockReturnValueOnce(
    Promise.resolve(
      new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      }),
    ),
  );

  console.log(
    "[TEST 15] Before fetchHubModels, fetchSpy.mock.calls.length:",
    fetchSpy.mock.calls.length,
  );

  await expect(
    fetchHubModels({
      baseUrl: "https://hub.mock.aigne.io",
      apiKey: "test-key",
    }),
  ).rejects.toThrow("500");

  console.log("[TEST 15] fetchSpy.mock.calls.length:", fetchSpy.mock.calls.length);
  console.log("[TEST 15] fetchSpy.mock.calls[0]:", fetchSpy.mock.calls[0]?.[0]);

  fetchSpy.mockRestore();
});
