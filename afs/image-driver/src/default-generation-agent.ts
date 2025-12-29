// import { AIGNEHubImageModel } from "@aigne/aigne-hub";
import { type Agent, ImageAgent, type ImageModelOutput } from "@aigne/core";
// import { GeminiImageModel } from "@aigne/gemini";
import { z } from "zod";

/**
 * Image generation agent input schema
 */
export const imageGenerationInputSchema = z.object({
  desc: z.string().describe("Image description (prompt seed)"),
  context: z.string().optional().describe("Owner document context to enrich the generation"),
});

export type ImageGenerationInput = z.infer<typeof imageGenerationInputSchema>;
export type ImageGenerationOutput = ImageModelOutput;

/**
 * Default image generation instructions template
 */
export const DEFAULT_IMAGE_GENERATION_INSTRUCTIONS = `Generate an image based on the following description.

Image Description: {{ desc }}

Document Context:
<context>
{{ context }}
</context>

Please generate an image that:
- Accurately represents the description
- Is consistent with the document context (if provided)
- Has professional quality and clear visual elements`;

/**
 * Create the default built-in image generation agent
 * Note: The ImageModel will be automatically obtained from context.imageModel when invoked
 */
export function createDefaultImageGenerationAgent(): Agent<
  ImageGenerationInput,
  ImageGenerationOutput
> {
  return new ImageAgent({
    name: "image_generator",
    description: "Built-in image generation agent for image-driver",
    instructions: DEFAULT_IMAGE_GENERATION_INSTRUCTIONS,
    inputSchema: imageGenerationInputSchema,
    outputFileType: "local",
  });
}
