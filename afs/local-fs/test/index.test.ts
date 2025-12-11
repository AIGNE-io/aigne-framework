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

  // Initialize LocalFS
  localFS = new LocalFS({ localPath: testDir });
});

afterAll(async () => {
  // Clean up test directory
  await rm(testDir, { recursive: true, force: true });
});

test("LocalFS should list files in the root directory (non-recursive)", async () => {
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

test("LocalFS should list files recursively when recursive option is true", async () => {
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

test("LocalFS should respect maxDepth option", async () => {
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

test("LocalFS should respect limit option", async () => {
  const result = await localFS.list("", { recursive: true, limit: 3 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(3);
});

test("LocalFS should list files in a subdirectory", async () => {
  const result = await localFS.list("subdir");

  const paths = result.list.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "subdir/file3.js",
      "subdir/nested",
    ]
  `);
});

test("LocalFS should handle orderBy option", async () => {
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
test("LocalFS should read a file and return content", async () => {
  const { result } = await localFS.read("file1.txt");

  expect(result).toBeDefined();
  expect(result?.path).toBe("file1.txt");
  expect(result?.content).toBe("Hello World");
  expect(result?.metadata?.type).toBe("file");
  expect(result?.metadata?.size).toBeGreaterThan(0);
});

test("LocalFS should read a directory without content", async () => {
  const { result } = await localFS.read("subdir");

  expect(result).toBeDefined();
  expect(result?.path).toBe("subdir");
  expect(result?.content).toBeUndefined();
  expect(result?.metadata?.type).toBe("directory");
});

test("LocalFS should read a nested file", async () => {
  const { result } = await localFS.read("subdir/file3.js");

  expect(result).toBeDefined();
  expect(result?.path).toBe("subdir/file3.js");
  expect(result?.content).toBe('console.log("test");');
  expect(result?.metadata?.type).toBe("file");
});

// Write method tests
test("LocalFS should write a new file", async () => {
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

test("LocalFS should write a file with JSON content", async () => {
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

test("LocalFS should write a file in a nested directory", async () => {
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

test("LocalFS should overwrite existing file", async () => {
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
test("LocalFS should search for text in files", async () => {
  // First update the content since it was overwritten in previous test
  await localFS.write("file1.txt", { content: "Hello World" });

  const result = await localFS.search("", "Hello");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBeGreaterThan(0);

  const foundFile = result.list.find((entry) => entry.path === "file1.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain("Hello");
});

test("LocalFS should search with regex pattern", async () => {
  const result = await localFS.search("", "console\\.log");

  expect(result.list).toBeDefined();

  const foundFile = result.list.find((entry) => entry.path.includes("file3.js"));
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain('console.log("test")');
});

test("LocalFS should search in specific directory", async () => {
  const result = await localFS.search("subdir", "test");

  expect(result.list).toBeDefined();

  const paths = result.list.map((entry) => entry.path);
  // All results should be within subdir
  paths.forEach((path) => {
    expect(path.startsWith("subdir/")).toBe(true);
  });
});

test("LocalFS should respect search limit option", async () => {
  const result = await localFS.search("", "test", { limit: 1 });

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(1);
});

test("LocalFS should return empty results for no matches", async () => {
  const result = await localFS.search("", "nonexistenttext123");

  expect(result.list).toBeDefined();
  expect(result.list.length).toBe(0);
});

test("LocalFS should search in written files", async () => {
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

test("LocalFS should handle search with case sensitive option (default false)", async () => {
  // First write a file with mixed case content
  await localFS.write("caseTest.txt", {
    content: "Case Sensitive Content",
  });

  // Search with caseSensitive: false (default)
  let result = await localFS.search("", "case sensitive");
  expect(result.list).toBeDefined();
  let foundFile = result.list.find((entry) => entry.path === "caseTest.txt");
  expect(foundFile).toBeDefined();

  // Search with caseSensitive: true
  result = await localFS.search("", "case sensitive", { caseSensitive: true });
  expect(result.list).toBeDefined();
  foundFile = result.list.find((entry) => entry.path === "caseTest.txt");
  expect(foundFile).toBeUndefined();

  // Search with exact case
  result = await localFS.search("", "Case Sensitive", { caseSensitive: true });
  expect(result.list).toBeDefined();
  foundFile = result.list.find((entry) => entry.path === "caseTest.txt");
  expect(foundFile).toBeDefined();
});

// Delete method tests
test("LocalFS should delete a file successfully", async () => {
  // Create a test file first
  await localFS.write("toDelete.txt", { content: "This file will be deleted" });

  // Delete the file
  const result = await localFS.delete("toDelete.txt");
  expect(result.message).toBe("Successfully deleted: toDelete.txt");

  // Verify file no longer exists
  const listResult = await localFS.list("");
  const deletedFile = listResult.list.find((entry) => entry.path === "toDelete.txt");
  expect(deletedFile).toBeUndefined();
});

test("LocalFS should delete a directory with recursive option", async () => {
  // Create a test directory with files
  await localFS.write("deleteDir/file1.txt", { content: "File 1" });
  await localFS.write("deleteDir/file2.txt", { content: "File 2" });

  // Delete the directory recursively
  const result = await localFS.delete("deleteDir", { recursive: true });
  expect(result.message).toBe("Successfully deleted: deleteDir");

  // Verify directory no longer exists
  const listResult = await localFS.list("");
  const deletedDir = listResult.list.find((entry) => entry.path === "deleteDir");
  expect(deletedDir).toBeUndefined();
});

test("LocalFS should throw error when deleting directory without recursive option", async () => {
  // Create a test directory
  await localFS.write("nonRecursiveDir/file.txt", { content: "Test" });

  // Try to delete without recursive option
  expect(localFS.delete("nonRecursiveDir")).rejects.toThrow(
    "Cannot delete directory 'nonRecursiveDir' without recursive option",
  );

  // Verify directory still exists
  const listResult = await localFS.list("");
  const existingDir = listResult.list.find((entry) => entry.path === "nonRecursiveDir");
  expect(existingDir).toBeDefined();

  // Cleanup
  await localFS.delete("nonRecursiveDir", { recursive: true });
});

test("LocalFS should delete nested files", async () => {
  // Create nested file structure
  await localFS.write("nested/deep/file.txt", { content: "Deep file" });

  // Delete the nested file
  const result = await localFS.delete("nested/deep/file.txt");
  expect(result.message).toBe("Successfully deleted: nested/deep/file.txt");

  // Verify file no longer exists
  const listResult = await localFS.list("nested/deep");
  expect(listResult.list.length).toBe(0);

  // Cleanup
  await localFS.delete("nested", { recursive: true });
});

// Rename method tests
test("LocalFS should rename a file successfully", async () => {
  // Create a test file
  await localFS.write("oldName.txt", { content: "Original content" });

  // Rename the file
  const result = await localFS.rename("oldName.txt", "newName.txt");
  expect(result.message).toBe("Successfully renamed 'oldName.txt' to 'newName.txt'");

  // Verify old file no longer exists
  const listResult = await localFS.list("");
  const oldFile = listResult.list.find((entry) => entry.path === "oldName.txt");
  expect(oldFile).toBeUndefined();

  // Verify new file exists with correct content
  const { result: readResult } = await localFS.read("newName.txt");
  expect(readResult?.path).toBe("newName.txt");
  expect(readResult?.content).toBe("Original content");

  // Cleanup
  await localFS.delete("newName.txt");
});

test("LocalFS should rename a directory", async () => {
  // Create a test directory with files
  await localFS.write("oldDir/file1.txt", { content: "File 1" });
  await localFS.write("oldDir/file2.txt", { content: "File 2" });

  // Rename the directory
  const result = await localFS.rename("oldDir", "newDir");
  expect(result.message).toBe("Successfully renamed 'oldDir' to 'newDir'");

  // Verify old directory no longer exists
  const listResult = await localFS.list("");
  const oldDir = listResult.list.find((entry) => entry.path === "oldDir");
  expect(oldDir).toBeUndefined();

  // Verify new directory exists with files
  const newDirList = await localFS.list("newDir");
  expect(newDirList.list.length).toBe(2);
  const filePaths = newDirList.list.map((entry) => entry.path).sort();
  expect(filePaths).toEqual(["newDir/file1.txt", "newDir/file2.txt"]);

  // Cleanup
  await localFS.delete("newDir", { recursive: true });
});

test("LocalFS should throw error when renaming to existing path without overwrite", async () => {
  // Create two test files
  await localFS.write("source.txt", { content: "Source content" });
  await localFS.write("target.txt", { content: "Target content" });

  // Try to rename without overwrite option
  expect(localFS.rename("source.txt", "target.txt")).rejects.toThrow(
    "Destination 'target.txt' already exists. Set overwrite: true to replace it.",
  );

  // Verify both files still exist with original content
  const { result: sourceResult } = await localFS.read("source.txt");
  expect(sourceResult?.content).toBe("Source content");

  const { result: targetResult } = await localFS.read("target.txt");
  expect(targetResult?.content).toBe("Target content");

  // Cleanup
  await localFS.delete("source.txt");
  await localFS.delete("target.txt");
});

test("LocalFS should rename with overwrite option", async () => {
  // Create two test files
  await localFS.write("source2.txt", { content: "Source content 2" });
  await localFS.write("target2.txt", { content: "Target content 2" });

  // Rename with overwrite option
  const result = await localFS.rename("source2.txt", "target2.txt", { overwrite: true });
  expect(result.message).toBe("Successfully renamed 'source2.txt' to 'target2.txt'");

  // Verify source no longer exists
  const listResult = await localFS.list("");
  const sourceFile = listResult.list.find((entry) => entry.path === "source2.txt");
  expect(sourceFile).toBeUndefined();

  // Verify target has source content
  const { result: targetResult } = await localFS.read("target2.txt");
  expect(targetResult?.content).toBe("Source content 2");

  // Cleanup
  await localFS.delete("target2.txt");
});

test("LocalFS should rename to nested path", async () => {
  // Create a test file
  await localFS.write("flatFile.txt", { content: "Flat content" });

  // Rename to nested path
  const result = await localFS.rename("flatFile.txt", "nested/path/movedFile.txt");
  expect(result.message).toBe("Successfully renamed 'flatFile.txt' to 'nested/path/movedFile.txt'");

  // Verify old path no longer exists
  const listResult = await localFS.list("");
  const oldFile = listResult.list.find((entry) => entry.path === "flatFile.txt");
  expect(oldFile).toBeUndefined();

  // Verify file exists at new nested path
  const { result: readResult } = await localFS.read("nested/path/movedFile.txt");
  expect(readResult?.path).toBe("nested/path/movedFile.txt");
  expect(readResult?.content).toBe("Flat content");

  // Cleanup
  await localFS.delete("nested", { recursive: true });
});

test("LocalFS should throw error when renaming non-existent file", async () => {
  // Try to rename a file that doesn't exist
  expect(localFS.rename("nonExistent.txt", "newName.txt")).rejects.toThrow();
});
