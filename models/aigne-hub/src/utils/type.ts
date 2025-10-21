import type { ChatModelOptions, ImageModelOptions, VideoModelOptions } from "@aigne/core";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import { z } from "zod";

export const aigneHubModelOptionsSchema = z.object({
  baseURL: z.string().optional(),
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

export interface AIGNEHubChatModelOptions extends ChatModelOptions {
  baseURL?: string;
  apiKey?: string;
  clientOptions?: OpenAIChatModelOptions["clientOptions"] & { clientId?: string };
}

export interface AIGNEHubImageModelOptions extends ImageModelOptions {
  baseURL?: string;
  apiKey?: string;
  clientOptions?: OpenAIChatModelOptions["clientOptions"] & { clientId?: string };
}

export interface AIGNEHubVideoModelOptions extends VideoModelOptions {
  baseURL?: string;
  apiKey?: string;
  clientOptions?: OpenAIChatModelOptions["clientOptions"] & { clientId?: string };
}
