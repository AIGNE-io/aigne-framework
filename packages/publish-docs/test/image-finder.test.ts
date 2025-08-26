import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import path from "node:path";
import {
  filterLocalImages,
  findImagePath,
  findLocalImages,
  type ImageFinderOptions,
  type ImageSearchResult,
  isRemoteUrl,
} from "../src/utils/image-finder.js";

// Mock fs module
const mockExistsSync = mock();
mock.module("node:fs", () => ({
  default: {
    existsSync: mockExistsSync,
  },
  existsSync: mockExistsSync,
}));

// Mock console.warn to suppress warnings during tests
const originalConsoleWarn = console.warn;

describe("image-finder", () => {
  beforeEach(() => {
    mockExistsSync.mockClear();
    console.warn = mock();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  describe("isRemoteUrl", () => {
    test("should return true for http URLs", () => {
      expect(isRemoteUrl("http://example.com/image.jpg")).toBe(true);
    });

    test("should return true for https URLs", () => {
      expect(isRemoteUrl("https://example.com/image.jpg")).toBe(true);
    });

    test("should return true for protocol-relative URLs", () => {
      expect(isRemoteUrl("//example.com/image.jpg")).toBe(true);
    });

    test("should return false for relative paths", () => {
      expect(isRemoteUrl("./images/test.jpg")).toBe(false);
      expect(isRemoteUrl("../images/test.jpg")).toBe(false);
      expect(isRemoteUrl("images/test.jpg")).toBe(false);
    });

    test("should return false for absolute local paths", () => {
      expect(isRemoteUrl("/images/test.jpg")).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(isRemoteUrl("")).toBe(false);
    });
  });

  describe("filterLocalImages", () => {
    test("should filter out remote URLs and return only local images", () => {
      const imageSources = [
        "https://example.com/remote.jpg",
        "./local.jpg",
        "http://test.com/another.png",
        "../assets/image.svg",
        "//cdn.example.com/image.gif",
        "images/local.png",
      ];

      const result = filterLocalImages(imageSources);

      expect(result).toEqual(["./local.jpg", "../assets/image.svg", "images/local.png"]);
    });

    test("should return empty array when all images are remote", () => {
      const imageSources = [
        "https://example.com/remote.jpg",
        "http://test.com/another.png",
        "//cdn.example.com/image.gif",
      ];

      const result = filterLocalImages(imageSources);
      expect(result).toEqual([]);
    });

    test("should return all images when all are local", () => {
      const imageSources = ["./local.jpg", "../assets/image.svg", "images/local.png"];

      const result = filterLocalImages(imageSources);
      expect(result).toEqual(imageSources);
    });

    test("should handle empty array", () => {
      expect(filterLocalImages([])).toEqual([]);
    });
  });

  describe("findImagePath", () => {
    const options: ImageFinderOptions = {
      mediaFolder: "/media",
      markdownFilePath: "/docs/test.md",
    };

    test("should find absolute path when file exists", () => {
      const absolutePath = "/absolute/path/image.jpg";
      mockExistsSync.mockReturnValueOnce(true);

      const result = findImagePath(absolutePath, options);

      expect(result).toBe(absolutePath);
      expect(mockExistsSync).toHaveBeenCalledWith(absolutePath);
    });

    test("should return null for absolute path when file doesn't exist", () => {
      const absolutePath = "/absolute/path/image.jpg";
      mockExistsSync.mockReturnValueOnce(false);

      const result = findImagePath(absolutePath, options);

      expect(result).toBe(null);
    });

    test("should search in multiple paths for relative images", () => {
      const relativeImage = "images/test.jpg";
      // First two paths don't exist, third one does
      mockExistsSync
        .mockReturnValueOnce(false) // mediaFolder path
        .mockReturnValueOnce(false) // cwd path
        .mockReturnValueOnce(true); // markdown dir path

      const result = findImagePath(relativeImage, options);

      expect(result).toBe(path.resolve("/docs", relativeImage));
      expect(mockExistsSync).toHaveBeenCalledTimes(3);
    });

    test("should handle URL-encoded image paths", () => {
      const encodedImage = "images/test%20image.jpg";
      const decodedPath = path.resolve("/docs", "images/test image.jpg");

      mockExistsSync
        .mockReturnValueOnce(false) // mediaFolder with decoded
        .mockReturnValueOnce(false) // cwd with decoded
        .mockReturnValueOnce(true); // markdown dir with decoded

      const result = findImagePath(encodedImage, options);

      expect(result).toBe(decodedPath);
    });

    test("should fallback to original path when decoding fails", () => {
      const invalidEncodedImage = "images/test%ZZ.jpg";

      mockExistsSync
        .mockReturnValueOnce(false) // mediaFolder
        .mockReturnValueOnce(false) // cwd
        .mockReturnValueOnce(true); // markdown dir

      const result = findImagePath(invalidEncodedImage, options);

      expect(result).toBe(path.resolve("/docs", invalidEncodedImage));
      expect(console.warn).toHaveBeenCalledWith(
        `Failed to decode image path: ${invalidEncodedImage}, using original`,
      );
    });

    test("should try both decoded and original paths when they differ", () => {
      const encodedImage = "images/test%20image.jpg";

      // All decoded paths fail, but original path succeeds
      mockExistsSync
        .mockReturnValueOnce(false) // mediaFolder with decoded
        .mockReturnValueOnce(false) // cwd with decoded
        .mockReturnValueOnce(false) // markdown dir with decoded
        .mockReturnValueOnce(false) // mediaFolder with original
        .mockReturnValueOnce(false) // cwd with original
        .mockReturnValueOnce(true); // markdown dir with original

      const result = findImagePath(encodedImage, options);

      expect(result).toBe(path.resolve("/docs", encodedImage));
      expect(mockExistsSync).toHaveBeenCalledTimes(6);
    });

    test("should handle options without mediaFolder", () => {
      const optionsWithoutMedia: ImageFinderOptions = {
        markdownFilePath: "/docs/test.md",
      };
      const relativeImage = "images/test.jpg";

      mockExistsSync
        .mockReturnValueOnce(false) // cwd path
        .mockReturnValueOnce(true); // markdown dir path

      const result = findImagePath(relativeImage, optionsWithoutMedia);

      expect(result).toBe(path.resolve("/docs", relativeImage));
      expect(mockExistsSync).toHaveBeenCalledTimes(2);
    });

    test("should return null when no paths exist", () => {
      const relativeImage = "images/nonexistent.jpg";
      mockExistsSync.mockReturnValue(false);

      const result = findImagePath(relativeImage, options);

      expect(result).toBe(null);
    });
  });

  describe("findLocalImages", () => {
    const options: ImageFinderOptions = {
      mediaFolder: "/media",
      markdownFilePath: "/docs/test.md",
    };

    test("should find existing images and track missing ones", () => {
      const imageSources = ["image1.jpg", "image2.png", "missing.gif"];

      // image1.jpg exists, image2.png exists, missing.gif doesn't exist
      mockExistsSync
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true) // image1.jpg
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true) // image2.png
        .mockReturnValue(false); // missing.gif

      const result: ImageSearchResult = findLocalImages(imageSources, options);

      expect(result.foundPaths.size).toBe(2);
      expect(result.foundPaths.get("image1.jpg")).toBe(path.resolve("/docs", "image1.jpg"));
      expect(result.foundPaths.get("image2.png")).toBe(path.resolve(process.cwd(), "image2.png"));
      expect(result.missingImages).toEqual(["missing.gif"]);
      expect(console.warn).toHaveBeenCalledWith(
        "Image not found: missing.gif (searched in all configured locations)",
      );
    });

    test("should handle empty image sources", () => {
      const result: ImageSearchResult = findLocalImages([], options);

      expect(result.foundPaths.size).toBe(0);
      expect(result.missingImages).toEqual([]);
    });

    test("should handle all missing images", () => {
      const imageSources = ["missing1.jpg", "missing2.png"];
      mockExistsSync.mockReturnValue(false);

      const result: ImageSearchResult = findLocalImages(imageSources, options);

      expect(result.foundPaths.size).toBe(0);
      expect(result.missingImages).toEqual(["missing1.jpg", "missing2.png"]);
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    test("should handle all found images", () => {
      const imageSources = ["image1.jpg", "image2.png"];

      // Both images exist in markdown directory
      mockExistsSync
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true) // image1.jpg
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true); // image2.png

      const result: ImageSearchResult = findLocalImages(imageSources, options);

      expect(result.foundPaths.size).toBe(2);
      expect(result.missingImages).toEqual([]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    test("should handle URL-encoded image sources in warning", () => {
      const imageSources = ["missing%20image.jpg"];
      mockExistsSync.mockReturnValue(false);

      const result: ImageSearchResult = findLocalImages(imageSources, options);

      expect(result.missingImages).toEqual(["missing%20image.jpg"]);
      expect(console.warn).toHaveBeenCalledWith(
        "Image not found: missing image.jpg (searched in all configured locations)",
      );
    });

    test("should handle malformed URL encoding in warning", () => {
      const imageSources = ["missing%ZZ.jpg"];
      mockExistsSync.mockReturnValue(false);

      const result: ImageSearchResult = findLocalImages(imageSources, options);

      expect(result.missingImages).toEqual(["missing%ZZ.jpg"]);
      // The warning should show the original string since decoding fails
      expect(console.warn).toHaveBeenCalledWith(
        "Image not found: missing%ZZ.jpg (searched in all configured locations)",
      );
    });
  });
});
