import { GeminiImageModel } from "@aigne/gemini";
import { z } from "zod";

/**
 * Image generation agent input schema
 */
export const imageGenerationInputSchema = z.object({
  desc: z.string().describe("Image description (prompt seed)"),
  context: z.string().optional().describe("Owner document context to enrich the generation"),
});

/**
 * Image generation agent output schema
 */
export const imageGenerationOutputSchema = z.object({
  imageData: z.string().describe("Generated image data (base64 encoded)"),
  mimeType: z.string().optional().describe("Image MIME type"),
});

export type ImageGenerationInput = z.infer<typeof imageGenerationInputSchema>;
export type ImageGenerationOutput = z.infer<typeof imageGenerationOutputSchema>;

/**
 * Build prompt for image generation
 * Combines description with owner document context
 */
function buildPrompt(desc: string, context?: string): string {
  if (!context) {
    return desc;
  }

  // Combine context and description for richer generation
  return `Based on the following document context, generate an image that matches the description.

Document Context:
${context}

Image Description: ${desc}

Please generate an image that:
- Accurately represents the description
- Is consistent with the document context
- Has professional quality and clear visual elements`;
}

/**
 * Create the default built-in image generation agent
 */
export function createDefaultImageGenerationAgent(options?: {
  model?: string;
  apiKey?: string;
}): GeminiImageModel {
  return new GeminiImageModel({
    apiKey: options?.apiKey,
    model: options?.model || "gemini-2.5-flash",
    description: "Built-in image generation agent for image-driver",
  });
}

/**
 * Generate image using the agent
 * Handles prompt construction and output format
 */
export async function generateImage(
  agent: GeminiImageModel,
  input: ImageGenerationInput,
  format: string = "png",
): Promise<ImageGenerationOutput> {
  const prompt = buildPrompt(input.desc, input.context);

  // Determine output MIME type based on format
  const mimeType = format === "webp" ? "image/webp" : "image/png";

  const result = await agent.invoke({
    prompt,
    outputFileType: "file",
    modelOptions: {
      outputMimeType: mimeType,
    },
  });

  // Extract first image from results
  const firstImage = result.images[0];
  if (!firstImage || firstImage.type !== "file") {
    throw new Error("Failed to generate image: no image data returned");
  }

  return {
    imageData: firstImage.data,
    mimeType: firstImage.mimeType || mimeType,
  };
}
