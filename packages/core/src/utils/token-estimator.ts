/**
 * Token estimation ratios for different character types
 * Based on empirical data from various tokenizers
 */
const CHAR_TYPE_RATIOS = {
  chinese: 1.5, // Chinese characters: ~1.5 characters per token
  word: 0.75, // English words: ~0.75 tokens per word (accounting for subword tokenization)
  other: 4, // Other characters (punctuation, numbers, etc.): ~4 characters per token
};

/**
 * Regular expressions for character type detection
 */
const CHAR_PATTERNS = {
  // CJK characters (Chinese, Japanese Kanji, etc.)
  chinese: /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff]/g,
  // English words (sequences of letters)
  word: /[a-zA-Z]+/g,
};

/**
 * Estimate tokens in text by analyzing character types
 * This function handles mixed-language text (Chinese and English) by counting
 * different character types and applying appropriate token ratios for each type
 *
 * @param text - The text to estimate
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  let tokens = 0;
  const processedIndices = new Set<number>();

  // Count Chinese characters (including CJK)
  const chineseMatches = text.match(CHAR_PATTERNS.chinese);
  if (chineseMatches) {
    tokens += chineseMatches.length / CHAR_TYPE_RATIOS.chinese;
    // Mark processed positions
    const chineseRegex = new RegExp(CHAR_PATTERNS.chinese.source, "g");
    let match = chineseRegex.exec(text);
    while (match !== null) {
      processedIndices.add(match.index);
      match = chineseRegex.exec(text);
    }
  }

  // Count English words
  const wordMatches = text.match(CHAR_PATTERNS.word);
  if (wordMatches) {
    tokens += wordMatches.length * CHAR_TYPE_RATIOS.word;
    const wordRegex = new RegExp(CHAR_PATTERNS.word.source, "g");
    let match = wordRegex.exec(text);
    while (match !== null) {
      for (let i = 0; i < match[0].length; i++) {
        processedIndices.add(match.index + i);
      }
      match = wordRegex.exec(text);
    }
  }

  // Count remaining characters (punctuation, numbers, whitespace, etc.)
  const remainingChars = text.length - processedIndices.size;
  if (remainingChars > 0) {
    tokens += remainingChars / CHAR_TYPE_RATIOS.other;
  }

  return Math.ceil(tokens);
}
