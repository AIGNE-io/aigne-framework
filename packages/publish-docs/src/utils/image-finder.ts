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
    } else {
      missingImages.push(src);
      let displaySrc: string;
      try {
        displaySrc = decodeURIComponent(src || "");
      } catch {
        displaySrc = src || "";
      }
      console.warn(`Image not found: ${displaySrc} (searched in multiple locations)`);
    }
  }

  return { foundPaths, missingImages };
}

/**
 * Find the actual file path for an image source
 */
export function findImagePath(imageSrc: string, options: ImageFinderOptions): string | null {
  const { mediaFolder, markdownFilePath } = options;

  // Try to decode URL-encoded characters, fallback to original if decoding fails
  let decodedImageSrc: string;
  try {
    decodedImageSrc = decodeURIComponent(imageSrc);
  } catch {
    console.warn(`Failed to decode image path: ${imageSrc}, using original`);
    decodedImageSrc = imageSrc;
  }

  // Try both decoded and original paths in case there are encoding issues
  const imageSourcesToTry = decodedImageSrc !== imageSrc ? [decodedImageSrc, imageSrc] : [imageSrc];

  for (const imageSource of imageSourcesToTry) {
    // If absolute path, check directly
    if (path.isAbsolute(imageSource)) {
      if (fs.existsSync(imageSource)) {
        return imageSource;
      }
      continue;
    }

    // Try multiple search paths for relative images
    const searchPaths = [
      // 1. Try with mediaFolder as base (if configured)
      mediaFolder ? path.resolve(mediaFolder, imageSource) : null,
      // 2. Try with current working directory as base
      path.resolve(process.cwd(), imageSource),
      // 3. Try with markdown file directory as base
      path.resolve(path.dirname(markdownFilePath), imageSource),
    ].filter(Boolean) as string[];

    // Find first existing path
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        return searchPath;
      }
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
