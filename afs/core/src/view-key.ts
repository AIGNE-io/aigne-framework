import type { View } from "./type.js";

/**
 * Normalize ViewKey to a consistent string format
 *
 * Rules:
 * 1. Only allow whitelisted keys: language | format | variant | policy
 * 2. Normalize values: trim() + toLowerCase()
 * 3. Fixed key order: language → format → variant → policy
 * 4. Format: k=v;k=v (keys without values are omitted)
 *
 * This ensures stable primary key in view_metadata table:
 * - {format:"PNG", language:"EN"} → "language=en;format=png"
 * - {language:"en", format:"png"} → "language=en;format=png"
 * (same viewKey regardless of input key order)
 */
export function normalizeViewKey(view: View): string {
  const pairs: string[] = [];

  // Fixed order: language → format → variant → policy
  const trimmedLanguage = view.language?.trim().toLowerCase();
  if (trimmedLanguage) {
    pairs.push(`language=${trimmedLanguage}`);
  }

  const trimmedFormat = view.format?.trim().toLowerCase();
  if (trimmedFormat) {
    pairs.push(`format=${trimmedFormat}`);
  }

  const trimmedVariant = view.variant?.trim().toLowerCase();
  if (trimmedVariant) {
    pairs.push(`variant=${trimmedVariant}`);
  }

  const trimmedPolicy = view.policy?.trim().toLowerCase();
  if (trimmedPolicy) {
    pairs.push(`policy=${trimmedPolicy}`);
  }

  return pairs.join(";");
}
