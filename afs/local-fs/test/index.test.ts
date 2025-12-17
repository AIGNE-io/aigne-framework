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

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file1.txt",
      "/file2.md",
      "/subdir",
    ]
  `);

  // Check metadata types
  const metadataTypes = result.data.map((entry) => ({
    path: entry.path,
    type: entry.metadata?.type,
  }));
  expect(metadataTypes.sort((a, b) => a.path.localeCompare(b.path))).toMatchInlineSnapshot(`
    [
      {
        "path": "/",
        "type": "directory",
      },
      {
        "path": "/file1.txt",
        "type": "file",
      },
      {
        "path": "/file2.md",
        "type": "file",
      },
      {
        "path": "/subdir",
        "type": "directory",
      },
    ]
  `);
});

test("LocalFS should list files recursively when recursive option is true", async () => {
  const result = await localFS.list("", { maxDepth: 1000 });

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file1.txt",
      "/file2.md",
      "/subdir",
      "/subdir/file3.js",
      "/subdir/nested",
      "/subdir/nested/file4.json",
    ]
  `);
});

test("LocalFS should respect maxDepth option", async () => {
  const result = await localFS.list("", { maxDepth: 1 });

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file1.txt",
      "/file2.md",
      "/subdir",
    ]
  `);
});

test("LocalFS should respect limit option", async () => {
  const result = await localFS.list("", { limit: 3 });

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(3);
});

test("LocalFS should list files in a subdirectory", async () => {
  const result = await localFS.list("subdir");

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/subdir",
      "/subdir/file3.js",
      "/subdir/nested",
    ]
  `);
});

test("LocalFS should handle orderBy option", async () => {
  const result = await localFS.list("", {
    orderBy: [["path", "asc"]],
  });

  const paths = result.data.map((entry) => entry.path);
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file1.txt",
      "/file2.md",
      "/subdir",
    ]
  `);
});

// Read method tests
test("LocalFS should read a file and return content", async () => {
  const { data } = await localFS.read("file1.txt");

  expect(data).toBeDefined();
  expect(data?.path).toBe("file1.txt");
  expect(data?.content).toBe("Hello World");
  expect(data?.metadata?.type).toBe("file");
  expect(data?.metadata?.size).toBeGreaterThan(0);
});

test("LocalFS should read a directory without content", async () => {
  const { data } = await localFS.read("subdir");

  expect(data).toBeDefined();
  expect(data?.path).toBe("subdir");
  expect(data?.content).toBeUndefined();
  expect(data?.metadata?.type).toBe("directory");
});

test("LocalFS should read a nested file", async () => {
  const { data } = await localFS.read("subdir/file3.js");

  expect(data).toBeDefined();
  expect(data?.path).toBe("subdir/file3.js");
  expect(data?.content).toBe('console.log("test");');
  expect(data?.metadata?.type).toBe("file");
});

test("LocalFS should return error message instead of raising error", async () => {
  expect(await localFS.read("FILE_NOT_EXIST.md")).toMatchInlineSnapshot(
    {
      message: expect.stringMatching("ENOENT: no such file or directory, stat"),
    },
    `
    {
      "data": undefined,
      "message": StringMatching "ENOENT: no such file or directory, stat",
    }
  `,
  );
});

// Write method tests
test("LocalFS should write a new file", async () => {
  const entry = {
    content: "New file content",
    summary: "Test file",
    metadata: { custom: "value" },
  };

  const { data } = await localFS.write("newfile.txt", entry);

  expect(data).toBeDefined();
  expect(data.path).toBe("newfile.txt");
  expect(data.content).toBe("New file content");
  expect(data.summary).toBe("Test file");
  expect(data.metadata?.custom).toBe("value");
  expect(data.metadata?.type).toBe("file");
  expect(data.metadata?.size).toBeGreaterThan(0);
});

test("LocalFS should write a file with JSON content", async () => {
  const jsonData = { name: "test", value: 42 };
  const entry = {
    content: jsonData,
    summary: "JSON test file",
  };

  const { data } = await localFS.write("data.json", entry);

  expect(data).toBeDefined();
  expect(data.path).toBe("data.json");
  expect(data.content).toEqual(jsonData);
  expect(data.metadata?.type).toBe("file");

  // Verify the file was written with JSON formatting
  const { data: readResult } = await localFS.read("data.json");
  expect(readResult?.content).toBe(JSON.stringify(jsonData, null, 2));
});

test("LocalFS should write a file in a nested directory", async () => {
  const entry = {
    content: "Nested file content",
    metadata: { nested: true },
  };

  const { data } = await localFS.write("deep/nested/test.txt", entry);

  expect(data).toBeDefined();
  expect(data.path).toBe("deep/nested/test.txt");
  expect(data.content).toBe("Nested file content");
  expect(data.metadata?.nested).toBe(true);
  expect(data.metadata?.type).toBe("file");
});

test("LocalFS should overwrite existing file", async () => {
  const entry = {
    content: "Updated content",
    summary: "Updated file",
  };

  const { data } = await localFS.write("file1.txt", entry);

  expect(data).toBeDefined();
  expect(data.path).toBe("file1.txt");
  expect(data.content).toBe("Updated content");
  expect(data.summary).toBe("Updated file");

  // Verify the file was actually updated
  const { data: readResult } = await localFS.read("file1.txt");
  expect(readResult?.content).toBe("Updated content");
});

// Search method tests
test("LocalFS should search for text in files", async () => {
  // First update the content since it was overwritten in previous test
  await localFS.write("file1.txt", { content: "Hello World" });

  const result = await localFS.search("", "Hello");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBeGreaterThan(0);

  const foundFile = result.data.find((entry) => entry.path === "file1.txt");
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain("Hello");
});

test("LocalFS should search with regex pattern", async () => {
  const result = await localFS.search("", "console\\.log");

  expect(result.data).toBeDefined();

  const foundFile = result.data.find((entry) => entry.path.includes("file3.js"));
  expect(foundFile).toBeDefined();
  expect(foundFile?.summary).toContain('console.log("test")');
});

test("LocalFS should search in specific directory", async () => {
  const result = await localFS.search("subdir", "test");

  expect(result.data).toBeDefined();

  const paths = result.data.map((entry) => entry.path);
  // All results should be within subdir
  paths.forEach((path) => {
    expect(path.startsWith("subdir/")).toBe(true);
  });
});

test("LocalFS should respect search limit option", async () => {
  const result = await localFS.search("", "test", { limit: 1 });

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(1);
});

test("LocalFS should return empty results for no matches", async () => {
  const result = await localFS.search("", "nonexistenttext123");

  expect(result.data).toBeDefined();
  expect(result.data.length).toBe(0);
});

test("LocalFS should search in written files", async () => {
  // First write a file with searchable content
  await localFS.write("searchable.txt", {
    content: "This is searchable content with unique keyword",
  });

  const result = await localFS.search("", "unique keyword");

  expect(result.data).toBeDefined();
  const foundFile = result.data.find((entry) => entry.path === "searchable.txt");
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
  expect(result.data).toBeDefined();
  let foundFile = result.data.find((entry) => entry.path === "caseTest.txt");
  expect(foundFile).toBeDefined();

  // Search with caseSensitive: true
  result = await localFS.search("", "case sensitive", { caseSensitive: true });
  expect(result.data).toBeDefined();
  foundFile = result.data.find((entry) => entry.path === "caseTest.txt");
  expect(foundFile).toBeUndefined();

  // Search with exact case
  result = await localFS.search("", "Case Sensitive", { caseSensitive: true });
  expect(result.data).toBeDefined();
  foundFile = result.data.find((entry) => entry.path === "caseTest.txt");
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
  const deletedFile = listResult.data.find((entry) => entry.path === "toDelete.txt");
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
  const deletedDir = listResult.data.find((entry) => entry.path === "deleteDir");
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
  expect(listResult.data.map((i) => i.path).sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/caseTest.txt",
      "/data.json",
      "/deep",
      "/file1.txt",
      "/file2.md",
      "/newfile.txt",
      "/nonRecursiveDir",
      "/searchable.txt",
      "/subdir",
    ]
  `);

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
  expect(listResult.data.map((i) => i.path)).toMatchInlineSnapshot(`
    [
      "/nested/deep",
    ]
  `);

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
  const oldFile = listResult.data.find((entry) => entry.path === "oldName.txt");
  expect(oldFile).toBeUndefined();

  // Verify new file exists with correct content
  const { data: readResult } = await localFS.read("newName.txt");
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
  const oldDir = listResult.data.find((entry) => entry.path === "oldDir");
  expect(oldDir).toBeUndefined();

  // Verify new directory exists with files
  const newDirList = await localFS.list("newDir");
  const filePaths = newDirList.data.map((entry) => entry.path).sort();
  expect(filePaths.sort()).toMatchInlineSnapshot(`
    [
      "/newDir",
      "/newDir/file1.txt",
      "/newDir/file2.txt",
    ]
  `);

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
  const { data: sourceResult } = await localFS.read("source.txt");
  expect(sourceResult?.content).toBe("Source content");

  const { data: targetResult } = await localFS.read("target.txt");
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
  const sourceFile = listResult.data.find((entry) => entry.path === "source2.txt");
  expect(sourceFile).toBeUndefined();

  // Verify target has source content
  const { data: targetResult } = await localFS.read("target2.txt");
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
  const oldFile = listResult.data.find((entry) => entry.path === "flatFile.txt");
  expect(oldFile).toBeUndefined();

  // Verify file exists at new nested path
  const { data: readResult } = await localFS.read("nested/path/movedFile.txt");
  expect(readResult?.path).toBe("nested/path/movedFile.txt");
  expect(readResult?.content).toBe("Flat content");

  // Cleanup
  await localFS.delete("nested", { recursive: true });
});

test("LocalFS should throw error when renaming non-existent file", async () => {
  // Try to rename a file that doesn't exist
  expect(localFS.rename("nonExistent.txt", "newName.txt")).rejects.toThrow();
});

// Gitignore tests
test("LocalFS should respect .gitignore when listing files", async () => {
  // Create a test directory with git structure
  const gitTestDir = join(tmpdir(), `gitignore-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create .gitignore file
  await writeFile(join(gitTestDir, ".gitignore"), "*.log\nnode_modules/\n.env");

  // Create test files
  await writeFile(join(gitTestDir, "index.js"), "console.log('test')");
  await writeFile(join(gitTestDir, "debug.log"), "debug info");
  await writeFile(join(gitTestDir, ".env"), "SECRET=123");
  await mkdir(join(gitTestDir, "node_modules"), { recursive: true });
  await writeFile(join(gitTestDir, "node_modules", "package.json"), "{}");

  const gitFS = new LocalFS({ localPath: gitTestDir });

  // Should NOT include ignored files
  expect(
    (await gitFS.list("", { maxDepth: 2 })).data.map((i) => i.path).sort(),
  ).toMatchInlineSnapshot(`
    [
      "/",
      "/.gitignore",
      "/index.js",
    ]
  `);

  // Now test with custom ignore patterns
  gitFS.options.ignore = [".gitignore"];

  expect(
    (await gitFS.list("", { maxDepth: 2 })).data.map((i) => i.path).sort(),
  ).toMatchInlineSnapshot(`
    [
      "/",
      "/index.js",
    ]
  `);

  // Cleanup
  await rm(gitTestDir, { recursive: true, force: true });
});

test("LocalFS should allow disabling gitignore", async () => {
  // Create a test directory with git structure
  const gitTestDir = join(tmpdir(), `gitignore-disabled-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create .gitignore file
  await writeFile(join(gitTestDir, ".gitignore"), "*.log\n");

  // Create test files
  await writeFile(join(gitTestDir, "index.js"), "console.log('test')");
  await writeFile(join(gitTestDir, "debug.log"), "debug info");

  const gitFS = new LocalFS({ localPath: gitTestDir });

  // Test with gitignore disabled
  const result = await gitFS.list("", { disableGitignore: true });
  const paths = result.data.map((entry) => entry.path);

  // Should include all files
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.git",
      "/.gitignore",
      "/debug.log",
      "/index.js",
    ]
  `);

  // Cleanup
  await rm(gitTestDir, { recursive: true, force: true });
});

test("LocalFS should handle nested .gitignore files", async () => {
  // Create a test directory with git structure
  const gitTestDir = join(tmpdir(), `gitignore-nested-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create root .gitignore
  await writeFile(join(gitTestDir, ".gitignore"), "*.log\n");

  // Create subdirectory with its own .gitignore
  await mkdir(join(gitTestDir, "src"), { recursive: true });
  await writeFile(join(gitTestDir, "src", ".gitignore"), "*.tmp\n");

  // Create test files
  await writeFile(join(gitTestDir, "root.log"), "root log");
  await writeFile(join(gitTestDir, "root.js"), "root js");
  await writeFile(join(gitTestDir, "src", "sub.log"), "sub log");
  await writeFile(join(gitTestDir, "src", "sub.tmp"), "sub tmp");
  await writeFile(join(gitTestDir, "src", "sub.js"), "sub js");

  const gitFS = new LocalFS({ localPath: gitTestDir });

  // Test listing from root
  const rootResult = await gitFS.list("", { maxDepth: 2 });
  const rootPaths = rootResult.data.map((entry) => entry.path);

  // Root .gitignore should filter *.log
  expect(rootPaths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.gitignore",
      "/root.js",
      "/src",
      "/src/.gitignore",
      "/src/sub.js",
    ]
  `);

  // Cleanup
  await rm(gitTestDir, { recursive: true, force: true });
});

test("LocalFS should stop at .git directory when searching for .gitignore", async () => {
  // Create a test directory structure with nested git repos
  const outerDir = join(tmpdir(), `gitignore-outer-test-${Date.now()}`);
  await mkdir(outerDir, { recursive: true });
  await mkdir(join(outerDir, ".git"), { recursive: true });

  // Create outer .gitignore
  await writeFile(join(outerDir, ".gitignore"), "outer.txt\n");

  // Create inner git repo
  const innerDir = join(outerDir, "inner");
  await mkdir(innerDir, { recursive: true });
  await mkdir(join(innerDir, ".git"), { recursive: true });
  await writeFile(join(innerDir, ".gitignore"), "inner.txt\n");

  // Create test files
  await writeFile(join(innerDir, "outer.txt"), "should be ignored");
  await writeFile(join(innerDir, "inner.txt"), "should also be ignored");
  await writeFile(join(innerDir, "normal.txt"), "should be visible");

  const innerFS = new LocalFS({ localPath: innerDir });

  // Test listing from inner directory
  const result = await innerFS.list("");
  const paths = result.data.map((entry) => entry.path);

  // Should only apply inner .gitignore, not outer
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.gitignore",
      "/normal.txt",
      "/outer.txt",
    ]
  `);

  // Cleanup
  await rm(outerDir, { recursive: true, force: true });
});

test("LocalFS should handle directory patterns in .gitignore", async () => {
  // Create a test directory with git structure
  const gitTestDir = join(tmpdir(), `gitignore-dir-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create .gitignore with directory pattern
  await writeFile(join(gitTestDir, ".gitignore"), "build/\ndist/\n*.tmp");

  // Create directories and files
  await mkdir(join(gitTestDir, "build"), { recursive: true });
  await writeFile(join(gitTestDir, "build", "output.js"), "built file");
  await mkdir(join(gitTestDir, "src"), { recursive: true });
  await writeFile(join(gitTestDir, "src", "index.js"), "source file");
  await writeFile(join(gitTestDir, "temp.tmp"), "temp file");

  const gitFS = new LocalFS({ localPath: gitTestDir });

  // Test listing
  const result = await gitFS.list("", { maxDepth: 2 });
  const paths = result.data.map((entry) => entry.path);

  // Should filter out build directory and .tmp files
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.gitignore",
      "/src",
      "/src/index.js",
    ]
  `);

  // Cleanup
  await rm(gitTestDir, { recursive: true, force: true });
});

test("LocalFS should work without any .gitignore file", async () => {
  // Create a test directory with git structure but no .gitignore
  const gitTestDir = join(tmpdir(), `no-gitignore-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create test files
  await writeFile(join(gitTestDir, "file1.js"), "file 1");
  await writeFile(join(gitTestDir, "file2.log"), "file 2");

  const gitFS = new LocalFS({ localPath: gitTestDir });

  // Test listing without .gitignore
  const result = await gitFS.list("");
  const paths = result.data.map((entry) => entry.path);

  // Should include all files when no .gitignore exists
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.git",
      "/file1.js",
      "/file2.log",
    ]
  `);

  // Cleanup
  await rm(gitTestDir, { recursive: true, force: true });
});

test("LocalFS should work without .git directory", async () => {
  // Create a test directory without git structure
  const nonGitDir = join(tmpdir(), `non-git-test-${Date.now()}`);
  await mkdir(nonGitDir, { recursive: true });

  // Create .gitignore (but no .git directory)
  await writeFile(join(nonGitDir, ".gitignore"), "*.log\n");

  // Create test files
  await writeFile(join(nonGitDir, "file.js"), "file content");
  await writeFile(join(nonGitDir, "file.log"), "log content");

  const nonGitFS = new LocalFS({ localPath: nonGitDir });

  // Test listing - should still apply .gitignore rules
  const result = await nonGitFS.list("");
  const paths = result.data.map((entry) => entry.path);

  // Should still filter based on .gitignore
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/.gitignore",
      "/file.js",
    ]
  `);

  // Cleanup
  await rm(nonGitDir, { recursive: true, force: true });
});

// MaxChildren tests
test("LocalFS should respect maxChildren option", async () => {
  // Create a test directory with many files
  const maxChildrenDir = join(tmpdir(), `maxchildren-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });

  // Create 10 files in the directory
  for (let i = 0; i < 10; i++) {
    await writeFile(join(maxChildrenDir, `file${i}.txt`), `content ${i}`);
  }

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // Test with maxChildren: 5
  const result = await maxChildrenFS.list("", { maxChildren: 5 });
  const paths = result.data.map((entry) => entry.path);

  // Should only return 5 files
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file0.txt",
      "/file1.txt",
      "/file2.txt",
      "/file3.txt",
      "/file4.txt",
    ]
  `);

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});

test("LocalFS should mark directory as truncated when maxChildren is exceeded", async () => {
  // Create a test directory with subdirectory containing many files
  const maxChildrenDir = join(tmpdir(), `maxchildren-truncated-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });
  await mkdir(join(maxChildrenDir, "subdir"), { recursive: true });

  // Create 10 files in the subdirectory
  for (let i = 0; i < 10; i++) {
    await writeFile(join(maxChildrenDir, "subdir", `file${i}.txt`), `content ${i}`);
  }

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // List with maxChildren: 5 and maxDepth: 2 to see the subdirectory
  const result = await maxChildrenFS.list("", { maxChildren: 5, maxDepth: 2 });

  // Find the subdir entry
  const subdirEntry = result.data.find((entry) => entry.path === "/subdir");

  // Should have childrenTruncated flag
  expect(subdirEntry).toBeDefined();
  expect(subdirEntry?.metadata?.childrenTruncated).toBe(true);
  expect(subdirEntry?.metadata?.childrenCount).toBe(10);

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});

test("LocalFS should handle maxChildren with nested directories", async () => {
  // Create a nested directory structure
  const maxChildrenDir = join(tmpdir(), `maxchildren-nested-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });
  await mkdir(join(maxChildrenDir, "dir1"), { recursive: true });
  await mkdir(join(maxChildrenDir, "dir2"), { recursive: true });
  await mkdir(join(maxChildrenDir, "dir3"), { recursive: true });

  // Create files in each directory
  await writeFile(join(maxChildrenDir, "dir1", "file1.txt"), "content 1");
  await writeFile(join(maxChildrenDir, "dir2", "file2.txt"), "content 2");
  await writeFile(join(maxChildrenDir, "dir3", "file3.txt"), "content 3");

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // List with maxChildren: 2 - should only process 2 directories
  const result = await maxChildrenFS.list("", { maxChildren: 2, maxDepth: 2 });
  const paths = result.data.map((entry) => entry.path);

  // Should only see 2 directories and their children
  const dirCount = paths.filter((p) => p.startsWith("dir")).length;
  expect(dirCount).toBeLessThanOrEqual(4); // 2 dirs + max 2 files

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});

test("LocalFS should throw error when maxChildren is zero or negative", async () => {
  const maxChildrenDir = join(tmpdir(), `maxchildren-invalid-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });
  await writeFile(join(maxChildrenDir, "file.txt"), "content");

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // Test with maxChildren: 0
  expect(maxChildrenFS.list("", { maxChildren: 0 })).rejects.toThrow(
    "Invalid maxChildren: 0. Must be positive.",
  );

  // Test with maxChildren: -1
  expect(maxChildrenFS.list("", { maxChildren: -1 })).rejects.toThrow(
    "Invalid maxChildren: -1. Must be positive.",
  );

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});

test("LocalFS should work correctly when maxChildren equals number of children", async () => {
  // Create a test directory with exactly 5 files
  const maxChildrenDir = join(tmpdir(), `maxchildren-equal-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });

  for (let i = 0; i < 5; i++) {
    await writeFile(join(maxChildrenDir, `file${i}.txt`), `content ${i}`);
  }

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // List with maxChildren: 5 (equal to number of files)
  const result = await maxChildrenFS.list("", { maxChildren: 5 });
  const paths = result.data.map((entry) => entry.path);

  // Should return all 5 files
  expect(paths.sort()).toMatchInlineSnapshot(`
    [
      "/",
      "/file0.txt",
      "/file1.txt",
      "/file2.txt",
      "/file3.txt",
      "/file4.txt",
    ]
  `);

  // Should not be marked as truncated
  const entries = result.data;
  expect(entries.every((e) => !e.metadata?.childrenTruncated)).toBe(true);

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});

test("LocalFS should combine maxChildren with gitignore", async () => {
  // Create a test directory with git structure
  const maxChildrenDir = join(tmpdir(), `maxchildren-gitignore-test-${Date.now()}`);
  await mkdir(maxChildrenDir, { recursive: true });
  await mkdir(join(maxChildrenDir, ".git"), { recursive: true });

  // Create .gitignore to filter some files
  await writeFile(join(maxChildrenDir, ".gitignore"), "*.log\n");

  // Create 10 files (5 .js and 5 .log)
  for (let i = 0; i < 5; i++) {
    await writeFile(join(maxChildrenDir, `file${i}.js`), `content ${i}`);
    await writeFile(join(maxChildrenDir, `file${i}.log`), `log ${i}`);
  }

  const maxChildrenFS = new LocalFS({ localPath: maxChildrenDir });

  // List with maxChildren: 3 (after gitignore filters *.log)
  const result = await maxChildrenFS.list("", { maxChildren: 3 });
  const paths = result.data.map((entry) => entry.path);

  // Should have at most 3 items (gitignore happens first, then maxChildren)
  expect(paths.length).toBeLessThanOrEqual(4);

  // Should not contain any .log files
  expect(paths.every((p) => !p.endsWith(".log"))).toBe(true);

  // Cleanup
  await rm(maxChildrenDir, { recursive: true, force: true });
});
