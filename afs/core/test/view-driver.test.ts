import { afterEach, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { AFS, type AFSDriver, type AFSEntry, type AFSModule, type View } from "../src/index.js";

// Mock translation driver
class MockI18nDriver implements AFSDriver {
  readonly name = "mock-i18n";
  readonly description = "Mock translation driver for testing";
  readonly capabilities = {
    dimensions: ["language" as const],
  };

  private translations: Record<string, Record<string, string>> = {
    en: {
      你好: "Hello",
      世界: "World",
      测试: "Test",
    },
    ja: {
      你好: "こんにちは",
      世界: "世界",
      测试: "テスト",
    },
  };

  canHandle(view: View): boolean {
    return !!view.language && Object.keys(view).length === 1;
  }

  async process(
    module: AFSModule,
    path: string,
    view: View,
    options: { sourceEntry: AFSEntry; metadata: any; context: any },
  ): Promise<{ data: AFSEntry; message?: string }> {
    const { sourceEntry } = options;
    const targetLang = view.language;
    if (!targetLang) {
      throw new Error("Language is required for translation");
    }

    // Simple mock translation: replace Chinese words with target language
    let translated = sourceEntry.content as string;
    const dict = this.translations[targetLang];

    if (dict) {
      Object.entries(dict).forEach(([zh, translation]) => {
        translated = translated.replace(new RegExp(zh, "g"), translation);
      });
    }

    // Simulate writing to .i18n/{lang}/ directory
    const storagePath = path.replace(/([^/]+)$/, `.i18n/${targetLang}/$1`);

    // Write to module storage
    await module.write?.(storagePath, { content: translated });

    return {
      data: {
        ...sourceEntry,
        content: translated,
        path,
        metadata: {
          ...sourceEntry.metadata,
          storagePath,
          view,
        },
      },
    };
  }
}

// Mock file system module
class MockFSModule implements AFSModule {
  readonly name = "mock-fs";
  private files = new Map<string, string>();

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
    payload: { content: string },
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

// Cleanup test database after each test
const testDbPath = ".afs-test";
afterEach(() => {
  try {
    rmSync(testDbPath, { recursive: true, force: true });
  } catch (_error) {
    // Ignore cleanup errors
  }
});

test("View driver: should translate content with view", async () => {
  const mockFS = new MockFSModule();
  const mockDriver = new MockI18nDriver();

  const afs = new AFS({
    modules: [mockFS],
    drivers: [mockDriver],
    storage: { url: testDbPath },
  });

  // Write source content (Chinese)
  await afs.write("/modules/mock-fs/test.md", {
    content: "你好，世界！这是一个测试。",
  });

  // Read English version (should trigger translation)
  const enResult = await afs.read("/modules/mock-fs/test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(enResult.data?.content).toBe("Hello，World！这是一个Test。");
  expect(enResult.data?.metadata?.view).toEqual({ language: "en" });

  // Read Japanese version
  const jaResult = await afs.read("/modules/mock-fs/test.md", {
    view: { language: "ja" },
    wait: "strict",
  });

  expect(jaResult.data?.content).toBe("こんにちは，世界！这是一个テスト。");
  expect(jaResult.data?.metadata?.view).toEqual({ language: "ja" });

  // Read source (no view) should return original
  const sourceResult = await afs.read("/modules/mock-fs/test.md");
  expect(sourceResult.data?.content).toBe("你好，世界！这是一个测试。");
});

test("View driver: should use cached view on second read", async () => {
  const mockFS = new MockFSModule();
  const mockDriver = new MockI18nDriver();

  // Track how many times driver.process is called
  let processCallCount = 0;
  const originalProcess = mockDriver.process.bind(mockDriver);
  mockDriver.process = async (...args) => {
    processCallCount++;
    return originalProcess(...args);
  };

  const afs = new AFS({
    modules: [mockFS],
    drivers: [mockDriver],
    storage: { url: `${testDbPath}/cache` },
  });

  await afs.write("/modules/mock-fs/cache-test.md", {
    content: "你好，世界！",
  });

  // First read: should trigger translation
  await afs.read("/modules/mock-fs/cache-test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(processCallCount).toBe(1);

  // Second read: should use cached view
  const cachedResult = await afs.read("/modules/mock-fs/cache-test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(processCallCount).toBe(1); // Still 1, not called again
  expect(cachedResult.data?.content).toBe("Hello，World！");
});

test("View driver: should invalidate cache when source changes", async () => {
  const mockFS = new MockFSModule();
  const mockDriver = new MockI18nDriver();

  let processCallCount = 0;
  const originalProcess = mockDriver.process.bind(mockDriver);
  mockDriver.process = async (...args) => {
    processCallCount++;
    return originalProcess(...args);
  };

  const afs = new AFS({
    modules: [mockFS],
    drivers: [mockDriver],
    storage: { url: `${testDbPath}/invalidate` },
  });

  // Write initial content
  await afs.write("/modules/mock-fs/invalidate-test.md", {
    content: "你好",
  });

  // Read English version (first translation)
  const firstRead = await afs.read("/modules/mock-fs/invalidate-test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(firstRead.data?.content).toBe("Hello");
  expect(processCallCount).toBe(1);

  // Update source content
  await afs.write("/modules/mock-fs/invalidate-test.md", {
    content: "你好，世界！",
  });

  // Read English version again (should re-translate)
  const secondRead = await afs.read("/modules/mock-fs/invalidate-test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(secondRead.data?.content).toBe("Hello，World！");
  expect(processCallCount).toBe(2); // Called again after source change
});

test("View driver: fallback mode should return source immediately", async () => {
  const mockFS = new MockFSModule();

  // Create a slow driver to test fallback behavior
  class SlowDriver extends MockI18nDriver {
    override async process(...args: Parameters<MockI18nDriver["process"]>) {
      // Simulate slow translation
      await new Promise((resolve) => setTimeout(resolve, 100));
      return super.process(...args);
    }
  }

  const slowDriver = new SlowDriver();

  const afs = new AFS({
    modules: [mockFS],
    drivers: [slowDriver],
    storage: { url: `${testDbPath}/fallback` },
  });

  await afs.write("/modules/mock-fs/fallback-test.md", {
    content: "你好，世界！",
  });

  // Use fallback mode: should return source immediately
  const fallbackResult = await afs.read("/modules/mock-fs/fallback-test.md", {
    view: { language: "en" },
    wait: "fallback",
  });

  // Should get source content immediately
  expect(fallbackResult.data?.content).toBe("你好，世界！");
  expect(fallbackResult.message).toContain("being processed in background");

  // Wait a bit for background processing
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Now read again with strict mode, should get translated version
  const strictResult = await afs.read("/modules/mock-fs/fallback-test.md", {
    view: { language: "en" },
    wait: "strict",
  });

  expect(strictResult.data?.content).toBe("Hello，World！");
});

test("View driver: prefetch should batch generate views", async () => {
  const mockFS = new MockFSModule();
  const mockDriver = new MockI18nDriver();

  let processCallCount = 0;
  const originalProcess = mockDriver.process.bind(mockDriver);
  mockDriver.process = async (...args) => {
    processCallCount++;
    return originalProcess(...args);
  };

  const afs = new AFS({
    modules: [mockFS],
    drivers: [mockDriver],
    storage: { url: `${testDbPath}/prefetch` },
  });

  // Create multiple files
  await afs.write("/modules/mock-fs/file1.md", { content: "你好" });
  await afs.write("/modules/mock-fs/file2.md", { content: "世界" });
  await afs.write("/modules/mock-fs/file3.md", { content: "测试" });

  // Prefetch English versions
  await afs.prefetch(
    ["/modules/mock-fs/file1.md", "/modules/mock-fs/file2.md", "/modules/mock-fs/file3.md"],
    { view: { language: "en" }, concurrency: 2 },
  );

  // All files should be translated
  expect(processCallCount).toBe(3);

  // Read should use cached versions
  const result1 = await afs.read("/modules/mock-fs/file1.md", {
    view: { language: "en" },
  });
  const result2 = await afs.read("/modules/mock-fs/file2.md", {
    view: { language: "en" },
  });
  const result3 = await afs.read("/modules/mock-fs/file3.md", {
    view: { language: "en" },
  });

  expect(result1.data?.content).toBe("Hello");
  expect(result2.data?.content).toBe("World");
  expect(result3.data?.content).toBe("Test");

  // Process count should still be 3 (no additional calls)
  expect(processCallCount).toBe(3);
});
