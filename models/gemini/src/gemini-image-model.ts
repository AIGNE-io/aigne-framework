import {
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { checkArguments, isNonNullable, pick } from "@aigne/core/utils/type-utils.js";
import { type GenerateImagesConfig, GoogleGenAI } from "@google/genai";
import { z } from "zod";

const DEFAULT_MODEL = "imagen-4.0-generate-001";

export interface GeminiImageModelInput extends ImageModelInput, GenerateImagesConfig {}
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

const geminiImageModelInputSchema = imageModelInputSchema.extend({});

const geminiImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
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

    const mergedInput = { ...this.modelOptions, ...input };
    const inputKeys = [
      "seed",
      "safetyFilterLevel",
      "personGeneration",
      "outputMimeType",
      "outputGcsUri",
      "outputCompressionQuality",
      "negativePrompt",
      "language",
      "includeSafetyAttributes",
      "includeRaiReason",
      "imageSize",
      "guidanceScale",
      "aspectRatio",
      "addWatermark",
    ];

    const response = await this.client.models.generateImages({
      model: model,
      prompt: mergedInput.prompt,
      config: { numberOfImages: mergedInput.n || 1, ...pick(mergedInput, inputKeys) },
    });

    return {
      images:
        response.generatedImages
          ?.map(({ image }) => (image?.imageBytes ? { base64: image.imageBytes } : undefined))
          .filter(isNonNullable) || [],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }
}
