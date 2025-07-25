import jaison from "jaison";

/**
 * Safely parses JSON text using jaison library which handles malformed JSON better than JSON.parse
 *
 * @param text - The text to parse as JSON
 * @returns Parsed JSON object or null if parsing fails
 *
 * @example
 * ```typescript
 * const result = safeParseJSON('{"key": "value"}');
 * console.log(result); // { key: "value" }
 *
 * const malformed = safeParseJSON('{"key": "value"'); // Missing closing brace
 * console.log(malformed); // null
 * ```
 */
export function safeParseJSON(text: string): any {
  if (!text) return null;

  try {
    return jaison(text);
  } catch {
    return null;
  }
}

/**
 * Safely stringifies a value to JSON, handling errors gracefully
 *
 * @param value - The value to stringify
 * @param space - Optional spacing for pretty printing
 * @returns JSON string or null if stringification fails
 */
export function safeStringifyJSON(value: any, space?: number): string | null {
  try {
    return JSON.stringify(value, null, space);
  } catch {
    return null;
  }
}
