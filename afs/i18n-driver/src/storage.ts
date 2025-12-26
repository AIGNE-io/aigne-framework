import { join } from "node:path";

/**
 * Get storage path for a translated file
 * Prepends .i18n/{language}/ to the original path
 *
 * @param path - Source file path (subpath from AFS module)
 * @param language - Target language code
 * @param template - Storage path template (default: ".i18n/{language}")
 * @returns Physical storage path for the translated file
 *
 * @example
 * getStoragePath("/docs/guide/setup.md", "en")
 * // Returns: "/.i18n/en/docs/guide/setup.md"
 *
 * getStoragePath("/intro.md", "ja")
 * // Returns: "/.i18n/ja/intro.md"
 *
 * getStoragePath("docs/intro.md", "en")
 * // Returns: ".i18n/en/docs/intro.md"
 */
export function getStoragePath(path: string, language: string, template?: string): string {
  // Handle absolute paths (starting with /)
  const isAbsolute = path.startsWith("/");
  const normalizedPath = isAbsolute ? path.slice(1) : path;

  // Build the i18n directory name
  const i18nDir = template ? template.replace("{language}", language) : `.i18n/${language}`;

  // Prepend i18n directory to the path
  const storagePath = join(i18nDir, normalizedPath);

  return isAbsolute ? `/${storagePath}` : storagePath;
}
