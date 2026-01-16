import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFSGit } from "@aigne/afs-git";
import simpleGit from "simple-git";

let testDir: string;
let repoPath: string;
let afsGit: AFSGit;

beforeAll(async () => {
  // Create a temporary directory for test repository
  testDir = join(tmpdir(), `afs-git-readwrite-test-${Date.now()}`);
  repoPath = join(testDir, "test-repo");
  await mkdir(repoPath, { recursive: true });

  // Initialize git repository
  const git = simpleGit(repoPath);
  await git.init();
  await git.addConfig("user.name", "Test User");
  await git.addConfig("user.email", "test@example.com");

  // Ensure we're on main branch (git init might create master)
  await git.checkoutLocalBranch("main");

  // Create initial commit
  await writeFile(join(repoPath, "README.md"), "# Test Repository\n");
  await mkdir(join(repoPath, "src"), { recursive: true });
  await writeFile(join(repoPath, "src/index.ts"), 'console.log("Hello");\n');

  await git.add(".");
  await git.commit("Initial commit");

  // Create AFSGit instance in readwrite mode
  afsGit = new AFSGit({
    repoPath,
    accessMode: "readwrite",
    autoCommit: true,
    commitAuthor: {
      name: "AFS Git Test",
      email: "afs@test.com",
    },
  });
});

afterAll(async () => {
  await afsGit.cleanup();
  await rm(testDir, { recursive: true, force: true });
});

test("should write new file to repository", async () => {
  await afsGit.write("/main/newfile.txt", { content: "New file content\n" });

  // Verify file was written
  const { data } = await afsGit.read("/main/newfile.txt");
  expect(data?.content).toBe("New file content\n");
});

test("should write file to subdirectory", async () => {
  await afsGit.write("/main/src/helper.ts", {
    content: 'export const helper = () => "help";\n',
  });

  const { data } = await afsGit.read("/main/src/helper.ts");
  expect(data?.content).toBe('export const helper = () => "help";\n');
});

test("should update existing file", async () => {
  // First write
  await afsGit.write("/main/update-test.txt", { content: "Original content\n" });

  // Update
  await afsGit.write("/main/update-test.txt", { content: "Updated content\n" });

  const { data } = await afsGit.read("/main/update-test.txt");
  expect(data?.content).toBe("Updated content\n");
});

test("should write JSON content", async () => {
  const jsonData = { name: "test", version: "1.0.0" };
  await afsGit.write("/main/config.json", { content: jsonData });

  const { data } = await afsGit.read("/main/config.json");
  expect(data?.content).toContain('"name": "test"');
  expect(data?.content).toContain('"version": "1.0.0"');
});

test("should append to existing file", async () => {
  await afsGit.write("/main/append-test.txt", { content: "Line 1\n" });
  await afsGit.write("/main/append-test.txt", { content: "Line 2\n" }, { append: true });

  const { data } = await afsGit.read("/main/append-test.txt");
  expect(data?.content).toBe("Line 1\nLine 2\n");
});

test("should delete file", async () => {
  await afsGit.write("/main/delete-me.txt", { content: "To be deleted\n" });

  // Verify it exists
  let result = await afsGit.read("/main/delete-me.txt");
  expect(result.data?.content).toBe("To be deleted\n");

  // Delete it
  await afsGit.delete("/main/delete-me.txt");

  // Verify it's gone
  result = await afsGit.read("/main/delete-me.txt");
  expect(result.data).toBeUndefined();
});

test("should delete directory recursively", async () => {
  // Create a directory with files
  await afsGit.write("/main/to-delete/file1.txt", { content: "File 1\n" });
  await afsGit.write("/main/to-delete/file2.txt", { content: "File 2\n" });

  // Delete directory
  await afsGit.delete("/main/to-delete", { recursive: true });

  // Verify directory is gone
  const result = await afsGit.list("/main");
  const paths = result.data.map((e) => e.path);
  expect(paths.some((p) => p.includes("/main/to-delete"))).toBe(false);
});

test("should throw error when deleting directory without recursive", async () => {
  await afsGit.write("/main/non-recursive/file.txt", { content: "Content\n" });

  await expect(afsGit.delete("/main/non-recursive")).rejects.toThrow(/recursive/);
});

test("should rename file", async () => {
  await afsGit.write("/main/old-name.txt", { content: "Rename test\n" });

  await afsGit.rename("/main/old-name.txt", "/main/new-name.txt");

  // Old path should not exist
  const oldResult = await afsGit.read("/main/old-name.txt");
  expect(oldResult.data).toBeUndefined();

  // New path should exist with same content
  const newResult = await afsGit.read("/main/new-name.txt");
  expect(newResult.data?.content).toBe("Rename test\n");
});

test("should rename file to different directory", async () => {
  await afsGit.write("/main/move-me.txt", { content: "Moving\n" });

  await afsGit.rename("/main/move-me.txt", "/main/src/moved.txt");

  const result = await afsGit.read("/main/src/moved.txt");
  expect(result.data?.content).toBe("Moving\n");
});

test("should throw error when renaming to existing file without overwrite", async () => {
  await afsGit.write("/main/existing1.txt", { content: "File 1\n" });
  await afsGit.write("/main/existing2.txt", { content: "File 2\n" });

  await expect(afsGit.rename("/main/existing1.txt", "/main/existing2.txt")).rejects.toThrow(
    /already exists/,
  );
});

test("should overwrite when rename with overwrite option", async () => {
  await afsGit.write("/main/overwrite1.txt", { content: "File 1\n" });
  await afsGit.write("/main/overwrite2.txt", { content: "File 2\n" });

  await afsGit.rename("/main/overwrite1.txt", "/main/overwrite2.txt", { overwrite: true });

  const result = await afsGit.read("/main/overwrite2.txt");
  expect(result.data?.content).toBe("File 1\n");
});

test("should throw error when renaming across branches", async () => {
  // Create develop branch
  const git = simpleGit(repoPath);
  await git.checkoutLocalBranch("develop");
  await writeFile(join(repoPath, "develop.txt"), "Develop\n");
  await git.add(".");
  await git.commit("Add develop file");
  await git.checkout("main");

  await afsGit.write("/main/cross-branch.txt", { content: "Cross branch\n" });

  await expect(
    afsGit.rename("/main/cross-branch.txt", "/develop/cross-branch.txt"),
  ).rejects.toThrow(/across branches/);
});

test("should throw error when writing to root or branch root", async () => {
  await expect(afsGit.write("/", { content: "Invalid\n" })).rejects.toThrow(/root/);
  await expect(afsGit.write("/main", { content: "Invalid\n" })).rejects.toThrow(/root/);
});

test("should throw error when deleting root or branch root", async () => {
  await expect(afsGit.delete("/")).rejects.toThrow(/root/);
  await expect(afsGit.delete("/main")).rejects.toThrow(/root/);
});

test("should create parent directories automatically", async () => {
  await afsGit.write("/main/deep/nested/path/file.txt", { content: "Deep file\n" });

  const { data } = await afsGit.read("/main/deep/nested/path/file.txt");
  expect(data?.content).toBe("Deep file\n");
});

test("should verify commits were created with autoCommit", async () => {
  const git = simpleGit(repoPath);

  // Get current commit count
  const logBefore = await git.log();
  const commitsBefore = logBefore.total;

  // Write a file
  await afsGit.write("/main/commit-test.txt", { content: "Test commit\n" });

  // Check commits increased
  const logAfter = await git.log();
  const commitsAfter = logAfter.total;

  expect(commitsAfter).toBeGreaterThan(commitsBefore);
});

test("should handle multiple writes to same worktree efficiently", async () => {
  // These should all use the same worktree
  await afsGit.write("/main/batch1.txt", { content: "Batch 1\n" });
  await afsGit.write("/main/batch2.txt", { content: "Batch 2\n" });
  await afsGit.write("/main/batch3.txt", { content: "Batch 3\n" });

  // Verify all files exist
  const result = await afsGit.list("/main");
  const paths = result.data.map((e) => e.path);

  expect(paths).toContain("/main/batch1.txt");
  expect(paths).toContain("/main/batch2.txt");
  expect(paths).toContain("/main/batch3.txt");
});
