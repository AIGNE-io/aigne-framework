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
  testDir = join(tmpdir(), `afs-git-test-${Date.now()}`);
  repoPath = join(testDir, "test-repo");
  await mkdir(repoPath, { recursive: true });

  // Initialize git repository
  const git = simpleGit(repoPath);
  await git.init();
  await git.addConfig("user.name", "Test User");
  await git.addConfig("user.email", "test@example.com");

  // Ensure we're on main branch (git init might create master)
  await git.checkoutLocalBranch("main");

  // Create initial commit on main branch
  await writeFile(join(repoPath, "README.md"), "# Test Repository\n");
  await writeFile(join(repoPath, "package.json"), JSON.stringify({ name: "test" }, null, 2));
  await mkdir(join(repoPath, "src"), { recursive: true });
  await writeFile(join(repoPath, "src/index.ts"), 'console.log("Hello World");\n');
  await writeFile(join(repoPath, "src/utils.ts"), "export const add = (a, b) => a + b;\n");

  await git.add(".");
  await git.commit("Initial commit");

  // Create develop branch with different content
  await git.checkoutLocalBranch("develop");
  await writeFile(join(repoPath, "README.md"), "# Test Repository (Develop)\n");
  await writeFile(join(repoPath, "src/dev.ts"), 'console.log("Development");\n');
  await git.add(".");
  await git.commit("Add dev file");

  // Create feature branch
  await git.checkoutLocalBranch("feature-test");
  await writeFile(join(repoPath, "feature.txt"), "Feature content\n");
  await git.add(".");
  await git.commit("Add feature file");

  // Switch back to main
  await git.checkout("main");

  // Create AFSGit instance
  afsGit = new AFSGit({ repoPath, accessMode: "readonly" });
});

afterAll(async () => {
  await afsGit.cleanup();
  await rm(testDir, { recursive: true, force: true });
});

test("should list all branches at root", async () => {
  const result = await afsGit.list("/");

  const paths = result.data.map((entry) => entry.path).sort();
  expect(paths).toMatchInlineSnapshot(`
    [
      "/develop",
      "/feature-test",
      "/main",
    ]
  `);

  // All should be directories
  result.data.forEach((entry) => {
    expect(entry.metadata?.type).toBe("directory");
  });
});

test("should list files in main branch root", async () => {
  const result = await afsGit.list("/main");

  const paths = result.data.map((entry) => entry.path).sort();
  expect(paths).toContain("/main/README.md");
  expect(paths).toContain("/main/package.json");
  expect(paths).toContain("/main/src");
});

test("should list files in subdirectory", async () => {
  const result = await afsGit.list("/main/src");

  const paths = result.data.map((entry) => entry.path).sort();
  expect(paths).toMatchInlineSnapshot(`
    [
      "/main/src/index.ts",
      "/main/src/utils.ts",
    ]
  `);
});

test("should list files recursively with maxDepth", async () => {
  const result = await afsGit.list("/main", { maxDepth: 2 });

  const paths = result.data.map((entry) => entry.path).sort();
  expect(paths).toContain("/main/README.md");
  expect(paths).toContain("/main/src");
  expect(paths).toContain("/main/src/index.ts");
  expect(paths).toContain("/main/src/utils.ts");
});

test("should read file content from main branch", async () => {
  const { data } = await afsGit.read("/main/README.md");

  expect(data?.content).toBe("# Test Repository\n");
  expect(data?.metadata?.type).toBe("file");
  expect(data?.path).toBe("/main/README.md");
});

test("should read file from subdirectory", async () => {
  const { data } = await afsGit.read("/main/src/index.ts");

  expect(data?.content).toBe('console.log("Hello World");\n');
  expect(data?.metadata?.type).toBe("file");
});

test("should read different content from different branches", async () => {
  const { data: mainData } = await afsGit.read("/main/README.md");
  const { data: devData } = await afsGit.read("/develop/README.md");

  expect(mainData?.content).toBe("# Test Repository\n");
  expect(devData?.content).toBe("# Test Repository (Develop)\n");
});

test("should read file unique to develop branch", async () => {
  const { data } = await afsGit.read("/develop/src/dev.ts");

  expect(data?.content).toBe('console.log("Development");\n');
});

test("should return undefined for non-existent file", async () => {
  const result = await afsGit.read("/main/non-existent.txt");

  expect(result.data).toBeUndefined();
  expect(result.message).toBeDefined();
});

test("should read directory metadata", async () => {
  const { data } = await afsGit.read("/main/src");

  expect(data?.metadata?.type).toBe("directory");
  expect(data?.path).toBe("/main/src");
  expect(data?.content).toBeUndefined();
});

test("should search for content using git grep", async () => {
  const result = await afsGit.search("/main", "Hello");

  expect(result.data.length).toBeGreaterThan(0);
  const paths = result.data.map((e) => e.path);
  expect(paths).toContain("/main/src/index.ts");
});

test("should search in subdirectory", async () => {
  const result = await afsGit.search("/main/src", "console");

  expect(result.data.length).toBeGreaterThan(0);
  const paths = result.data.map((e) => e.path);
  expect(paths.some((p) => p.includes("/main/src/"))).toBe(true);
});

test("should return empty results for no matches", async () => {
  const result = await afsGit.search("/main", "NonExistentString12345");

  expect(result.data.length).toBe(0);
});

test("should filter branches if specified", async () => {
  const filteredGit = new AFSGit({
    repoPath,
    branches: ["main", "develop"],
  });

  const result = await filteredGit.list("/");
  const paths = result.data.map((e) => e.path).sort();

  expect(paths).toEqual(["/develop", "/main"]);
  expect(paths).not.toContain("/feature-test");

  await filteredGit.cleanup();
});

test("should handle limit option in list", async () => {
  const result = await afsGit.list("/main", { maxDepth: 2, limit: 2 });

  expect(result.data.length).toBeLessThanOrEqual(2);
});

test("should respect maxDepth option", async () => {
  const result1 = await afsGit.list("/main", { maxDepth: 1 });
  const result2 = await afsGit.list("/main", { maxDepth: 2 });

  const paths1 = result1.data.map((e) => e.path);
  const paths2 = result2.data.map((e) => e.path);

  // maxDepth: 1 should not include files in src/
  expect(paths1.some((p) => p.includes("/main/src/"))).toBe(false);

  // maxDepth: 2 should include files in src/
  expect(paths2.some((p) => p.includes("/main/src/"))).toBe(true);
});
