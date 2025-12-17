import type { AFSDriver, AFSEntry, AFSModule, View } from "@aigne/afs";
import type { Agent, Context } from "@aigne/core";
import {
  createDefaultTranslationAgent,
  type TranslationInput,
  type TranslationOutput,
} from "./default-translation-agent.js";
import { getStoragePath } from "./storage.js";

/**
 * I18n Driver configuration options
 */
export interface I18nDriverOptions {
  /** Default source language code (e.g., "zh") */
  defaultSourceLanguage?: string;

  /** Supported target language codes */
  supportedLanguages?: string[];

  /** Custom translation agent (uses built-in agent if not provided) */
  translationAgent?: Agent<TranslationInput, TranslationOutput>;

  /** Storage path template (default: ".i18n/{language}/") */
  storagePath?: string;
}

/**
 * I18n Driver for AFS
 *
 * Handles translation of files to different languages using AI.
 */
export class I18nDriver implements AFSDriver {
  readonly name = "i18n";
  readonly description = "Multilingual translation driver";
  readonly capabilities = {
    dimensions: ["language" as const],
  };

  private translationAgent: Agent<TranslationInput, TranslationOutput>;

  constructor(private options: I18nDriverOptions = {}) {
    // Use custom agent or create default
    this.translationAgent = options.translationAgent ?? createDefaultTranslationAgent();
  }

  /**
   * Check if this driver can handle the given view
   * Only handles views with language dimension only
   */
  canHandle(view: View): boolean {
    // Must have language and only language
    if (!view.language) return false;
    if (Object.keys(view).length !== 1) return false;

    // Check if language is supported (if supportedLanguages is configured)
    if (this.options.supportedLanguages?.length) {
      return this.options.supportedLanguages.includes(view.language);
    }

    return true;
  }

  /**
   * Process and generate the translated view
   */
  async process(
    module: AFSModule,
    path: string,
    view: View,
    options: {
      sourceEntry: AFSEntry;
      metadata: any;
      context?: Context;
    },
  ): Promise<{ result: AFSEntry; message?: string }> {
    const { language } = view;
    const { sourceEntry, context } = options;

    if (!language) {
      throw new Error("Language is required for translation");
    }

    if (!context) {
      throw new Error("Context is required for translation. Pass context via read options.");
    }

    // Translate content using context from process options
    const translatedContent = await this.translate(
      sourceEntry.content as string,
      language,
      context,
    );

    // Get storage path
    const storagePath = getStoragePath(path, language, this.options.storagePath);

    // Write translated content to storage
    await module.write?.(storagePath, { content: translatedContent });

    // Return translated entry
    return {
      result: {
        ...sourceEntry,
        content: translatedContent,
        path,
        metadata: {
          ...sourceEntry.metadata,
          storagePath,
          view,
        },
      },
    };
  }

  /**
   * Translate content using the translation agent
   */
  private async translate(
    content: string,
    targetLanguage: string,
    context: Context,
  ): Promise<string> {
    const { translatedContent } = await context.invoke(this.translationAgent, {
      content,
      targetLanguage,
      sourceLanguage: this.options.defaultSourceLanguage,
    });

    return translatedContent;
  }
}
