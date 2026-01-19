import { fetch as coreFetch } from "@aigne/core/utils/fetch.js";
import { joinURL } from "ufo";

// Exported for testing - allows spyOn to mock the fetch function without affecting other tests
export const hubModelsFetcher = {
  fetch: coreFetch,
};

export interface HubModel {
  id: string; // provider/model format
  provider: string;
  model: string;
  type: string;
  available: boolean;
}

export interface CheckModelResult {
  model: string;
  available: boolean;
  error?: string;
}

interface ModelRatesResponse {
  count: number;
  list: ModelRate[];
  paging: { page: number; pageSize: number };
}

interface ModelRate {
  model: string;
  modelDisplay: string;
  type: string;
  provider: {
    name: string;
    displayName: string;
  };
  status: {
    available: boolean;
    error?: { code: string; message: string } | null;
  } | null;
}

interface StatusResponse {
  available: boolean;
  error?: string;
  code?: number;
}

// CLI type parameter to API type field mapping
const TYPE_MAP: Record<string, string> = {
  chat: "chatCompletion",
  image: "imageGeneration",
  video: "video",
  embedding: "embedding",
};

// Reverse mapping: API type to CLI type
const REVERSE_TYPE_MAP: Record<string, string> = {
  chatCompletion: "chat",
  imageGeneration: "image",
  video: "video",
  embedding: "embedding",
};

export async function checkModelAvailability(options: {
  baseUrl: string;
  apiKey: string;
  model: string;
}): Promise<CheckModelResult> {
  const { baseUrl, apiKey, model } = options;
  const secureBaseUrl = baseUrl.replace(/^http:/, "https:");

  const response = await hubModelsFetcher.fetch(
    joinURL(secureBaseUrl, `/api/v2/status?model=${encodeURIComponent(model)}`),
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to check model availability (HTTP ${response.status})`);
  }

  const data = (await response.json()) as StatusResponse;

  return {
    model,
    available: data.available,
    error: data.error,
  };
}

export async function fetchHubModels(options: {
  baseUrl: string;
  apiKey: string;
  type?: string;
  search?: string;
  limit?: number;
}): Promise<HubModel[]> {
  const { baseUrl, apiKey, type, search, limit = 20 } = options;
  const secureBaseUrl = baseUrl.replace(/^http:/, "https:");

  // Build query params - use API's model filter when search is provided
  const params = new URLSearchParams({
    pageSize: "200",
    page: "1",
  });
  if (search) {
    params.set("model", search);
  }

  const response = await hubModelsFetcher.fetch(
    joinURL(secureBaseUrl, `/api/ai-providers/model-rates?${params.toString()}`),
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch models (HTTP ${response.status})`);
  }

  const data = (await response.json()) as ModelRatesResponse;

  // Filter and transform models
  let models = data.list
    // Only include available models (null status is treated as available)
    .filter((item) => item.status === null || item.status?.available === true)
    // Filter by type if specified
    .filter((item) => {
      if (!type) return true;
      const apiType = TYPE_MAP[type];
      return apiType ? item.type === apiType : true;
    })
    // Transform to HubModel format
    .map((item) => ({
      id: `${item.provider.name}/${item.model}`,
      provider: item.provider.name,
      model: item.model,
      type: REVERSE_TYPE_MAP[item.type] || item.type,
      available: true,
    }));

  // Apply limit
  if (limit > 0) {
    models = models.slice(0, limit);
  }

  return models;
}
