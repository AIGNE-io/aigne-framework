import { join } from "node:path";

/**
 * Get storage path for a generated image
 * Format: <assetPath>/<viewKey>/<slug>.<format>
 *
 * @param assetPath - Logical asset path (e.g., ".afs/images/by-intent/abc123")
 * @param viewKey - Normalized view key (e.g., "format=png;variant=original")
 * @param slug - Human-readable filename (e.g., "company-logo")
 * @param format - Image format (e.g., "png", "webp")
 * @returns Physical storage path for the generated image
 *
 * @example
 * getStoragePath(".afs/images/by-intent/abc123", "format=png", "company-logo", "png")
 * // Returns: ".afs/images/by-intent/abc123/format=png/company-logo.png"
 *
 * getStoragePath(".afs/images/by-intent/xyz789", "format=webp;variant=thumbnail", "diagram", "webp")
 * // Returns: ".afs/images/by-intent/xyz789/format=webp;variant=thumbnail/diagram.webp"
 */
export function getStoragePath(
  assetPath: string,
  viewKey: string,
  slug: string,
  format: string,
): string {
  return join(assetPath, viewKey, `${slug}.${format}`);
}
