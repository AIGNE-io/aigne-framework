import {
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { checkArguments, pick } from "@aigne/core/utils/type-utils.js";
import { type ZodType, z } from "zod";

const IDEOGRAM_BASE_URL = "https://api.ideogram.ai/v1/ideogram-v3/generate";

export interface IdeogramImageModelInput extends ImageModelInput {
  prompt: string;
  seed?: number;
  resolution?: string;
  aspect_ratio?: string;
  rendering_speed?: string;
  magic_prompt?: string;
  negative_prompt?: string;
  num_images?: number;
  color_palette?: any;
  style_codes?: string[];
  style_type?: string;
}

export interface IdeogramImageModelOutput extends ImageModelOutput {}

export interface IdeogramImageModelOptions
  extends ImageModelOptions<IdeogramImageModelInput, IdeogramImageModelOutput> {
  apiKey?: string;
  baseURL?: string;
  modelOptions?: Omit<Partial<IdeogramImageModelInput>, "model">;
}

const ideogramImageModelInputSchema: ZodType<IdeogramImageModelInput> =
  imageModelInputSchema.extend({
    prompt: z.string(),
    resolution: z.string().optional(),
    aspect_ratio: z.string().optional(),
    rendering_speed: z.string().optional(),
    magic_prompt: z.string().optional(),
    negative_prompt: z.string().optional(),
    num_images: z.number().optional(),
    color_palette: z.any().optional(),
    style_codes: z.array(z.string()).optional(),
    style_type: z.string().optional(),
    seed: z.number().optional(),
  });

const ideogramImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
});

export class IdeogramImageModel extends ImageModel<
  IdeogramImageModelInput,
  IdeogramImageModelOutput
> {
  constructor(public options?: IdeogramImageModelOptions) {
    super({
      ...options,
      inputSchema: ideogramImageModelInputSchema,
      description: options?.description ?? "Draw or edit image by Ideogram image models",
    });
    if (options) checkArguments(this.name, ideogramImageModelOptionsSchema, options);
  }

  protected apiKeyEnvName = "IDEOGRAM_API_KEY";

  override get credential() {
    return {
      url: this.options?.baseURL || process.env.IDEOGRAM_BASE_URL || IDEOGRAM_BASE_URL,
      apiKey: this.options?.apiKey || process.env[this.apiKeyEnvName],
    };
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  /**
   * Process the input and generate a response
   * @param input The input to process
   * @returns The generated response
   */
  override async process(input: IdeogramImageModelInput): Promise<ImageModelOutput> {
    const model = input.model;
    const formData = new FormData();

    const inputKeys = [
      "prompt",
      "seed",
      "resolution",
      "aspect_ratio",
      "rendering_speed",
      "magic_prompt",
      "negative_prompt",
      "num_images",
      "color_palette",
      "style_codes",
      "style_type",
    ];

    const mergedInput = pick({ ...this.modelOptions, ...input }, inputKeys);

    Object.keys(mergedInput).forEach((key) => {
      if (mergedInput[key]) {
        formData.append(key, mergedInput[key] as string);
      }
    });

    const { url, apiKey } = this.credential;
    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    const response = await fetch(url, {
      method: "POST",
      headers: { "api-key": apiKey ?? "" },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ideogram API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      images: data.data.map((item: { url: string }) => ({ url: item.url })),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }
}
