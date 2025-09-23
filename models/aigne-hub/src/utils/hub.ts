import { joinURL, withQuery } from "ufo";
import { z } from "zod";
import { getAIGNEHubMountPoint } from "./blocklet.js";
import { AIGNE_HUB_BLOCKLET_DID, AIGNE_HUB_URL } from "./constants.js";

export interface GetModelsOptions {
  url?: string;
  type?: "image" | "chat" | "embedding";
}

const modelsSchema = z.array(
  z.object({
    model: z.string(),
    type: z.string(),
    provider: z.string(),
    input_credits_per_token: z.number(),
    output_credits_per_token: z.number(),
    modelMetadata: z.record(z.unknown()).nullish(),
    providerDisplayName: z.string(),
    status: z
      .object({
        available: z.boolean(),
      })
      .nullish(),
  }),
);

export async function getModels(options: GetModelsOptions) {
  const url = await getAIGNEHubMountPoint(options.url || AIGNE_HUB_URL, AIGNE_HUB_BLOCKLET_DID);

  const response = await fetch(
    withQuery(joinURL(url, "/api/ai/models"), {
      type: options.type,
    }),
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText} ${text}`);
  }
  const json = await response.json();

  return modelsSchema.parse(json);
}
