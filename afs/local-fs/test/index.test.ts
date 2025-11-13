import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalFS } from "@aigne/afs-local-fs";

let testDir: string;
let localFS: LocalFS;

beforeAll(async () => {
  // Create a temporary directory for testing
  testDir = join(tmpdir(), `system-fs-test-${Date.now()}`);
  await mkdir(testDir, { recursive: true });

  // Create test file structure
  await mkdir(join(testDir, "subdir"), { recursive: true });
  await mkdir(join(testDir, "subdir", "nested"), { recursive: true });

  await writeFile(join(testDir, "file1.txt"), "Hello World");
  await writeFile(join(testDir, "file2.md"), "# Test Markdown");
  await writeFile(join(testDir, "subdir", "file3.js"), 'console.log("test");');
  await writeFile(join(testDir, "subdir", "nested", "file4.json"), '{"test": true}');

  // Initialize SystemFS
  localFS = new LocalFS({ localPath: testDir });
});

afterAll(async () => {
  // Clean up test directory
  await rm(testDir, { recursive: true, force: true });
});

test("SystemFS should list files in the root directory (non-recursive)", async () => {
  const result = await localFS.list("");

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "file1.txt",
      "file2.md",
      "subdir",
    ]
  `);

  // Check metadata types
  const metadataTypes = result.list.map((entry) => ({
    path: entry.path,
    type: entry.metadata?.type,
  }));
  expect(metadataTypes.sort((a, b) => a.path.localeCompare(b.path))).toMatchInlineSnapshot(`
    [
      {
        "path": "file1.txt",
        "type": "file",
      },
      {
        "path": "file2.md",
        "type": "file",
      },
      {
        "path": "subdir",
        "type": "directory",
      },
    ]
  `);
});

test("SystemFS should list files recursively when recursive option is true", async () => {
  const result = await localFS.list("", { recursive: true });

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "file1.txt",
      "file2.md",
      "subdir",
      "subdir/file3.js",
      "subdir/nested",
      "subdir/nested/file4.json",
    ]
  `);
});

test("SystemFS should respect maxDepth option", async () => {
  const result = await localFS.list("", { recursive: true, maxDepth: 1 });

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "file1.txt",
      "file2.md",
      "subdir",
    ]
  `);
});

test("SystemFS should respect limit option", async () => {
  const result = await localFS.list("", { recursive: true, limit: 3 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(3);
});

test("SystemFS should list files in a subdirectory", async () => {
  const result = await localFS.list("subdir");

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "subdir/file3.js",
      "subdir/nested",
    ]
  `);
});

test("SystemFS should handle orderBy option", async () => {
  const result = await localFS.list("", {
    orderBy: [["path", "asc"]],
  });

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "file1.txt",
      "file2.md",
      "subdir",
    ]
  `);
});

// Read method tests
test("SystemFS should read a file and return content", async () => {
  const { result } = await localFS.read("file1.txt");

  expect(result).toBeDefined();
  expect(result?.path).toBe("file1.txt");
  expect(result?.content).toBe("Hello World");
  expect(result?.metadata?.type).toBe("file");
  expect(result?.metadata?.size).toBeGreaterThan(0);
});

test("SystemFS should read a directory without content", async () => {
  const { result } = await localFS.read("subdir");

  expect(result).toBeDefined();
  expect(result?.path).toBe("subdir");
  expect(result?.content).toBeUndefined();
  expect(result?.metadata?.type).toBe("directory");
});

test("SystemFS should read a nested file", async () => {
  const { result } = await localFS.read("subdir/file3.js");

  expect(result).toBeDefined();
  expect(result?.path).toBe("subdir/file3.js");
  expect(result?.content).toBe('console.log("test");');
  expect(result?.metadata?.type).toBe("file");
});

// Write method tests
test("SystemFS should write a new file", async () => {
  const entry = {
    content: "New file content",
    summary: "Test file",
    metadata: { custom: "value" },
  };

  const { result } = await localFS.write("newfile.txt", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("newfile.txt");
  expect(result.content).toBe("New file content");
  expect(result.summary).toBe("Test file");
  expect(result.metadata?.custom).toBe("value");
  expect(result.metadata?.type).toBe("file");
  expect(result.metadata?.size).toBeGreaterThan(0);
});

test("SystemFS should write a file with JSON content", async () => {
  const jsonData = { name: "test", value: 42 };
  const entry = {
    content: jsonData,
    summary: "JSON test file",
  };

  const { result } = await localFS.write("data.json", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("data.json");
  expect(result.content).toEqual(jsonData);
  expect(result.metadata?.type).toBe("file");

  // Verify the file was written with JSON formatting
  const { result: readResult } = await localFS.read("data.json");
  expect(readResult?.content).toBe(JSON.stringify(jsonData, null, 2));
});

test("SystemFS should write a file in a nested directory", async () => {
  const entry = {
    content: "Nested file content",
    metadata: { nested: true },
  };

  const { result } = await localFS.write("deep/nested/test.txt", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("deep/nested/test.txt");
  expect(result.content).toBe("Nested file content");
  expect(result.metadata?.nested).toBe(true);
  expect(result.metadata?.type).toBe("file");
});

test("SystemFS should overwrite existing file", async () => {
  const entry = {
    content: "Updated content",
    summary: "Updated file",
  };

  const { result } = await localFS.write("file1.txt", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("file1.txt");
  expect(result.content).toBe("Updated content");
  expect(result.summary).toBe("Updated file");

  // Verify the file was actually updated
  const { result: readResult } = await localFS.read("file1.txt");
  expect(readResult?.content).toBe("Updated content");
});

// Search method tests
test("SystemFS should search for text in files", async () => {
  // First update the content since it was overwritten in previous test
  await localFS.write("file1.txt", { content: "Hello World" });

  const result = await localFS.search("", "Hello");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBeGreaterThan(0);

  const foundFile = result.list.find((entry) => entry.path === "file1.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain("Hello");
});

test("SystemFS should search with regex pattern", async () => {
  const result = await localFS.search("", "console\\.log");

  expect(result.list).toBeDefined();

  const foundFile = result.list.find((entry) => entry.path.includes("file3.js"));
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain('console.log("test")');
});

test("SystemFS should search in specific directory", async () => {
  const result = await localFS.search("subdir", "test");

  expect(result.list).toBeDefined();

  const paths = result.list.map((entry) => entry.path);
  // All results should be within subdir
  paths.forEach((path) => {
    expect(path.startsWith("subdir/")).toBe(true);
  });
});

test("SystemFS should respect search limit option", async () => {
  const result = await localFS.search("", "test", { limit: 1 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(1);
});

test("SystemFS should return empty results for no matches", async () => {
  const result = await localFS.search("", "nonexistenttext123");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(0);
});

test("SystemFS should search in written files", async () => {
  // First write a file with searchable content
  await localFS.write("searchable.txt", {
    content: "This is searchable content with unique keyword",
  });

  const result = await localFS.search("", "unique keyword");

  expect(result.list).toBeDefined();
  const foundFile = result.list.find((entry) => entry.path === "searchable.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain("unique keyword");
});
