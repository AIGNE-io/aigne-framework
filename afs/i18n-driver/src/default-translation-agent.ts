import { type Agent, AIAgent } from "@aigne/core";
import { z } from "zod";

/**
 * Translation agent input schema
 */
export const translationInputSchema = z.object({
  content: z.string().describe("Content to translate"),
  targetLanguage: z.string().describe("Target language code (e.g., 'en', 'ja')"),
  sourceLanguage: z.string().optional().describe("Source language code"),
});

/**
 * Translation agent output schema
 */
export const translationOutputSchema = z.object({
  translatedContent: z.string().describe("Translated content"),
});

export type TranslationInput = z.infer<typeof translationInputSchema>;
export type TranslationOutput = z.infer<typeof translationOutputSchema>;

/**
 * Default translation agent instructions
 */
export const DEFAULT_TRANSLATION_INSTRUCTIONS = `You are a professional translator.

Translate the provided content from the source language to the target language.
Maintain the original formatting, structure, and technical terms.
Preserve markdown syntax, code blocks, and special formatting.

Original content:
Source language: {{ sourceLanguage }}
<original>
{{ content }}
</original>

Target language: {{ targetLanguage }}

Requirements:
- Translate naturally and fluently
- Keep technical terms and proper nouns when appropriate
- Maintain the tone and style of the original content
- Do not add explanations or extra content
- Output only the translated content`;

/**
 * Create the default built-in translation agent
 */
export function createDefaultTranslationAgent(): Agent<TranslationInput, TranslationOutput> {
  return AIAgent.from({
    name: "i18n_translator",
    description: "Built-in translation agent for i18n driver",
    instructions: DEFAULT_TRANSLATION_INSTRUCTIONS,
    inputSchema: translationInputSchema,
    outputSchema: translationOutputSchema,
  });
}
