import type { ChatModelOptions } from "@aigne/core";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import type { ImageModelOptions } from "@aigne/transport/http-client/base-client.js";
import { z } from "zod";

export const aigneHubModelOptionsSchema = z.object({
  url: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
      parallelToolCalls: z.boolean().optional().default(true),
    })
    .optional(),
  clientOptions: z.object({}).optional(),
});

export interface AIGNEHubChatModelOptions {
  url?: string;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
  clientOptions?: OpenAIChatModelOptions["clientOptions"] & { clientId?: string };
}

export type AIGNEHubImageOutput = {
  data: { url?: string; b64_json?: string; b64Json?: string }[];
  model: string;
};

export type AIGNEHubImageModelOptions = Omit<AIGNEHubChatModelOptions, "modelOptions"> & {
  modelOptions?: ImageModelOptions;
};
