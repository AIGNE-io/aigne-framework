import { afterAll, afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { join } from "node:path";
import { mockModule } from "./mock-module.js";

// Mock dependencies first - must be before imports
const mockFindLocalImages = mock();
const mockUploadFiles = mock();
const mockIsRemoteUrl = mock();

const imageFinderMock = await mockModule(
  join(import.meta.dirname, "../src/utils/image-finder.js"),
  () => ({
    findLocalImages: mockFindLocalImages,
    isRemoteUrl: mockIsRemoteUrl,
  }),
);

const uploadFilesMock = await mockModule(
  join(import.meta.dirname, "../src/utils/upload-files.js"),
  () => ({
    uploadFiles: mockUploadFiles,
  }),
);

// Now import the module under test
import { Converter, type ConverterOptions } from "../src/converter/index.js";

afterAll(async () => {
  await imageFinderMock[Symbol.asyncDispose]();
  await uploadFilesMock[Symbol.asyncDispose]();
});

// Mock console methods
const originalConsoleWarn = console.warn;

describe("Converter", () => {
  beforeEach(() => {
    mockFindLocalImages.mockClear();
    mockUploadFiles.mockClear();
    mockIsRemoteUrl.mockClear();
    console.warn = mock();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  describe("constructor", () => {
    test("should initialize with default options", () => {
      const converter = new Converter();

      expect(converter.usedSlugs).toEqual({});
      expect(converter.blankFilePaths).toEqual([]);
    });

    test("should initialize with custom options", () => {
      const options: ConverterOptions = {
        slugPrefix: "custom",
        slugWithoutExt: false,
        uploadConfig: {
          appUrl: "https://example.com",
          accessToken: "token123",
          mediaFolder: "/media",
          concurrency: 3,
          cacheFilePath: "/cache.yml",
        },
      };

      const converter = new Converter(options);

      expect(converter.usedSlugs).toEqual({});
      expect(converter.blankFilePaths).toEqual([]);
    });
  });

  describe("markdownToLexical", () => {
    test("should extract title from frontmatter", async () => {
      const markdown = `---
title: Test Title
labels: [test, demo]
---

# Heading

Content here.`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBe("Heading");
      expect(result.labels).toEqual(["test", "demo"]);
      expect(result.content).toBeTruthy();
    });

    test("should extract title from H1 heading", async () => {
      const markdown = `# My Test Title

Some content here.`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBe("My Test Title");
      expect(result.content).toBeTruthy();
    });

    test("should handle markdown without title", async () => {
      const markdown = `Some content without a title.`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBeUndefined();
      expect(result.content).toBeTruthy();
    });

    test("should handle empty content and add to blank file paths", async () => {
      const markdown = `# Title Only`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBe("Title Only");
      expect(result.content).toBeNull();
      expect(converter.blankFilePaths).toContain("/test.md");
    });

    test("should handle whitespace-only content", async () => {
      const markdown = `# Title Only


      `;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBe("Title Only");
      expect(result.content).toBeNull();
      expect(converter.blankFilePaths).toContain("/test.md");
    });

    test("should handle frontmatter with non-array labels", async () => {
      const markdown = `---
labels: single-label
---

# Title

Content`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.labels).toBeUndefined();
    });

    test("should process mermaid code blocks", async () => {
      const markdown = `# Title

\`\`\`mermaid
graph TD
    A --> B
\`\`\``;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.content).toBeTruthy();
    });

    test("should handle markdown links with slug generation", async () => {
      // Mock process.env and process.cwd for consistent testing
      const originalEnv = process.env.DOC_ROOT_DIR;
      const originalCwd = process.cwd;

      process.env.DOC_ROOT_DIR = "/docs";
      // @ts-ignore
      process.cwd = () => "/project";

      try {
        const markdown = `# Title

[Link to another page](./other-page.md)
[Link with anchor](./other-page.md#section)`;

        const converter = new Converter({ slugPrefix: "prefix" });
        await converter.markdownToLexical(markdown, "/docs/test.md");

        expect(converter.usedSlugs).toHaveProperty("other-page");
        expect(converter.usedSlugs["other-page"]).toContain("/docs/test.md");
      } finally {
        process.env.DOC_ROOT_DIR = originalEnv;
        process.cwd = originalCwd;
      }
    });

    test("should not process external links", async () => {
      const markdown = `# Title

[External link](https://example.com)
[Protocol relative](//example.com)
[Mailto link](mailto:test@example.com)
[Hash link](#section)`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.content).toBeTruthy();
      expect(Object.keys(converter.usedSlugs)).toHaveLength(0);
    });

    test("should handle complex markdown with multiple elements", async () => {
      const markdown = `# Complex Document

## Heading 2

This is a paragraph with **bold** and *italic* text.

### Code Block

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

### List

- Item 1
- Item 2
  - Nested item

### Quote

> This is a quote

### Table

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

      const converter = new Converter();
      const result = await converter.markdownToLexical(markdown, "/test.md");

      expect(result.title).toBe("Complex Document");
      expect(result.content).toBeTruthy();
    });

    test("should process images when upload config is provided", async () => {
      const markdown = `# Title

![Local image](./image.jpg)
![Remote image](https://example.com/image.jpg)`;

      // Mock isRemoteUrl to identify local vs remote images
      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));

      mockFindLocalImages.mockReturnValue({
        foundPaths: new Map([["./image.jpg", "/full/path/image.jpg"]]),
        missingImages: [],
      });

      mockUploadFiles.mockResolvedValue({
        results: [
          {
            filePath: "/full/path/image.jpg",
            url: "https://cdn.example.com/uploaded-image.jpg",
          },
        ],
      });

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      expect(mockFindLocalImages).toHaveBeenCalledWith(["./image.jpg"], {
        mediaFolder: undefined,
        markdownFilePath: "/docs/test.md",
      });
      expect(mockUploadFiles).toHaveBeenCalled();
    });

    test("should handle upload failure gracefully", async () => {
      const markdown = `# Title

![Local image](./image.jpg)`;

      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));
      mockFindLocalImages.mockReturnValue({
        foundPaths: new Map([["./image.jpg", "/full/path/image.jpg"]]),
        missingImages: [],
      });

      // Create a promise that rejects to properly mock the upload failure
      const uploadError = new Error("Upload failed");
      mockUploadFiles.mockImplementation(() => Promise.reject(uploadError));

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to upload images for /docs/test.md:",
        uploadError,
      );
    });

    test("should handle no local images found", async () => {
      const markdown = `# Title

![Remote image](https://example.com/image.jpg)`;

      // Mock isRemoteUrl to return true for remote images
      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      // Since no local images are found, findLocalImages should not be called
      expect(mockFindLocalImages).not.toHaveBeenCalled();
      expect(mockUploadFiles).not.toHaveBeenCalled();
    });

    test("should warn when no uploaded URL found for image", async () => {
      const markdown = `# Title

![Local image](./image.jpg)`;

      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));
      mockFindLocalImages.mockReturnValue({
        foundPaths: new Map([["./image.jpg", "/full/path/image.jpg"]]),
        missingImages: [],
      });

      // Upload succeeds but returns no URL for this specific file
      mockUploadFiles.mockResolvedValue({
        results: [
          {
            filePath: "/different/path/image.jpg", // Different path
            url: "https://cdn.example.com/uploaded-image.jpg",
          },
        ],
      });

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      expect(console.warn).toHaveBeenCalledWith("No uploaded URL found for image: ./image.jpg");
    });

    test("should handle upload results with empty URLs", async () => {
      const markdown = `# Title

![Local image](./image.jpg)`;

      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));
      mockFindLocalImages.mockReturnValue({
        foundPaths: new Map([["./image.jpg", "/full/path/image.jpg"]]),
        missingImages: [],
      });

      mockUploadFiles.mockResolvedValue({
        results: [
          {
            filePath: "/full/path/image.jpg",
            url: "", // Empty URL
          },
        ],
      });

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      expect(console.warn).toHaveBeenCalledWith("No uploaded URL found for image: ./image.jpg");
    });

    test("should handle nested image nodes in content", async () => {
      const markdown = `# Title

> ![Nested image](./nested.jpg)

| ![Table image](./table.jpg) | Cell |
|------------------------------|------|`;

      mockIsRemoteUrl.mockImplementation((src: string) => src.startsWith("http"));
      mockFindLocalImages.mockReturnValue({
        foundPaths: new Map([
          ["./nested.jpg", "/full/path/nested.jpg"],
          ["./table.jpg", "/full/path/table.jpg"],
        ]),
        missingImages: [],
      });

      mockUploadFiles.mockResolvedValue({
        results: [
          {
            filePath: "/full/path/nested.jpg",
            url: "https://cdn.example.com/nested.jpg",
          },
          {
            filePath: "/full/path/table.jpg",
            url: "https://cdn.example.com/table.jpg",
          },
        ],
      });

      const converter = new Converter({
        uploadConfig: {
          appUrl: "https://app.example.com",
          accessToken: "token123",
        },
      });

      const result = await converter.markdownToLexical(markdown, "/docs/test.md");

      expect(result.content).toBeTruthy();
      expect(mockUploadFiles).toHaveBeenCalled();
    });
  });
});
