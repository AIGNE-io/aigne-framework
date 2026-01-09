import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { type ZodType, z } from "zod";
import type { PromiseOrValue } from "../utils/type-utils.js";
import type {
  AgentInvokeOptions,
  AgentOptions,
  AgentProcessResult,
  AgentResponse,
  AgentResponseStream,
  GetterSchema,
  Message,
} from "./agent.js";
import { type ChatModelOutputUsage, chatModelOutputUsageSchema } from "./chat-model.js";
import {
  type FileType,
  type FileUnionContent,
  fileTypeSchema,
  fileUnionContentSchema,
  Model,
} from "./model.js";

export interface ImageModelOptions<
  I extends ImageModelInput = ImageModelInput,
  O extends ImageModelOutput = ImageModelOutput,
> extends Omit<AgentOptions<I, O>, "model"> {
  model?: string;

  modelOptions?: ImageModelInputOptionsWithGetter;
}

export abstract class ImageModel<
  I extends ImageModelInput = ImageModelInput,
  O extends ImageModelOutput = ImageModelOutput,
> extends Model<I, O> {
  override tag = "ImageModelAgent";

  constructor(public override options?: ImageModelOptions<I, O>) {
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

    if (input.image) {
      input.image = await Promise.all(
        input.image.map(async (item) => {
          if (item.type === "local") {
            return {
              ...item,
              type: "file" as const,
              data: await nodejs.fs.readFile(item.path, "base64"),
              path: undefined,
              mimeType: item.mimeType || (await ImageModel.getMimeType(item.filename || item.path)),
            };
          }

          if (
            (input.modelOptions?.preferInputFileType ||
              this.options?.modelOptions?.preferInputFileType) !== "url"
          ) {
            if (item.type === "url") {
              return {
                ...item,
                type: "file" as const,
                data: Buffer.from(await (await this.downloadFile(item.url)).arrayBuffer()).toString(
                  "base64",
                ),
                url: undefined,
                mimeType:
                  item.mimeType || (await ImageModel.getMimeType(item.filename || item.url)),
              };
            }
          }

          return item;
        }),
      );
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
      if (usage.creditPrefix) options.context.usage.creditPrefix = usage.creditPrefix;
    }
  }

  abstract override process(
    input: I,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>>;

  protected override async processAgentOutput(
    input: I,
    output: Exclude<AgentResponse<O>, AgentResponseStream<O>>,
    options: AgentInvokeOptions,
  ): Promise<O> {
    if (output.images) {
      const images = z.array(fileUnionContentSchema).parse(output.images);
      output = {
        ...output,
        images: await Promise.all(
          images.map((image) => this.transformFileType(input.outputFileType, image)),
        ),
      };
    }

    return super.processAgentOutput(input, output, options);
  }
}

export type ImageModelInputImage = FileUnionContent[];

export interface ImageModelInput extends Message {
  prompt: string;

  image?: ImageModelInputImage;

  n?: number;

  outputFileType?: FileType;

  modelOptions?: ImageModelInputOptions;
}

export interface ImageModelInputOptions extends Record<string, unknown> {
  model?: string;

  preferInputFileType?: "file" | "url";
}

export type ImageModelInputOptionsWithGetter = GetterSchema<ImageModelInputOptions>;

export const imageModelInputSchema = z.object({
  prompt: z.string(),
  image: z.array(fileUnionContentSchema).optional().describe("Images used for editing"),
  n: z.number().int().min(1).optional(),
  outputFileType: fileTypeSchema.optional(),
  modelOptions: z.record(z.unknown()).optional(),
});

export interface ImageModelOutput extends Message {
  images: FileUnionContent[];

  /**
   * Token usage statistics
   */
  usage?: ChatModelOutputUsage;

  /**
   * Model name or version used
   */
  model?: string;
}

export const imageModelOutputSchema = z.object({
  images: z.array(fileUnionContentSchema),
  usage: chatModelOutputUsageSchema.optional(),
  model: z.string().optional(),
});
