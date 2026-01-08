import { fetch } from "@aigne/core/utils/fetch.js";
import { joinURL, withQuery } from "ufo";
import { z } from "zod";
import { getAIGNEHubMountPoint } from "./blocklet.js";
import { AIGNE_HUB_BLOCKLET_DID, aigneHubBaseUrl } from "./constants.js";

export interface GetModelsOptions {
  baseURL?: string;
  type?: "image" | "chat" | "embedding" | "video";
}

const modelsSchema = z.array(
  z.object({
    model: z.string(),
    type: z.string(),
    provider: z.string(),
    input_credits_per_token: z.string(),
    output_credits_per_token: z.string(),
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
  const url = await getAIGNEHubMountPoint(
    options.baseURL || aigneHubBaseUrl(),
    AIGNE_HUB_BLOCKLET_DID,
  );

  const response = await fetch(
    withQuery(joinURL(url, "/api/ai/models"), {
      type: options.type,
    }),
  );

  const json = await response.json();

  return modelsSchema.parse(json);
}
