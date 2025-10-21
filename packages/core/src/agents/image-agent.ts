import z, { type ZodObject, type ZodType } from "zod";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { checkArguments } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  agentOptionsSchema,
  type Message,
} from "./agent.js";
import { type ImageModelOutput, imageModelOutputSchema } from "./image-model.js";
import { type FileType, fileTypeSchema } from "./model.js";

export interface ImageAgentOptions<I extends Message = any, O extends ImageModelOutput = any>
  extends Omit<AgentOptions<I, O>, "outputSchema"> {
  instructions: string | PromptBuilder;

  inputFileKey?: string;

  modelOptions?: Record<string, any>;

  outputFileType?: FileType;
}

export const imageAgentOptionsSchema: ZodObject<{
  [key in keyof ImageAgentOptions]: ZodType<ImageAgentOptions[key]>;
}> = agentOptionsSchema.extend({
  instructions: z.union([z.string(), z.custom<PromptBuilder>()]),
  modelOptions: z.record(z.any()).optional(),
  outputFileType: fileTypeSchema.optional(),
});

export class ImageAgent<I extends Message = any, O extends ImageModelOutput = any> extends Agent<
  I,
  O
> {
  override tag = "ImageAgent";

  static from<I extends Message = any, O extends ImageModelOutput = any>(
    options: ImageAgentOptions<I, O>,
  ): ImageAgent<I, O> {
    return new ImageAgent(options);
  }

  constructor(options: ImageAgentOptions<I, O>) {
    super({ ...options, outputSchema: imageModelOutputSchema as ZodType<O> });
    checkArguments("ImageAgent", imageAgentOptionsSchema, options);

    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : options.instructions;
    this.inputFileKey = options.inputFileKey;
    this.modelOptions = options.modelOptions;
    this.outputFileType = options.outputFileType;
  }

  instructions: PromptBuilder;

  inputFileKey?: string;

  modelOptions?: Record<string, any>;

  outputFileType?: FileType;

  override async process(input: I, options: AgentInvokeOptions): Promise<O> {
    const imageModel = this.imageModel || options.imageModel || options.context.imageModel;
    if (!imageModel) throw new Error("image model is required to run ImageAgent");

    const { prompt, image } = await this.instructions.buildImagePrompt({ input, agent: this });

    return (await this.invokeChildAgent(
      imageModel,
      {
        ...input,
        modelOptions: this.modelOptions,
        prompt,
        image,
        outputFileType: this.outputFileType,
      },
      { ...options, streaming: false },
    )) as O;
  }
}
