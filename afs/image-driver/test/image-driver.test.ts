import { afterEach, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { rmSync } from "node:fs";
import { AFS, type AFSEntry, type AFSModule } from "@aigne/afs";
import { ImageAgent } from "@aigne/core";
import { GeminiImageModel } from "@aigne/gemini";
import { AIGNE } from "@aigne/core";
import {
  DEFAULT_IMAGE_GENERATION_INSTRUCTIONS,
  getStoragePath,
  ImageGenerateDriver,
  imageGenerationInputSchema,
} from "@aigne/afs-image-driver";

// Cleanup test database after each test
const testDbPath = ".afs-test";
afterEach(() => {
  try {
    rmSync(testDbPath, { recursive: true, force: true });
  } catch (_error) {
    // Ignore cleanup errors
  }
});

// Mock file system module
class MockFSModule implements AFSModule {
  readonly name = "mock-fs";
  private files = new Map<string, string | Buffer>();

  constructor(public options: { context: any }) {}

  async read(path: string): Promise<{ data?: AFSEntry; message?: string }> {
    const content = this.files.get(path);
    if (!content) {
      return { data: undefined, message: "File not found" };
    }

    return {
      data: {
        id: path,
        path,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  async write(
    path: string,
    payload: { content: string | Buffer },
  ): Promise<{ data: AFSEntry; message?: string }> {
    this.files.set(path, payload.content);

    return {
      data: {
        id: path,
        path,
        content: payload.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  async delete(path: string): Promise<{ message?: string }> {
    this.files.delete(path);
    return {};
  }
}

// Mock image generation agent
function createMockImageGenerationAgent() {
  const imageModel = new GeminiImageModel({
    apiKey: "mock-api-key",
    model: "gemini-2.5-flash",
  });

  // Mock the process method to return a fake base64 image
  const processSpy = spyOn(imageModel, "process").mockResolvedValue({
    images: [
      {
        type: "file" as const,
        data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 transparent PNG
        mimeType: "image/png",
      },
    ],
    usage: {
      inputTokens: 10,
      outputTokens: 20,
    },
    model: "gemini-2.5-flash",
  });

  const agent = ImageAgent.from({
    name: "mock_image_generator",
    description: "Mock image generation agent for testing",
    instructions: DEFAULT_IMAGE_GENERATION_INSTRUCTIONS,
    inputSchema: imageGenerationInputSchema,
    outputFileType: "file",
  });

  // Set the image model
  (agent as any).imageModel = imageModel;

  return { agent, imageModel, processSpy };
}

test("getStoragePath should generate correct image storage path with slug", () => {
  expect(getStoragePath(".afs/images/by-intent/abc123", "format=png", "company-logo", "png")).toBe(
    ".afs/images/by-intent/abc123/format=png/company-logo.png",
  );

  expect(
    getStoragePath(".afs/images/by-intent/xyz789", "format=webp;variant=thumbnail", "diagram", "webp"),
  ).toBe(".afs/images/by-intent/xyz789/format=webp;variant=thumbnail/diagram.webp");
});

test("ImageGenerateDriver.canHandle should return true for format-only views", () => {
  const driver = new ImageGenerateDriver();

  // Should handle png format only
  expect(driver.canHandle({ format: "png" })).toBe(true);

  // Should not handle other formats in Phase 2
  expect(driver.canHandle({ format: "webp" })).toBe(false);
  expect(driver.canHandle({ format: "jpg" })).toBe(false);

  // Should not handle empty view
  expect(driver.canHandle({})).toBe(false);

  // Should not handle views with other dimensions (Phase 2 restriction)
  expect(driver.canHandle({ format: "png", language: "en" })).toBe(false);
  expect(driver.canHandle({ format: "png", variant: "thumbnail" })).toBe(false);
});

test("ImageGenerateDriver should generate image with mock agent", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent, processSpy } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/image-driver-test" },
  });

  // Write document with image slot
  await afs.write("/modules/mock-fs/intro.md", {
    content: `# Introduction

This is a test document.

<!-- afs:image id="diagram" desc="system architecture diagram" -->

More content here.`,
  });

  // Read the generated image (should trigger generation)
  // Note: path is relative to module, not with /modules/mock-fs prefix
  const imageResult = await afs.read("/modules/mock-fs/.afs/images/by-intent/2f101b8d45f157d1", {
    view: { format: "png" },
    wait: "strict",
    context,
  });

  // Verify image was generated
  expect(imageResult.data?.content).toBeInstanceOf(Buffer);
  expect(imageResult.data?.metadata?.view).toEqual({ format: "png" });
  expect(imageResult.data?.metadata?.mimeType).toBe("image/png");

  // Verify the mock image model was called with correct prompt
  expect(processSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      prompt: expect.stringContaining("system architecture diagram"),
      outputFileType: "file",
    }),
    expect.anything(),
  );
});

test("ImageGenerateDriver should use owner document context", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent, processSpy } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/image-context-test" },
  });

  const ownerContent = `# Product Documentation

Our product is a cloud-based AI platform.

<!-- afs:image id="logo" desc="company logo" -->

Key features include ML, NLP, and computer vision.`;

  // Write document with image slot
  await afs.write("/modules/mock-fs/product.md", {
    content: ownerContent,
  });

  // Read the generated image
  await afs.read("/modules/mock-fs/.afs/images/by-intent/d2b2787a39359f32", {
    view: { format: "png" },
    wait: "strict",
    context,
  });

  // Verify the mock image model was called with both description and context
  expect(processSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      prompt: expect.stringContaining("company logo"),
    }),
    expect.anything(),
  );

  // The prompt should contain owner document context
  const callArgs = (processSpy as any).mock.calls[0][0];
  expect(callArgs.prompt).toContain("cloud-based AI platform");
});

test("ImageGenerateDriver should record dependency on owner document", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/image-deps-test" },
  });

  // Write document with slot
  await afs.write("/modules/mock-fs/guide.md", {
    content: `# Guide\n\n<!-- afs:image id="flow" desc="user flow diagram" -->`,
  });

  // Generate image
  await afs.read("/modules/mock-fs/.afs/images/by-intent/75f99bc454c630b4", {
    view: { format: "png" },
    wait: "strict",
    context,
  });

  // Verify dependency was recorded
  const metadataStore = (afs as any).metadataStore;
  const deps = await metadataStore.listDependenciesByOutput(
    "mock-fs",
    "/.afs/images/by-intent/75f99bc454c630b4",
    "format=png",
  );

  expect(deps.length).toBe(1);
  expect(deps[0].inPath).toBe("/guide.md"); // Path is relative to module
  expect(deps[0].role).toBe("owner-context");
});

test("ImageGenerateDriver should throw error if slot not found", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/image-no-slot-test" },
  });

  // Try to read image without creating a slot first
  // This will fail at ViewProcessor level (no source_metadata for this path)
  await expect(
    afs.read("/modules/mock-fs/.afs/images/by-intent/nonexistent", {
      view: { format: "png" },
      wait: "strict",
      context,
    }),
  ).rejects.toThrow("Source file not found");
});

test("ImageGenerateDriver should throw error if context is missing", async () => {
  const mockFS = new MockFSModule({ context: null });
  const { agent: mockAgent } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  await mockFS.write("/test.md", { content: "content" });
  const source = await mockFS.read("/test.md");
  assert(source.data, "source.data should be defined");

  await expect(
    driver.process(
      mockFS,
      ".afs/images/by-intent/test",
      { format: "png" },
      {
        sourceEntry: source.data,
        metadata: {},
        // no context provided
      },
    ),
  ).rejects.toThrow("Context is required for image generation");
});

test("SlotScanner should generate slug from description", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/slug-test" },
  });

  // Write document with descriptive slot
  await afs.write("/modules/mock-fs/doc.md", {
    content: `# Document\n\n<!-- afs:image id="hero" desc="system architecture diagram" -->`,
  });

  // Get slot metadata
  const slot = await afs.getSlot("/modules/mock-fs/doc.md", "hero");
  expect(slot).toBeDefined();
  expect(slot?.slug).toBe("system-architecture-diagram");
  expect(slot?.desc).toBe("system architecture diagram");
});

test("AFS helper methods should work correctly", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const { agent: mockAgent } = createMockImageGenerationAgent();

  const driver = new ImageGenerateDriver({
    imageGenerationAgent: mockAgent,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/helper-test" },
  });

  const docContent = `# Product Guide

This is our product.

<!-- afs:image id="logo" desc="company logo" -->

End of document.`;

  // Write document
  await afs.write("/modules/mock-fs/product.md", { content: docContent });

  // Test getSlot
  const slot = await afs.getSlot("/modules/mock-fs/product.md", "logo");
  expect(slot).toBeDefined();
  expect(slot?.slotId).toBe("logo");
  expect(slot?.desc).toBe("company logo");
  expect(slot?.slug).toBe("company-logo");

  // Test getImageBySlot
  const imageResult = await afs.getImageBySlot("/modules/mock-fs/product.md", "logo", {
    view: { format: "png" },
    wait: "strict",
    context,
  });
  expect(imageResult.data?.content).toBeInstanceOf(Buffer);

  // Test renderSlots
  const rendered = await afs.renderSlots("/modules/mock-fs/product.md", docContent, {
    view: { format: "png" },
  });
  expect(rendered).toContain("![company logo](/.afs/images/by-intent/");
  expect(rendered).toContain("/format=png/company-logo.png)");
  expect(rendered).not.toContain("<!-- afs:image");
});
