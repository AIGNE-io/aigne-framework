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

export interface VideoModelOptions<
  I extends VideoModelInput = VideoModelInput,
  O extends VideoModelOutput = VideoModelOutput,
> extends Omit<AgentOptions<I, O>, "model"> {
  model?: string;

  modelOptions?: VideoModelInputOptionsWithGetter;
}

export abstract class VideoModel<
  I extends VideoModelInput = VideoModelInput,
  O extends VideoModelOutput = VideoModelOutput,
> extends Model<I, O> {
  override tag = "VideoModelAgent";

  constructor(public override options?: VideoModelOptions<I, O>) {
    super({
      inputSchema: videoModelInputSchema as ZodType<I>,
      outputSchema: videoModelOutputSchema as ZodType<O>,
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
    if (output.videos) {
      const videos = z.array(fileUnionContentSchema).parse(output.videos);
      output = {
        ...output,
        videos: await Promise.all(
          videos.map((video) => this.transformFileType(input.outputFileType, video)),
        ),
      };
    }

    return super.processAgentOutput(input, output, options);
  }
}

export interface VideoModelInput extends Message {
  prompt: string;

  model?: string;

  size?: string;

  seconds?: string;

  outputFileType?: FileType;

  modelOptions?: VideoModelInputOptions;

  image?: FileUnionContent;
}

export interface VideoModelInputOptions extends Record<string, unknown> {
  model?: string;
}

export type VideoModelInputOptionsWithGetter = GetterSchema<VideoModelInputOptions>;

export const videoModelInputSchema = z.object({
  prompt: z.string().describe("Text prompt describing the video to generate"),
  model: z.string().optional().describe("Model to use for video generation"),
  size: z.string().optional().describe("Size/resolution of the video"),
  seconds: z.string().optional().describe("Duration of the video in seconds"),
  outputFileType: fileTypeSchema.optional(),
  modelOptions: z.record(z.unknown()).optional(),
  image: fileUnionContentSchema.optional(),
});

export interface VideoModelOutput extends Message {
  videos: FileUnionContent[];

  /**
   * Token usage statistics
   */
  usage?: ChatModelOutputUsage;

  /**
   * Model name or version used
   */
  model?: string;

  seconds?: number;
}

export const videoModelOutputSchema = z.object({
  videos: z.array(fileUnionContentSchema),
  usage: chatModelOutputUsageSchema.optional(),
  model: z.string().optional(),
  seconds: z.number().optional(),
});
