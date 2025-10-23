import {
  VideoModel,
  type VideoModelInput,
  type VideoModelOptions,
  type VideoModelOutput,
  videoModelInputSchema,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import type OpenAI from "openai";
import type { ClientOptions } from "openai";
import { type ZodType, z } from "zod";
import { CustomOpenAI } from "./openai.js";

const DEFAULT_MODEL = "sora-2";

/**
 * Input options for OpenAI Video Model
 */
export interface OpenAIVideoModelInput extends VideoModelInput {
  /**
   * Optional image reference that guides generation (file path or URL)
   */
  inputReference?: string;
}

/**
 * Output from OpenAI Video Model
 */
export interface OpenAIVideoModelOutput extends VideoModelOutput {}

/**
 * Configuration options for OpenAI Video Model
 */
export interface OpenAIVideoModelOptions
  extends VideoModelOptions<OpenAIVideoModelInput, OpenAIVideoModelOutput> {
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
   * Defaults to 'sora-2'
   */
  model?: string;

  /**
   * Additional model options to control behavior
   */
  modelOptions?: Omit<Partial<OpenAIVideoModelInput>, "model">;

  /**
   * Client options for OpenAI API
   */
  clientOptions?: Partial<ClientOptions>;

  /**
   * Polling interval in milliseconds for checking video generation status
   *
   * Defaults to 2000ms (2 seconds)
   */
  pollingInterval?: number;
}

const openAIVideoModelInputSchema: ZodType<OpenAIVideoModelInput> = videoModelInputSchema.extend({
  inputReference: z.string().optional(),
});

const openAIVideoModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
  pollingInterval: z.number().optional(),
});

export class OpenAIVideoModel extends VideoModel<OpenAIVideoModelInput, OpenAIVideoModelOutput> {
  constructor(public override options?: OpenAIVideoModelOptions) {
    super({
      ...options,
      description: options?.description ?? "Generate videos using OpenAI Sora models",
      inputSchema: openAIVideoModelInputSchema,
    });

    if (options) checkArguments(this.name, openAIVideoModelOptionsSchema, options);
  }

  /**
   * @hidden
   */
  protected _client?: OpenAI;

  protected apiKeyEnvName = "OPENAI_API_KEY";

  get client() {
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

  async downloadToFile(videoId: string): Promise<string> {
    logger.debug("Downloading video content...");
    const content = await this.client.videos.downloadContent(videoId);
    const arrayBuffer = await content.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString("base64");
    const dataUrl = `data:video/mp4;base64,${base64}`;

    return dataUrl;
  }

  override async process(input: OpenAIVideoModelInput): Promise<OpenAIVideoModelOutput> {
    const model = input.model ?? this.credential.model;

    const createParams: OpenAI.Videos.VideoCreateParams = {
      model: model as OpenAI.Videos.VideoModel,
      prompt: input.prompt,
    };

    if (input.seconds) createParams.seconds = input.seconds as OpenAI.Videos.VideoSeconds;
    if (input.size) createParams.size = input.size as OpenAI.Videos.VideoSize;
    if (input.inputReference) {
      createParams.input_reference =
        input.inputReference as unknown as OpenAI.Videos.VideoCreateParams["input_reference"];
    }

    let video = await this.client.videos.create(createParams);
    logger.debug(`Video generation started: ${video.id}`);

    const pollingInterval = this.options?.pollingInterval ?? 2000;
    while (video.status === "in_progress" || video.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      video = await this.client.videos.retrieve(video.id);

      const progress = video.progress ?? 0;
      const statusText = video.status === "queued" ? "Queued" : "Processing";
      logger.debug(`${statusText}: ${progress.toFixed(1)}%`);
    }

    if (video.status === "failed") {
      throw new Error(`Video generation failed: ${video.error?.message || "Unknown error"}`);
    }

    if (video.status !== "completed") {
      throw new Error(`Unexpected video status: ${video.status}`);
    }

    return {
      videos: [
        {
          type: "file",
          data: await this.downloadToFile(video.id),
        },
      ],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }
}
