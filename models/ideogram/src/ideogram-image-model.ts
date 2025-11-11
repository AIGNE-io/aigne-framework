import {
  type AgentInvokeOptions,
  ImageModel,
  type ImageModelInput,
  type ImageModelOptions,
  type ImageModelOutput,
  imageModelInputSchema,
} from "@aigne/core";
import { snakelize } from "@aigne/core/utils/camelize.js";
import { fetch } from "@aigne/core/utils/fetch.js";
import { checkArguments, flat, pick } from "@aigne/core/utils/type-utils.js";
import { joinURL } from "ufo";
import { z } from "zod";

const IDEOGRAM_BASE_URL = "https://api.ideogram.ai";
const IDEOGRAM_DEFAULT_IMAGE_MODEL = "ideogram-v3";

export interface IdeogramImageModelInput extends ImageModelInput {
  seed?: number;
  resolution?: string;
  aspectRatio?: string;
  renderingSpeed?: string;
  magicPrompt?: string;
  negativePrompt?: string;
  numImages?: number;
  colorPalette?: any;
  styleCodes?: string[];
  styleType?: string;
}

export interface IdeogramImageModelOutput extends ImageModelOutput {}

export interface IdeogramImageModelOptions
  extends ImageModelOptions<IdeogramImageModelInput, IdeogramImageModelOutput> {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  modelOptions?: Omit<Partial<IdeogramImageModelInput>, "model">;
}

const ideogramImageModelInputSchema = imageModelInputSchema.extend({});

const ideogramImageModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z.object({}).optional(),
});

export class IdeogramImageModel extends ImageModel<
  IdeogramImageModelInput,
  IdeogramImageModelOutput
> {
  constructor(public override options?: IdeogramImageModelOptions) {
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
      model: this.options?.model || IDEOGRAM_DEFAULT_IMAGE_MODEL,
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
    input: IdeogramImageModelInput,
    options: AgentInvokeOptions,
  ): Promise<ImageModelOutput> {
    const model = input.model || this.credential.model;
    const formData = new FormData();

    if (model !== "ideogram-v3") {
      throw new Error(`${this.name} only support ideogram-v3`);
    }

    const inputKeys = [
      "prompt",
      "seed",
      "resolution",
      "aspectRatio",
      "renderingSpeed",
      "magicPrompt",
      "negativePrompt",
      "colorPalette",
      "styleCodes",
      "styleType",
    ];

    const mergedInput = snakelize(
      pick({ ...this.modelOptions, ...input.modelOptions, ...input }, inputKeys),
    );

    Object.keys(mergedInput).forEach((key) => {
      if (mergedInput[key]) {
        formData.append(key, mergedInput[key] as string);
      }
    });

    if (input.n) {
      formData.append("num_images", input.n.toString());
    }

    const inputImages = flat(input.image);
    const image = inputImages.at(0);
    if (image) {
      if (inputImages.length > 1) {
        throw new Error(`${this.name} only support one image for editing`);
      }
      const { data } = await this.transformFileType("file", image, options);
      formData.append("image", new Blob([Buffer.from(data, "base64")]));
    }

    const { url, apiKey } = this.credential;
    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    const apiURL = joinURL(new URL(url).origin, "v1", model, image ? "remix" : "generate");

    const response = await fetch(apiURL, {
      method: "POST",
      headers: { "api-key": apiKey },
      body: formData,
    });

    const data: { data: { url: string }[] } = await response.json();

    return {
      images: data.data.map((item) => ({ type: "url", url: item.url, mimeType: "image/png" })),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model,
    };
  }
}
