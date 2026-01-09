import {
  type AgentInvokeOptions,
  type FileUnionContent,
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { type Camelize, snakelize } from "@aigne/core/utils/camelize.js";
import { checkArguments, pick } from "@aigne/core/utils/type-utils.js";
import type OpenAI from "openai";
import type { ClientOptions } from "openai";
import { type ZodType, z } from "zod";
import { CustomOpenAI } from "./openai.js";

const DEFAULT_MODEL = "dall-e-2";
const OUTPUT_MIME_TYPE = "image/png";

const SUPPORTED_PARAMS: { [key: string]: any[] } = {
  "dall-e-2": ["prompt", "size", "n"],
  "dall-e-3": ["prompt", "size", "n", "quality", "style", "user"],
  "gpt-image-1": [
    "prompt",
    "size",
    "background",
    "moderation",
    "outputCompression",
    "outputFormat",
    "quality",
    "user",
    "stream",
  ],
};

const SUPPORT_EDIT_MODELS = ["gpt-image-1"];

export interface OpenAIImageModelInput
  extends ImageModelInput,
    Camelize<
      Omit<
        OpenAI.ImageGenerateParams | OpenAI.ImageEditParams,
        "prompt" | "model" | "n" | "response_format"
      >
    > {}

export interface OpenAIImageModelOutput extends ImageModelOutput {}

export interface OpenAIImageModelOptions
  extends ImageModelOptions<OpenAIImageModelInput, OpenAIImageModelOutput> {
  /**
   * API key for OpenAI API
   *
   * If not provided, will look for OPENAI_API_KEY in environment variables
   */
  apiKey?: string;

  /**
   * Base URL for OpenAI API
   *
   * Useful for proxies or alternate endpoints
   */
  baseURL?: string;

  /**
   * OpenAI model to use
   *
   * Defaults to 'dall-e-2'
   */
  model?: string;

  /**
   * Additional model options to control behavior
   */
  modelOptions?: Omit<Partial<OpenAIImageModelInput>, "model">;

  /**
   * Client options for OpenAI API
   */
  clientOptions?: Partial<ClientOptions>;
}

const openAIImageModelInputSchema: ZodType<OpenAIImageModelInput> = imageModelInputSchema.extend(
  {},
);

const openAIImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
});

export class OpenAIImageModel extends ImageModel<OpenAIImageModelInput, OpenAIImageModelOutput> {
  constructor(public override options?: OpenAIImageModelOptions) {
    super({
      ...options,
      inputSchema: openAIImageModelInputSchema,
      description: options?.description ?? "Draw or edit image by OpenAI image models",
    });
    if (options) checkArguments(this.name, openAIImageModelOptionsSchema, options);
  }

  protected _client?: OpenAI;

  protected apiKeyEnvName = "OPENAI_API_KEY";

  get client() {
    if (this._client) return this._client;

    const { apiKey, url } = this.credential;

    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._client ??= new CustomOpenAI({
      baseURL: url,
      apiKey,
      ...this.options?.clientOptions,
    });

    return this._client;
  }

  override get credential() {
    return {
      url: this.options?.baseURL || process.env.OPENAI_BASE_URL,
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
  override async process(
    input: OpenAIImageModelInput,
    _options: AgentInvokeOptions,
  ): Promise<OpenAIImageModelOutput> {
    const model = input.modelOptions?.model || this.credential.model;

    if (input.image?.length && !SUPPORT_EDIT_MODELS.includes(model)) {
      throw new Error(`Model ${model} does not support image editing`);
    }

    const body: OpenAI.ImageGenerateParams | OpenAI.ImageEditParams = {
      ...snakelize(
        pick(
          { ...this.modelOptions, ...input.modelOptions, ...input },
          SUPPORTED_PARAMS[model] || SUPPORTED_PARAMS[DEFAULT_MODEL],
        ),
      ),
      model,
    };

    const response = input.image?.length
      ? ((await this.client.images.edit(
          {
            ...(body as OpenAI.ImageEditParams),
            image: await Promise.all(
              input.image.map((image) =>
                this.transformFileType("file", image).then(
                  (file) =>
                    new File([Buffer.from(file.data, "base64")], file.filename || "image.png", {
                      type: file.mimeType,
                    }),
                ),
              ),
            ),
          },
          { stream: false },
        )) as OpenAI.ImagesResponse)
      : ((await this.client.images.generate(
          { ...body },
          { stream: false },
        )) as OpenAI.ImagesResponse);

    return {
      images: (response.data ?? []).map<FileUnionContent>((image) => {
        if (image.url) return { type: "url", url: image.url, mimeType: OUTPUT_MIME_TYPE };
        if (image.b64_json)
          return { type: "file", data: image.b64_json, mimeType: OUTPUT_MIME_TYPE };
        throw new Error("Image response does not contain a valid URL or base64 data");
      }),
      usage: {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
      },
      model,
    };
  }
}
