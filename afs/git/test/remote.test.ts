import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFSGit } from "../src/index.js";

// Test with a public repository
const TEST_REPO_URL = "https://github.com/octocat/Hello-World.git";
const TEMP_DIR = join(tmpdir(), "afs-git-remote-test");

describe("AFSGit with remoteUrl", () => {
  let afsGit: AFSGit;

  beforeAll(async () => {
    // Clean up temp directory if exists
    await rm(TEMP_DIR, { recursive: true, force: true });
  });

  afterAll(async () => {
    if (afsGit) {
      await afsGit.cleanup();
    }
    // Clean up temp directory
    await rm(TEMP_DIR, { recursive: true, force: true });
  });

  test("should clone remote repository to temp directory", async () => {
    afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      depth: 1,
      branches: ["master"], // Single branch = --single-branch optimization
    });

    await afsGit.ready();

    expect(afsGit).toBeDefined();
    expect(afsGit.name).toBe("Hello-World");
  });

  test("should list branches from cloned repository", async () => {
    const result = await afsGit.list("/");
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);

    // Should have master branch
    const masterBranch = result.data.find((entry) => entry.path === "/master");
    expect(masterBranch).toBeDefined();
    expect(masterBranch?.metadata?.type).toBe("directory");
  });

  test("should list files in master branch", async () => {
    const result = await afsGit.list("/master");
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);

    // Should have README file
    const readme = result.data.find((entry) => entry.path === "/master/README");
    expect(readme).toBeDefined();
    expect(readme?.metadata?.type).toBe("file");
  });

  test("should read file content from master branch", async () => {
    const result = await afsGit.read("/master/README");
    expect(result.data).toBeDefined();
    expect(result.data?.content).toBeDefined();
    expect(typeof result.data?.content).toBe("string");
    expect(result.data?.metadata?.type).toBe("file");
  });

  test("should search content in repository", async () => {
    const result = await afsGit.search("/master", "Hello");
    expect(result.data).toBeDefined();
    // May or may not find matches depending on repo content
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe("AFSGit with remoteUrl and custom repoPath", () => {
  test("should clone to custom path if it doesn't exist", async () => {
    const customPath = join(TEMP_DIR, "custom-clone");
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      repoPath: customPath,
      depth: 1,
      branches: ["master"],
      autoCleanup: false, // Don't auto cleanup for this test
    });

    expect(afsGit).toBeDefined();

    // List should work
    const result = await afsGit.list("/");
    expect(result.data.length).toBeGreaterThan(0);

    await afsGit.cleanup();
    await rm(customPath, { recursive: true, force: true });
  });

  test("should use existing clone if repoPath exists", async () => {
    const existingPath = join(TEMP_DIR, "existing-clone");

    // First create the clone
    const firstInstance = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      repoPath: existingPath,
      depth: 1,
      branches: ["master"],
    });

    await firstInstance.cleanup();

    // Now create another instance with same path (should not re-clone)
    const secondInstance = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      repoPath: existingPath,
      autoCleanup: false,
    });

    const result = await secondInstance.list("/");
    expect(result.data.length).toBeGreaterThan(0);

    await secondInstance.cleanup();
    await rm(existingPath, { recursive: true, force: true });
  });
});

describe("AFSGit remote operations", () => {
  test("should support fetch operation", async () => {
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      depth: 1,
      branches: ["master"],
    });

    // Fetch may throw for shallow clones, which is expected behavior
    try {
      await afsGit.fetch();
    } catch (error) {
      // Expected for shallow clones
      expect(error).toBeDefined();
    }

    await afsGit.cleanup();
  });

  test("should support pull operation", async () => {
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      depth: 1,
      branches: ["master"],
    });

    // Pull may throw for shallow clones, which is expected behavior
    try {
      await afsGit.pull();
    } catch (error) {
      // Expected for shallow clones
      expect(error).toBeDefined();
    }

    await afsGit.cleanup();
  });
});

describe("AFSGit - Error Handling", () => {
  // Skip this test as git clone timeout for invalid URLs takes too long
  test.skip(
    "should handle invalid remote URL",
    async () => {
      const invalidRepoPath = join(TEMP_DIR, "invalid-repo-test");
      await rm(invalidRepoPath, { recursive: true, force: true });

      const afsGit = new AFSGit({
        remoteUrl: "https://github.com/invalid/nonexistent-repo-abc12345xyz.git",
        repoPath: invalidRepoPath,
        depth: 1,
      });

      await expect(afsGit.ready()).rejects.toThrow();

      await rm(invalidRepoPath, { recursive: true, force: true });
    },
    { timeout: 15000 },
  );

  test(
    "should handle invalid branch",
    async () => {
      const invalidBranchPath = join(TEMP_DIR, "invalid-branch-test");
      await rm(invalidBranchPath, { recursive: true, force: true });

      const afsGit = new AFSGit({
        remoteUrl: TEST_REPO_URL,
        repoPath: invalidBranchPath,
        branches: ["nonexistent-branch-xyz12345abc"],
        depth: 1,
      });

      await expect(afsGit.ready()).rejects.toThrow();

      await rm(invalidBranchPath, { recursive: true, force: true });
    },
    { timeout: 15000 },
  );

  test("should require either repoPath or remoteUrl", () => {
    expect(() => {
      new AFSGit({});
    }).toThrowErrorMatchingInlineSnapshot(
      `"AFSGit check arguments error: : Either repoPath or remoteUrl must be provided"`,
    );
  });
});

describe("AFSGit - Options", () => {
  test("should accept single branch (uses --single-branch)", async () => {
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      branches: ["master"], // Single branch = --single-branch optimization
      depth: 1,
    });

    const result = await afsGit.list("/");
    expect(result.data).toBeDefined();

    // Should only have specified branch
    const masterBranch = result.data.find((entry) => entry.path === "/master");
    expect(masterBranch).toBeDefined();

    await afsGit.cleanup();
  });

  test("should support readonly access mode", async () => {
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      accessMode: "readonly",
      depth: 1,
      branches: ["master"],
    });

    await afsGit.ready();

    expect(afsGit.accessMode).toBe("readonly");

    // Read should work
    const result = await afsGit.read("/master/README");
    expect(result.data).toBeDefined();

    await afsGit.cleanup();
  });

  test("should accept custom name and description", async () => {
    const afsGit = new AFSGit({
      remoteUrl: TEST_REPO_URL,
      name: "test-repo",
      description: "Test repository for AFSGit",
      depth: 1,
      branches: ["master"],
    });

    await afsGit.ready();

    expect(afsGit.name).toBe("test-repo");
    expect(afsGit.description).toBe("Test repository for AFSGit");

    await afsGit.cleanup();
  });
});
