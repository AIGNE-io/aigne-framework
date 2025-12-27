import type { AFSDriver, AFSEntry, AFSModule, View } from "@aigne/afs";
import { normalizeViewKey } from "@aigne/afs";
import type { Context } from "@aigne/core";
import { optionalize } from "@aigne/core/loader/schema.js";
import type { GeminiImageModel } from "@aigne/gemini";
import { z } from "zod";
import {
  createDefaultImageGenerationAgent,
  generateImage,
  type ImageGenerationInput,
} from "./default-generation-agent.js";
import { getStoragePath } from "./storage.js";

/**
 * Image Generate Driver configuration options
 */
export interface ImageGenerateDriverOptions {
  /** Custom image generation agent (uses built-in agent if not provided) */
  imageGenerationAgent?: GeminiImageModel;

  /** Model to use for generation (default: "gemini-2.5-flash") */
  model?: string;

  /** API key for Gemini */
  apiKey?: string;

  /** Maximum retries on failure (default: 3) */
  maxRetries?: number;
}

const imageGenerateDriverOptionsSchema = z.object({
  model: optionalize(z.string()),
  apiKey: optionalize(z.string()),
  maxRetries: optionalize(z.number()),
});

/**
 * Image Generate Driver for AFS
 *
 * Handles AI-powered image generation based on slots in documents.
 */
export class ImageGenerateDriver implements AFSDriver {
  readonly name = "image-generate";
  readonly description = "AI image generation driver";
  readonly capabilities = {
    dimensions: ["format" as const],
  };

  private imageGenerationAgent: GeminiImageModel;
  private maxRetries: number;

  static schema() {
    return imageGenerateDriverOptionsSchema;
  }

  static async load({ parsed }: { parsed?: object }) {
    const valid = await ImageGenerateDriver.schema().passthrough().parseAsync(parsed);
    return new ImageGenerateDriver(valid);
  }

  constructor(options: ImageGenerateDriverOptions = {}) {
    // Use custom agent or create default
    this.imageGenerationAgent =
      options.imageGenerationAgent ??
      createDefaultImageGenerationAgent({
        model: options.model,
        apiKey: options.apiKey,
      });
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Check if this driver can handle the given view
   * Only handles views with format dimension only (for Phase 2)
   */
  canHandle(view: View): boolean {
    // Must have format
    if (!view.format) return false;

    // Phase 2: Only support format dimension (no language, variant, policy)
    const dimensions = Object.keys(view).filter((key) => key !== "format");
    if (dimensions.length > 0) return false;

    // Only support png format in Phase 2
    if (view.format !== "png") return false;

    return true;
  }

  /**
   * Process and generate the image view
   */
  async process(
    module: AFSModule,
    path: string,
    view: View,
    options: {
      sourceEntry: AFSEntry;
      metadata: any;
      context?: Context;
      metadataStore?: any;
    },
  ): Promise<{ data: AFSEntry; message?: string }> {
    const { format } = view;
    const { sourceEntry, context, metadataStore } = options;

    if (!format) {
      throw new Error("Format is required for image generation");
    }

    if (!context) {
      throw new Error("Context is required for image generation. Pass context via read options.");
    }

    if (!metadataStore) {
      throw new Error("MetadataStore not found in options");
    }

    // Query slot information from afs_slots
    const slot = await metadataStore.getSlotByAssetPath(module.name, path);
    if (!slot) {
      throw new Error(`No slot found for asset path: ${path}`);
    }

    // Read owner document content for context
    const ownerResult = await module.read?.(slot.ownerPath);
    if (!ownerResult?.data) {
      throw new Error(`Failed to read owner document: ${slot.ownerPath}`);
    }

    const ownerContent = ownerResult.data.content as string;

    // Generate image with retry logic
    const result = await this.generateWithRetry(
      {
        desc: slot.desc,
        context: ownerContent,
      },
      format,
    );

    // Compute storage path using slug for readable filename
    const viewKey = normalizeViewKey(view);
    const storagePath = getStoragePath(path, viewKey, slot.slug, format);

    // Write image to storage
    const imageBuffer = Buffer.from(result.imageData, "base64");
    await module.write?.(storagePath, { content: imageBuffer });

    // Record dependency relationship (image depends on owner document)
    const ownerMeta = await metadataStore.getSourceMetadata(module.name, slot.ownerPath);
    if (ownerMeta) {
      await metadataStore.setDependency(module.name, {
        outPath: path,
        outViewKey: viewKey,
        inPath: slot.ownerPath,
        inRevision: ownerMeta.sourceRevision,
        role: "owner-context",
      });
    }

    // Return generated entry
    return {
      data: {
        ...sourceEntry,
        content: imageBuffer,
        path,
        metadata: {
          ...sourceEntry.metadata,
          storagePath,
          view,
          mimeType: result.mimeType,
        },
      },
      message: `Image generated successfully for slot "${slot.slotId}"`,
    };
  }

  /**
   * Generate image with retry logic
   */
  private async generateWithRetry(
    input: ImageGenerationInput,
    format: string,
  ): Promise<{ imageData: string; mimeType?: string }> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await generateImage(this.imageGenerationAgent, input, format);
      } catch (error: any) {
        lastError = error;
        console.warn(
          `[ImageGenerateDriver] Attempt ${attempt}/${this.maxRetries} failed:`,
          error.message,
        );

        // If still have retries left, wait with exponential backoff
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to generate image after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }
}
