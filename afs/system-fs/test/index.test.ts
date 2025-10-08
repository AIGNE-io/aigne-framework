import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SystemFS } from "@aigne/afs-system-fs";

let testDir: string;
let systemFS: SystemFS;

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
  systemFS = new SystemFS({ mount: "/test", path: testDir });
});

afterAll(async () => {
  // Clean up test directory
  await rm(testDir, { recursive: true, force: true });
});

test("SystemFS should list files in the root directory (non-recursive)", async () => {
  const result = await systemFS.list("");

  const paths = result.list.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "file2.md",
      "subdir",
      "file1.txt",
    ]
  `);

  // Check metadata types
  const metadataTypes = result.list.map((entry) => ({
    path: entry.path,
    type: entry.metadata?.type,
  }));
  expect(metadataTypes).toMatchInlineSnapshot(`
    [
      {
        "path": "file2.md",
        "type": "file",
      },
      {
        "path": "subdir",
        "type": "directory",
      },
      {
        "path": "file1.txt",
        "type": "file",
      },
    ]
  `);
});

test("SystemFS should list files recursively when recursive option is true", async () => {
  const result = await systemFS.list("", { recursive: true });

  const paths = result.list.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "file2.md",
      "subdir",
      "file1.txt",
      "subdir/nested",
      "subdir/file3.js",
      "subdir/nested/file4.json",
    ]
  `);
});

test("SystemFS should respect maxDepth option", async () => {
  const result = await systemFS.list("", { recursive: true, maxDepth: 1 });

  const paths = result.list.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "file2.md",
      "subdir",
      "file1.txt",
    ]
  `);
});

test("SystemFS should respect limit option", async () => {
  const result = await systemFS.list("", { recursive: true, limit: 3 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(3);
});

test("SystemFS should list files in a subdirectory", async () => {
  const result = await systemFS.list("subdir");

  const paths = result.list.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "subdir/nested",
      "subdir/file3.js",
    ]
  `);
});

test("SystemFS should handle orderBy option", async () => {
  const result = await systemFS.list("", {
    orderBy: [["path", "asc"]],
  });

  const paths = result.list.map((entry) => entry.path);
  expect(paths).toMatchInlineSnapshot(`
    [
      "file2.md",
      "subdir",
      "file1.txt",
    ]
  `);
});

// Read method tests
test("SystemFS should read a file and return content", async () => {
  const result = await systemFS.read("file1.txt");

  expect(result).toBeDefined();
  expect(result?.path).toBe("file1.txt");
  expect(result?.content).toBe("Hello World");
  expect(result?.metadata?.type).toBe("file");
  expect(result?.metadata?.size).toBeGreaterThan(0);
});

test("SystemFS should read a directory without content", async () => {
  const result = await systemFS.read("subdir");

  expect(result).toBeDefined();
  expect(result?.path).toBe("subdir");
  expect(result?.content).toBeUndefined();
  expect(result?.metadata?.type).toBe("directory");
});

test("SystemFS should read a nested file", async () => {
  const result = await systemFS.read("subdir/file3.js");

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

  const result = await systemFS.write("newfile.txt", entry);

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

  const result = await systemFS.write("data.json", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("data.json");
  expect(result.content).toEqual(jsonData);
  expect(result.metadata?.type).toBe("file");

  // Verify the file was written with JSON formatting
  const readResult = await systemFS.read("data.json");
  expect(readResult?.content).toBe(JSON.stringify(jsonData, null, 2));
});

test("SystemFS should write a file in a nested directory", async () => {
  const entry = {
    content: "Nested file content",
    metadata: { nested: true },
  };

  const result = await systemFS.write("deep/nested/test.txt", entry);

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

  const result = await systemFS.write("file1.txt", entry);

  expect(result).toBeDefined();
  expect(result.path).toBe("file1.txt");
  expect(result.content).toBe("Updated content");
  expect(result.summary).toBe("Updated file");

  // Verify the file was actually updated
  const readResult = await systemFS.read("file1.txt");
  expect(readResult?.content).toBe("Updated content");
});

// Search method tests
test("SystemFS should search for text in files", async () => {
  // First update the content since it was overwritten in previous test
  await systemFS.write("file1.txt", { content: "Hello World" });

  const result = await systemFS.search("", "Hello");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBeGreaterThan(0);

  const foundFile = result.list.find((entry) => entry.path === "file1.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.content).toContain("Hello");
});

test("SystemFS should search with regex pattern", async () => {
  const result = await systemFS.search("", "console\\.log");

  expect(result.list).toBeDefined();

  const foundFile = result.list.find((entry) => entry.path.includes("file3.js"));
  expect(foundFile).toBeDefined();
  expect(foundFile?.content).toContain('console.log("test")');
});

test("SystemFS should search in specific directory", async () => {
  const result = await systemFS.search("subdir", "test");

  expect(result.list).toBeDefined();

  const paths = result.list.map((entry) => entry.path);
  // All results should be within subdir
  paths.forEach((path) => {
    expect(path.startsWith("subdir/")).toBe(true);
  });
});

test("SystemFS should respect search limit option", async () => {
  const result = await systemFS.search("", "test", { limit: 1 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(1);
});

test("SystemFS should return empty results for no matches", async () => {
  const result = await systemFS.search("", "nonexistenttext123");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(0);
});

test("SystemFS should search in written files", async () => {
  // First write a file with searchable content
  await systemFS.write("searchable.txt", {
    content: "This is searchable content with unique keyword",
  });

  const result = await systemFS.search("", "unique keyword");

  expect(result.list).toBeDefined();
  const foundFile = result.list.find((entry) => entry.path === "searchable.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.content).toContain("unique keyword");
});
