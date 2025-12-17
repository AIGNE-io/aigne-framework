import { afterEach, expect, test } from "bun:test";
import assert from "node:assert";
import { rmSync } from "node:fs";
import { AFS, type AFSEntry, type AFSModule } from "@aigne/afs";
import { getStoragePath, I18nDriver } from "@aigne/afs-i18n-driver";
import { AIGNE, FunctionAgent } from "@aigne/core";

// Cleanup test database after each test
const testDbPath = ".afs-test";
afterEach(() => {
  try {
    rmSync(testDbPath, { recursive: true, force: true });
  } catch (_error) {
    // Ignore cleanup errors
  }
});

// Mock file system module with context
class MockFSModule implements AFSModule {
  readonly name = "mock-fs";
  private files = new Map<string, string>();

  constructor(public options: { context: any }) {}

  async read(path: string): Promise<{ result?: AFSEntry; message?: string }> {
    const content = this.files.get(path);
    if (!content) {
      return { result: undefined, message: "File not found" };
    }

    return {
      result: {
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
    payload: { content: string },
  ): Promise<{ result: AFSEntry; message?: string }> {
    this.files.set(path, payload.content);

    return {
      result: {
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

// Mock translation agent
function createMockTranslationAgent() {
  const translations: Record<string, Record<string, string>> = {
    en: {
      你好: "Hello",
      世界: "World",
      测试: "Test",
      这是一个: "This is a",
    },
    ja: {
      你好: "こんにちは",
      世界: "世界",
      测试: "テスト",
      这是一个: "これは",
    },
  };

  return FunctionAgent.from({
    name: "mock_translator",
    description: "Mock translation agent for testing",
    process: ({ content, targetLanguage }: { content: string; targetLanguage: string }) => {
      let translated = content;
      const dict = translations[targetLanguage];

      if (dict) {
        Object.entries(dict).forEach(([zh, translation]) => {
          translated = translated.replaceAll(zh, translation);
        });
      }

      return { translatedContent: translated };
    },
  });
}

test("getStoragePath should prepend .i18n/{language}/ to path", () => {
  // Relative paths: .i18n/{lang}/original/path
  expect(getStoragePath("docs/intro.md", "en")).toBe(".i18n/en/docs/intro.md");
  expect(getStoragePath("docs/guide/setup.md", "ja")).toBe(".i18n/ja/docs/guide/setup.md");

  // Absolute paths: /.i18n/{lang}/original/path
  expect(getStoragePath("/docs/intro.md", "en")).toBe("/.i18n/en/docs/intro.md");
  expect(getStoragePath("/docs/guide/setup.md", "ja")).toBe("/.i18n/ja/docs/guide/setup.md");
  expect(getStoragePath("/intro.md", "ko")).toBe("/.i18n/ko/intro.md");
});

test("getStoragePath should support custom template", () => {
  expect(getStoragePath("docs/intro.md", "en", "translations/{language}")).toBe(
    "translations/en/docs/intro.md",
  );
  expect(getStoragePath("/docs/intro.md", "en", "i18n/{language}")).toBe("/i18n/en/docs/intro.md");
});

test("I18nDriver.canHandle should return true for language-only views", () => {
  const driver = new I18nDriver();

  expect(driver.canHandle({ language: "en" })).toBe(true);
  expect(driver.canHandle({ language: "ja" })).toBe(true);
  expect(driver.canHandle({})).toBe(false);
  // @ts-expect-error - testing invalid view
  expect(driver.canHandle({ language: "en", format: "html" })).toBe(false);
});

test("I18nDriver.canHandle should check supportedLanguages", () => {
  const driver = new I18nDriver({
    supportedLanguages: ["en", "ja"],
  });

  expect(driver.canHandle({ language: "en" })).toBe(true);
  expect(driver.canHandle({ language: "ja" })).toBe(true);
  expect(driver.canHandle({ language: "ko" })).toBe(false);
});

test("I18nDriver should translate content using context", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const mockTranslator = createMockTranslationAgent();

  const driver = new I18nDriver({
    defaultSourceLanguage: "zh",
    translationAgent: mockTranslator,
  });

  // Write source file
  await mockFS.write("/test.md", { content: "你好，世界！这是一个测试。" });

  // Read source
  const source = await mockFS.read("/test.md");
  assert(source.result, "source.result should be defined");

  // Process translation (context is passed via options)
  const result = await driver.process(
    mockFS,
    "/test.md",
    { language: "en" },
    {
      sourceEntry: source.result,
      metadata: {},
      context,
    },
  );

  expect(result.result.content).toBe("Hello，World！This is aTest。");
  expect(result.result.metadata?.storagePath).toBe("/.i18n/en/test.md"); // root-level file
  expect(result.result.metadata?.view).toEqual({ language: "en" });
});

test("I18nDriver should integrate with AFS", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const mockTranslator = createMockTranslationAgent();

  const driver = new I18nDriver({
    defaultSourceLanguage: "zh",
    translationAgent: mockTranslator,
  });

  const afs = new AFS({
    modules: [mockFS],
    drivers: [driver],
    storage: { url: ".afs-test/i18n-test" },
  });

  // Write source content (Chinese)
  await afs.write("/modules/mock-fs/doc.md", {
    content: "你好，世界！",
  });

  // Read English version (should trigger translation, context is passed via options)
  const enResult = await afs.read("/modules/mock-fs/doc.md", {
    view: { language: "en" },
    wait: "strict",
    context,
  });

  expect(enResult.result?.content).toBe("Hello，World！");
  expect(enResult.result?.metadata?.view).toEqual({ language: "en" });

  // Read Japanese version
  const jaResult = await afs.read("/modules/mock-fs/doc.md", {
    view: { language: "ja" },
    wait: "strict",
    context,
  });

  expect(jaResult.result?.content).toBe("こんにちは，世界！");

  // Read source (no view) should return original
  const sourceResult = await afs.read("/modules/mock-fs/doc.md");
  expect(sourceResult.result?.content).toBe("你好，世界！");
});

test("I18nDriver should throw error if language is missing", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const mockTranslator = createMockTranslationAgent();

  const driver = new I18nDriver({
    translationAgent: mockTranslator,
  });

  await mockFS.write("/test.md", { content: "test content" });
  const source = await mockFS.read("/test.md");
  assert(source.result, "source.result should be defined");

  await expect(
    driver.process(
      mockFS,
      "/test.md",
      {},
      {
        sourceEntry: source.result,
        metadata: {},
        context,
      },
    ),
  ).rejects.toThrow("Language is required for translation");
});

test("I18nDriver should throw error if context is missing", async () => {
  const aigne = new AIGNE();
  const context = aigne.newContext();

  const mockFS = new MockFSModule({ context });
  const mockTranslator = createMockTranslationAgent();

  const driver = new I18nDriver({
    translationAgent: mockTranslator,
  });

  await mockFS.write("/test.md", { content: "test content" });
  const source = await mockFS.read("/test.md");
  assert(source.result, "source.result should be defined");

  await expect(
    driver.process(
      mockFS,
      "/test.md",
      { language: "en" },
      {
        sourceEntry: source.result,
        metadata: {},
        // no context provided
      },
    ),
  ).rejects.toThrow("Context is required for translation");
});
