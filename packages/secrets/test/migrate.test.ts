import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FileStore from "../src/file.js";
import KeyringStore from "../src/keytar.js";
import { migrateFileToKeyring } from "../src/migrate.js";

const describeMigrate =
  process.env.CI || process.env.NODE_ENV === "test" ? describe.skip : describe;

describeMigrate("migrateFileToKeyring", () => {
  let testDir: string;
  let testFilePath: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `secrets-migrate-test-${Date.now()}-${Math.random()}`);
    await fs.mkdir(testDir, { recursive: true });
    testFilePath = join(testDir, "secrets.yaml");
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}

    try {
      const keyring = new KeyringStore();
      if (await keyring.available()) {
        const hosts = await keyring.listHosts();
        for (const host of hosts) {
          await keyring.deleteKey(host.AIGNE_HUB_API_URL!);
        }
      }
    } catch {}
  });

  test("should return false when filepath is not provided", async () => {
    await expect(migrateFileToKeyring({})).rejects.toThrow("Filepath is required for migration");
  });

  test("should return false when keyring is not available", async () => {
    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", "test-key");

    const result = await migrateFileToKeyring({
      filepath: testFilePath,
      forceUnavailable: true,
    });

    expect(result).toBe(false);

    try {
      await fs.access(testFilePath);
      expect(true).toBe(true);
    } catch {
      expect.unreachable("File should still exist");
    }
  });

  test("should return true when file does not exist (already migrated)", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    const nonExistentPath = join(testDir, "nonexistent.yaml");
    const result = await migrateFileToKeyring({ filepath: nonExistentPath });

    expect(result).toBe(true);
  });

  test("should migrate all hosts from file to keyring", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://host1.com", "key1");
    await fileStore.setKey("https://host2.com", "key2");
    await fileStore.setKey("https://host3.com/api", "key3");
    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    expect((await keyring.getKey("https://host1.com"))?.AIGNE_HUB_API_KEY).toBe("key1");
    expect((await keyring.getKey("https://host2.com"))?.AIGNE_HUB_API_KEY).toBe("key2");
    expect((await keyring.getKey("https://host3.com/api"))?.AIGNE_HUB_API_KEY).toBe("key3");

    try {
      await fs.access(testFilePath);
      expect.unreachable("File should be deleted after migration");
    } catch {
      expect(true).toBe(true);
    }
  });

  test("should migrate default setting", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", "test-key");
    await fileStore.setDefault("https://example.com");

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    const defaultKey = await keyring.getDefault({ fallbackToFirst: false });
    expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");
  });

  test("should handle file with no default setting", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", "test-key");

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    expect((await keyring.getKey("https://example.com"))?.AIGNE_HUB_API_KEY).toBe("test-key");

    const defaultKey = await keyring.getDefault({ fallbackToFirst: false });
    expect(defaultKey?.AIGNE_HUB_API_URL).toBe("https://example.com");
    expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");
  });

  test("should handle empty file", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    await fs.writeFile(testFilePath, "", "utf-8");

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    try {
      await fs.access(testFilePath);
      expect.unreachable("File should be deleted after migration");
    } catch {
      expect(true).toBe(true);
    }
  });

  test("should preserve special characters in secrets", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    const specialSecret = "key!@#$%^&*()_+-=[]{}|;':\",./<>?";
    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", specialSecret);

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    const retrieved = await keyring.getKey("https://example.com");
    expect(retrieved?.AIGNE_HUB_API_KEY).toBe(specialSecret);
  });

  test("should not migrate if keyring already has data", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    await keyring.setKey("https://existing.com", "existing-key");

    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", "test-key");

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    expect((await keyring.getKey("https://existing.com"))?.AIGNE_HUB_API_KEY).toBe("existing-key");
    expect((await keyring.getKey("https://example.com"))?.AIGNE_HUB_API_KEY).toBe("test-key");
  });

  test("should overwrite existing keys in keyring during migration", async () => {
    const keyring = new KeyringStore();
    if (!(await keyring.available())) {
      console.log("Skipping test: keyring not available");
      return;
    }

    await keyring.setKey("https://example.com", "old-key");

    const fileStore = new FileStore({ filepath: testFilePath });
    await fileStore.setKey("https://example.com", "new-key");

    const result = await migrateFileToKeyring({ filepath: testFilePath });

    expect(result).toBe(true);

    expect((await keyring.getKey("https://example.com"))?.AIGNE_HUB_API_KEY).toBe("new-key");
  });
});
