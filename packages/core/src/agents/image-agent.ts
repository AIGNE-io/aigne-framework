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
import { type ImageModel, type ImageModelOutput, imageModelOutputSchema } from "./image-model.js";

export interface ImageAgentOptions<I extends Message = any, O extends ImageModelOutput = any>
  extends Omit<AgentOptions<I, O>, "outputSchema"> {
  model?: ImageModel;

  instructions: string | PromptBuilder;

  modelOptions?: Record<string, any>;
}

export const imageAgentOptionsSchema: ZodObject<{
  [key in keyof ImageAgentOptions]: ZodType<ImageAgentOptions[key]>;
}> = agentOptionsSchema.extend({
  model: z.custom<ImageModel>().optional(),
  instructions: z.union([z.string(), z.custom<PromptBuilder>()]),
  modelOptions: z.record(z.any()).optional(),
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

    this.model = options.model;
    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : options.instructions;
    this.modelOptions = options.modelOptions;
  }

  model?: ImageModel;

  instructions: PromptBuilder;

  modelOptions?: Record<string, any>;

  override async process(input: I, options: AgentInvokeOptions): Promise<O> {
    const model = this.model ?? options.context.imageModel;
    if (!model) throw new Error("image model is required to run ImageAgent");

    const { prompt } = await this.instructions.buildImagePrompt({ input });

    return (await options.context.invoke(
      model,
      { ...input, ...this.modelOptions, prompt },
      { ...options, streaming: false },
    )) as O;
  }
}
