import { type ZodType, z } from "zod";
import type { PromiseOrValue } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type Message,
} from "./agent.js";
import { type ChatModelOutputUsage, chatModelOutputUsageSchema } from "./chat-model.js";

export interface ImageModelOptions<
  I extends ImageModelInput = ImageModelInput,
  O extends ImageModelOutput = ImageModelOutput,
> extends Omit<AgentOptions<I, O>, "model"> {}

export abstract class ImageModel<
  I extends ImageModelInput = ImageModelInput,
  O extends ImageModelOutput = ImageModelOutput,
> extends Agent<I, O> {
  override tag = "ImageModelAgent";

  constructor(options?: ImageModelOptions<I, O>) {
    super({
      inputSchema: imageModelInputSchema as ZodType<I>,
      outputSchema: imageModelOutputSchema as ZodType<O>,
      ...options,
    });
  }

  get credential(): PromiseOrValue<{
    url?: string;
    apiKey?: string;
    model?: string;
  }> {
    return {};
  }

  protected override async preprocess(input: I, options: AgentInvokeOptions): Promise<void> {
    super.preprocess(input, options);
    const { limits, usage } = options.context;
    const usedTokens = usage.outputTokens + usage.inputTokens;
    if (limits?.maxTokens && usedTokens >= limits.maxTokens) {
      throw new Error(`Exceeded max tokens ${usedTokens}/${limits.maxTokens}`);
    }
  }

  protected override async postprocess(
    input: I,
    output: O,
    options: AgentInvokeOptions,
  ): Promise<void> {
    super.postprocess(input, output, options);
    const { usage } = output;
    if (usage) {
      options.context.usage.outputTokens += usage.outputTokens;
      options.context.usage.inputTokens += usage.inputTokens;
      if (usage.aigneHubCredits) options.context.usage.aigneHubCredits += usage.aigneHubCredits;
    }
  }

  abstract override process(
    input: I,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>>;

  protected async downloadFile(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text().catch(() => null);
      throw new Error(
        `Failed to download content from ${url}, ${response.status} ${response.statusText} ${text}`,
      );
    }

    return response;
  }
}

export interface ImageModelInput extends Message {
  model?: string;

  image?: string | string[];

  prompt: string;

  n?: number;

  responseFormat?: "url" | "base64";
}

export const imageModelInputSchema = z.object({
  model: z.string().optional(),
  image: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Image URL or base64 string(s) used for editing"),
  prompt: z.string(),
  n: z.number().int().min(1).optional(),
  responseFormat: z.enum(["url", "base64"]).optional(),
});

export interface ImageModelOutput extends Message {
  images: ImageModelOutputImage[];

  /**
   * Token usage statistics
   */
  usage?: ChatModelOutputUsage;

  /**
   * Model name or version used
   */
  model?: string;
}

export type ImageModelOutputImage = ImageModelOutputImageUrl | ImageModelOutputImageBase64;

export interface ImageModelOutputImageUrl {
  url: string;
}

export interface ImageModelOutputImageBase64 {
  base64: string;
}

export const imageModelOutputSchema = z.object({
  images: z.array(
    z.union([
      z.object({
        url: z.string(),
      }),
      z.object({
        base64: z.string(),
      }),
    ]),
  ),
  usage: chatModelOutputUsageSchema.optional(),
  model: z.string().optional(),
});
