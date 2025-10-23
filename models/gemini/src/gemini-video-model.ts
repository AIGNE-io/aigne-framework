import {
  type AgentInvokeOptions,
  VideoModel,
  type VideoModelInput,
  type VideoModelOptions,
  type VideoModelOutput,
  videoModelInputSchema,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { type GenerateVideosParameters, GoogleGenAI } from "@google/genai";
import { type ZodType, z } from "zod";

const DEFAULT_MODEL = "veo-3.1-generate-preview";

/**
 * Input options for Gemini Video Model
 */
export interface GeminiVideoModelInput extends VideoModelInput {
  /**
   * Text describing content that should not appear in the video
   */
  negativePrompt?: string;

  /**
   * Aspect ratio of the video
   *
   * Veo 3.1: "16:9" (default, 720p and 1080p), "9:16" (720p and 1080p)
   * Veo 3: "16:9" (default, 720p and 1080p), "9:16" (720p and 1080p)
   * Veo 2: "16:9" (default, 720p), "9:16" (720p)
   */
  aspectRatio?: string;

  /**
   * Resolution of the video
   *
   * Veo 3.1: "720p" (default), "1080p" (only supports 8 seconds duration)
   * Veo 3: "720p" (default), "1080p" (16:9 only)
   * Veo 2: Not supported
   */
  size?: string;

  /**
   * Duration of the generated video in seconds
   *
   * Veo 3.1: "4", "6", "8"
   * Veo 3: "4", "6", "8"
   * Veo 2: "5", "6", "8"
   */
  seconds?: string;

  /**
   * Control person generation
   *
   * For text-to-video and image-to-video:
   * - Veo 3.1: "allow_all" for image-to-video, frame interpolation and reference images; only "allow_adult" for text-to-video
   * - Veo 3: "allow_all" for image-to-video; only "allow_adult" for text-to-video
   * - Veo 2: "allow_all", "allow_adult", "dont_allow"
   */
  personGeneration?: string;
}

/**
 * Output from Gemini Video Model
 */
export interface GeminiVideoModelOutput extends VideoModelOutput {}

/**
 * Configuration options for Gemini Video Model
 */
export interface GeminiVideoModelOptions
  extends VideoModelOptions<GeminiVideoModelInput, GeminiVideoModelOutput> {
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
   * Defaults to 'veo-3.1-generate-preview'
   */
  model?: string;

  /**
   * Additional model options to control behavior
   */
  modelOptions?: Omit<Partial<GeminiVideoModelInput>, "model">;

  /**
   * Client options for Gemini API
   */
  clientOptions?: Record<string, any>;

  /**
   * Polling interval in milliseconds for checking video generation status
   *
   * Defaults to 10000ms (10 seconds)
   */
  pollingInterval?: number;
}

const geminiVideoModelInputSchema: ZodType<GeminiVideoModelInput> = videoModelInputSchema.extend({
  negativePrompt: z.string().optional(),
  aspectRatio: z.string().optional(),
  personGeneration: z.string().optional(),
});

const geminiVideoModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
  clientOptions: z.object({}).optional(),
  pollingInterval: z.number().optional(),
});

export class GeminiVideoModel extends VideoModel<GeminiVideoModelInput, GeminiVideoModelOutput> {
  constructor(public override options?: GeminiVideoModelOptions) {
    super({
      ...options,
      description: options?.description ?? "Generate videos using Google Gemini Veo models",
      inputSchema: geminiVideoModelInputSchema,
    });

    if (options) checkArguments(this.name, geminiVideoModelOptionsSchema, options);
  }

  /**
   * @hidden
   */
  protected _client?: GoogleGenAI;

  protected apiKeyEnvName = "GEMINI_API_KEY";

  get client() {
    const { apiKey } = this.credential;
    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._client ??= new GoogleGenAI({ apiKey, ...this.options?.clientOptions });
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

  async downloadToFile(
    dir: string,
    videoId: string,
    videoFile: { uri?: string; videoBytes?: any },
  ): Promise<string> {
    logger.debug("Downloading video content...");
    const localPath = nodejs.path.join(dir, `${videoId}.mp4`);
    await this.client.files.download({ file: videoFile, downloadPath: localPath });
    logger.debug(`Generated video saved to ${localPath}`);

    await new Promise((resolve) => setTimeout(resolve, 300));
    const buffer = await nodejs.fs.readFile(localPath);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:video/mp4;base64,${base64}`;
    return dataUrl;
  }

  override async process(
    input: GeminiVideoModelInput,
    options: AgentInvokeOptions,
  ): Promise<GeminiVideoModelOutput> {
    const model = input.model ?? this.credential.model;
    const mergedInput = { ...this.modelOptions, ...input };

    const config: GenerateVideosParameters["config"] = {};
    if (mergedInput.negativePrompt) config.negativePrompt = mergedInput.negativePrompt;
    if (mergedInput.aspectRatio) config.aspectRatio = mergedInput.aspectRatio;
    if (mergedInput.size) config.resolution = mergedInput.size;
    if (mergedInput.seconds) config.durationSeconds = parseInt(mergedInput.seconds, 10);
    if (mergedInput.personGeneration) config.personGeneration = mergedInput.personGeneration;

    const params: GenerateVideosParameters = {
      model,
      prompt: mergedInput.prompt,
      config,
    };

    // Start video generation
    let operation = await this.client.models.generateVideos(params);
    logger.debug("Video generation started...");

    // Poll operation status until complete
    const pollingInterval = this.options?.pollingInterval ?? 10000;
    while (!operation.done) {
      logger.debug("Waiting for video generation to complete...");
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      operation = await this.client.operations.getVideosOperation({ operation });
    }

    if (!operation.response?.generatedVideos?.[0]?.video) {
      throw new Error("Video generation failed: No video generated");
    }

    // Download the generated video
    const generatedVideo = operation.response.generatedVideos[0];
    const videoFile = generatedVideo.video;

    if (!videoFile) {
      throw new Error("Video generation failed: No video file returned");
    }

    // Save to temporary directory
    const dir = nodejs.path.join(nodejs.os.tmpdir(), options?.context?.id || "");
    await nodejs.fs.mkdir(dir, { recursive: true });

    const videoId = Date.now().toString();

    return {
      videos: [
        {
          type: "file",
          data: await this.downloadToFile(dir, videoId, videoFile),
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
