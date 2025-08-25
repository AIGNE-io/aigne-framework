import fs from "node:fs";
import path from "node:path";

export interface ImageFinderOptions {
  mediaFolder?: string;
  markdownFilePath: string;
}

export interface ImageSearchResult {
  foundPaths: Map<string, string>; // src -> actualPath
  missingImages: string[];
}

/**
 * Find local image files with multiple search strategies
 */
export function findLocalImages(
  imageSources: string[],
  options: ImageFinderOptions,
): ImageSearchResult {
  const foundPaths = new Map<string, string>();
  const missingImages: string[] = [];

  for (const src of imageSources) {
    const foundPath = findImagePath(src, options);

    if (foundPath) {
      foundPaths.set(src, foundPath);
      console.log(`Found image: ${src} -> ${foundPath}`);
    } else {
      missingImages.push(src);
      console.warn(`Image not found: ${src} (searched in multiple locations)`);
    }
  }

  return { foundPaths, missingImages };
}

/**
 * Find the actual file path for an image source
 */
export function findImagePath(imageSrc: string, options: ImageFinderOptions): string | null {
  const { mediaFolder, markdownFilePath } = options;

  // If absolute path, check directly
  if (path.isAbsolute(imageSrc)) {
    return fs.existsSync(imageSrc) ? imageSrc : null;
  }

  // Try multiple search paths for relative images
  const searchPaths = [
    // 1. Try with mediaFolder as base (if configured)
    mediaFolder ? path.resolve(mediaFolder, imageSrc) : null,
    // 2. Try with current working directory as base
    path.resolve(process.cwd(), imageSrc),
    // 3. Try with markdown file directory as base
    path.resolve(path.dirname(markdownFilePath), imageSrc),
  ].filter(Boolean) as string[];

  // Find first existing path
  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath;
    }
  }

  return null;
}

/**
 * Check if a URL is remote (http/https)
 */
export function isRemoteUrl(src: string): boolean {
  return /^https?:\/\//.test(src) || src.startsWith("//");
}

/**
 * Filter out remote URLs and return only local image sources
 */
export function filterLocalImages(imageSources: string[]): string[] {
  return imageSources.filter((src) => !isRemoteUrl(src));
}
