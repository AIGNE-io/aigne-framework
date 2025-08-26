import {
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import { GoogleGenAI } from "@google/genai";

import { z } from "zod";

const DEFAULT_MODEL = "gemini-2.0-flash-preview-image-generation";

export interface GeminiImageModelInput extends ImageModelInput {}
export interface GeminiImageModelOutput extends ImageModelOutput {}

export interface GeminiImageModelOptions
  extends ImageModelOptions<GeminiImageModelInput, GeminiImageModelOutput> {
  /**
   * API key for Gemini API
   *
   * If not provided, will look for GEMINI_API_KEY in environment variables
   */
  apiKey?: string;

  /**
   * Base URL for Gemini API
   *
   * Useful for proxies or alternate endpoints
   */
  baseURL?: string;

  /**
   * Gemini model to use
   *
   * Defaults to 'gemini-2.0-flash'
   */
  model?: string;

  /**
   * Additional model options to control behavior
   */
  modelOptions?: Omit<Partial<GeminiImageModelInput>, "model">;

  /**
   * Client options for Gemini API
   */
  clientOptions?: Record<string, any>;
}

const geminiImageModelInputSchema = imageModelInputSchema.extend({
  model: z.string().optional(),
  n: z.number().optional(),
  responseFormat: z.enum(["url", "base64"]).optional(),
  size: z.string().optional(),
});

const geminiImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
});

export class GeminiImageModel extends ImageModel<GeminiImageModelInput, GeminiImageModelOutput> {
  constructor(public options?: GeminiImageModelOptions) {
    super({
      ...options,
      inputSchema: geminiImageModelInputSchema,
      description: options?.description ?? "Draw or edit image by Gemini image models",
    });
    if (options) checkArguments(this.name, geminiImageModelOptionsSchema, options);
  }

  protected _client?: GoogleGenAI;

  protected apiKeyEnvName = "GEMINI_API_KEY";

  get client() {
    if (this._client) return this._client;

    const { apiKey } = this.credential;

    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._client ??= new GoogleGenAI({ apiKey });

    return this._client;
  }

  override get credential() {
    return {
      url: this.options?.baseURL || process.env.GEMINI_BASE_URL,
      apiKey: this.options?.apiKey || process.env[this.apiKeyEnvName],
      model: this.options?.model || DEFAULT_MODEL,
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
  override async process(input: GeminiImageModelInput): Promise<ImageModelOutput> {
    const model = input.model || this.credential.model;
    const responseFormat = input.responseFormat || "base64";
    if (responseFormat === "url") {
      throw new Error("Gemini image models currently only support base64 format");
    }

    const response = await this.client.models.generateImages({
      model: model,
      prompt: input.prompt,
      config: { numberOfImages: input.n || 1 },
    });

    return {
      images:
        response.generatedImages
          ?.filter((image) => image.image?.imageBytes)
          .map((image) => ({ base64: image.image?.imageBytes! })) || [],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }
}
