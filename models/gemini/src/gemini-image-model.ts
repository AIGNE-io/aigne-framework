import {
  type AgentInvokeOptions,
  type FileUnionContent,
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { checkArguments, flat, isNonNullable, pick } from "@aigne/core/utils/type-utils.js";
import {
  type GenerateContentConfig,
  type GenerateImagesConfig,
  GoogleGenAI,
  Modality,
  type PartUnion,
} from "@google/genai";
import { z } from "zod";

const DEFAULT_MODEL = "imagen-4.0-generate-001";

export interface GeminiImageModelInput
  extends ImageModelInput,
    GenerateImagesConfig,
    GenerateContentConfig {}
export interface GeminiImageModelOutput extends ImageModelOutput {}

export interface GeminiImageModelOptions
  extends ImageModelOptions<GeminiImageModelInput, GeminiImageModelOutput> {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  modelOptions?: Omit<Partial<GeminiImageModelInput>, "model">;
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
  constructor(public override options?: GeminiImageModelOptions) {
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
  override async process(
    input: GeminiImageModelInput,
    options: AgentInvokeOptions,
  ): Promise<ImageModelOutput> {
    const model = input.modelOptions?.model || this.credential.model;
    const responseFormat = input.responseFormat || "base64";
    if (responseFormat === "url") {
      throw new Error("Gemini image models currently only support base64 format");
    }

    if (model.includes("imagen")) {
      return this.generateImageByImagenModel(input);
    }

    return this.generateImageByGeminiModel(input, options);
  }

  private async generateImageByImagenModel(
    input: GeminiImageModelInput,
  ): Promise<ImageModelOutput> {
    const model = input.modelOptions?.model || this.credential.model;

    const mergedInput = { ...this.modelOptions, ...input.modelOptions, ...input };

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
      model,
      prompt: mergedInput.prompt,
      config: { numberOfImages: mergedInput.n || 1, ...pick(mergedInput, inputKeys) },
    });

    return {
      images:
        response.generatedImages
          ?.map<FileUnionContent | undefined>(({ image }) =>
            image?.imageBytes
              ? { type: "file", data: image.imageBytes, mimeType: image.mimeType }
              : undefined,
          )
          .filter(isNonNullable) || [],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }

  private async generateImageByGeminiModel(
    input: GeminiImageModelInput,
    options: AgentInvokeOptions,
  ): Promise<ImageModelOutput> {
    const model = input.modelOptions?.model || this.credential.model;

    const mergedInput = { ...this.modelOptions, ...input.modelOptions, ...input };

    const inputKeys = [
      "abortSignal",
      "audioTimestamp",
      "automaticFunctionCalling",
      "cachedContent",
      "frequencyPenalty",
      "httpOptions",
      "labels",
      "logprobs",
      "maxOutputTokens",
      "mediaResolution",
      "modelSelectionConfig",
      "presencePenalty",
      "responseJsonSchema",
      "responseLogprobs",
      "responseMimeType",
      "responseSchema",
      "routingConfig",
      "safetySettings",
      "seed",
      "speechConfig",
      "stopSequences",
      "systemInstruction",
      "temperature",
      "thinkingConfig",
      "toolConfig",
      "tools",
      "topK",
      "topP",
    ];

    const images = await Promise.all(
      flat(input.image).map<Promise<PartUnion>>(async (image) => {
        const { data, mimeType } = await this.transformFileType("file", image, options);
        return { inlineData: { data, mimeType } };
      }),
    );

    const response = await this.client.models.generateContent({
      model,
      contents: [{ text: input.prompt }, ...images],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        candidateCount: input.n || 1,
        ...pick(mergedInput, inputKeys),
      },
    });

    const allImages = (response.candidates ?? [])
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map<FileUnionContent | null>((part) =>
        part.inlineData?.data
          ? {
              type: "file",
              data: part.inlineData.data,
              filename: part.inlineData.displayName,
              mimeType: part.inlineData.mimeType,
            }
          : null,
      )
      .filter(isNonNullable);

    return {
      images: allImages,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
      model,
    };
  }
}
