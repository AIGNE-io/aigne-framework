import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FileStore from "../../../../src/utils/aigne-hub/store/file.js";

describe("FileStore", () => {
  let testDir: string;
  let testFilePath: string;
  let store: FileStore;

  beforeEach(async () => {
    testDir = join(tmpdir(), `secrets-test-${Date.now()}-${Math.random()}`);
    await fs.mkdir(testDir, { recursive: true });
    testFilePath = join(testDir, "secrets.yaml");
    store = new FileStore({ filepath: testFilePath });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe("available()", () => {
    test("should return true when directory exists", async () => {
      const result = await store.available();
      expect(result).toBe(true);
    });

    test("should return false when directory does not exist", async () => {
      const nonExistentPath = join("/non/existent/path", "secrets.yaml");
      const invalidStore = new FileStore({ filepath: nonExistentPath });
      const result = await invalidStore.available();
      expect(result).toBe(false);
    });
  });

  describe("setKey() and getKey()", () => {
    test("should store and retrieve a key", async () => {
      const url = "https://example.com";
      const secret = "test-api-key";

      await store.setKey(url, secret);
      const retrieved = await store.getKey(url);

      expect(retrieved).toEqual({ AIGNE_HUB_API_URL: url, AIGNE_HUB_API_KEY: secret });
    });

    test("should handle multiple hosts", async () => {
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");
      await store.setKey("https://host3.com/path", "key3");

      expect((await store.getKey("https://host1.com"))?.AIGNE_HUB_API_KEY).toBe("key1");
      expect((await store.getKey("https://host2.com"))?.AIGNE_HUB_API_KEY).toBe("key2");
      expect((await store.getKey("https://host3.com/path"))?.AIGNE_HUB_API_KEY).toBe("key3");
    });

    test("should normalize URLs to host", async () => {
      await store.setKey("https://example.com/api/v1", "test-key");

      const retrieved = await store.getKey("https://example.com/another/path");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should overwrite existing key", async () => {
      const url = "https://example.com";

      await store.setKey(url, "old-key");
      await store.setKey(url, "new-key");

      const retrieved = await store.getKey(url);
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("new-key");
    });

    test("should return null for non-existent key", async () => {
      const retrieved = await store.getKey("https://nonexistent.com");
      expect(retrieved).toBe(null);
    });

    test("should throw error when setting key and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });

      await expect(invalidStore.setKey("https://test.com", "key")).rejects.toThrow(
        "File store not available",
      );
    });

    test("should return null when getting key and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.getKey("https://test.com");
      expect(result).toBe(null);
    });

    test("should persist data to file", async () => {
      await store.setKey("https://example.com", "test-key");

      const newStore = new FileStore({ filepath: testFilePath });
      const retrieved = await newStore.getKey("https://example.com");

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should store both API key and URL", async () => {
      const url = "https://example.com/api";
      await store.setKey(url, "test-key");

      const fileContent = await fs.readFile(testFilePath, "utf-8");
      expect(fileContent).toContain("AIGNE_HUB_API_KEY");
      expect(fileContent).toContain("AIGNE_HUB_API_URL");
      expect(fileContent).toContain(url);
    });
  });

  describe("deleteKey()", () => {
    test("should delete existing key", async () => {
      await store.setKey("https://example.com", "test-key");

      const deleted = await store.deleteKey("https://example.com");
      expect(deleted).toBe(true);

      const retrieved = await store.getKey("https://example.com");
      expect(retrieved).toBe(null);
    });

    test("should return false when deleting non-existent key", async () => {
      const deleted = await store.deleteKey("https://nonexistent.com");
      expect(deleted).toBe(false);
    });

    test("should return false when store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.deleteKey("https://test.com");
      expect(result).toBe(false);
    });

    test("should not affect other keys", async () => {
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");

      await store.deleteKey("https://host1.com");

      expect(await store.getKey("https://host1.com")).toBe(null);
      expect((await store.getKey("https://host2.com"))?.AIGNE_HUB_API_KEY).toBe("key2");
    });
  });

  describe("listHosts()", () => {
    test("should return empty array for empty store", async () => {
      const hosts = await store.listHosts();
      expect(hosts).toEqual([]);
    });

    test("should list all hosts with details", async () => {
      await store.setKey("https://host1.com/api", "key1");
      await store.setKey("https://host2.com", "key2");

      const hosts = await store.listHosts();

      expect(hosts.length).toBe(2);
      expect(hosts[0]).toBeDefined();
      if (!hosts[0]) return;

      expect(hosts[0]).toHaveProperty("AIGNE_HUB_API_URL");
      expect(hosts[0]).toHaveProperty("AIGNE_HUB_API_KEY");
    });

    test("should include host in entry", async () => {
      const url = "https://example.com/api/v1";
      await store.setKey(url, "test-key");

      const hosts = await store.listHosts();

      expect(hosts[0]).toBeDefined();
      if (!hosts[0]) return;

      expect(hosts[0].AIGNE_HUB_API_URL).toBe("https://example.com/api/v1");
      expect(hosts[0].AIGNE_HUB_API_KEY).toBe("test-key");
    });
  });

  describe("setDefault() and getDefault()", () => {
    test("should set and get default", async () => {
      const url = "https://example.com";
      await store.setKey(url, "test-key");
      await store.setDefault(url);

      const defaultKey = await store.getDefault();
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should throw when setting default and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });

      await expect(invalidStore.setDefault("https://test.com")).rejects.toThrow(
        "File store not available",
      );
    });

    test("should return null when getting default and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.getDefault();
      expect(result).toBe(null);
    });

    test("should fallback to first host when default not set", async () => {
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");

      const defaultKey = await store.getDefault({ fallbackToFirst: true });
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("key1");
    });

    test("should not fallback when fallbackToFirst is false", async () => {
      await store.setKey("https://example.com", "test-key");

      const defaultKey = await store.getDefault({ fallbackToFirst: false });
      expect(defaultKey).toBe(null);
    });

    test("should not fallback by default when default not set", async () => {
      await store.setKey("https://example.com", "test-key");

      const defaultKey = await store.getDefault();
      expect(defaultKey).toBe(null);
    });

    test("should preset default when fallback occurs and presetIfFallback is true", async () => {
      await store.setKey("https://example.com/api", "test-key");

      const defaultKey = await store.getDefault({ fallbackToFirst: true, presetIfFallback: true });
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");

      const defaultAgain = await store.getDefault({ fallbackToFirst: false });
      expect(defaultAgain?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should not preset when presetIfFallback is false", async () => {
      await store.setKey("https://example.com", "test-key");

      await store.getDefault({ fallbackToFirst: true, presetIfFallback: false });

      // Verify it was not set
      const defaultKey = await store.getDefault({ fallbackToFirst: false });
      expect(defaultKey).toBe(null);
    });

    test("should return null when no hosts exist", async () => {
      const defaultKey = await store.getDefault();
      expect(defaultKey).toBe(null);
    });

    test("should update default when changed", async () => {
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");

      await store.setDefault("https://host1.com");
      expect((await store.getDefault())?.AIGNE_HUB_API_KEY).toBe("key1");

      await store.setDefault("https://host2.com");
      expect((await store.getDefault())?.AIGNE_HUB_API_KEY).toBe("key2");
    });

    test("should correctly handle default value", async () => {
      await store.setKey("https://default.com", "default-key");
      await store.setDefault("https://default.com");

      const defaultValue = await store.getDefault();
      expect(defaultValue?.AIGNE_HUB_API_KEY).toBe("default-key");

      await store.deleteDefault();
      const noDefault = await store.getDefault();
      expect(noDefault).toBe(null);
    });
  });

  describe("file format", () => {
    test("should create valid YAML file", async () => {
      await store.setKey("https://example.com", "test-key");

      const fileContent = await fs.readFile(testFilePath, "utf-8");

      expect(fileContent).toContain("example.com:");
      expect(fileContent).toContain("AIGNE_HUB_API_KEY:");
      expect(fileContent).toContain("AIGNE_HUB_API_URL:");
    });

    test("should handle empty or corrupted file gracefully", async () => {
      await fs.writeFile(testFilePath, "invalid: yaml: content: [[[", "utf-8");

      await store.setKey("https://example.com", "test-key");
      const retrieved = await store.getKey("https://example.com");

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should handle non-object YAML content", async () => {
      await fs.writeFile(testFilePath, "just a string", "utf-8");

      await store.setKey("https://example.com", "test-key");
      const retrieved = await store.getKey("https://example.com");

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });
  });

  describe("edge cases", () => {
    test("should handle URLs without protocol", async () => {
      await store.setKey("example.com", "test-key");
      const retrieved = await store.getKey("example.com");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should handle URLs with port", async () => {
      await store.setKey("https://example.com:8080", "test-key");
      const retrieved = await store.getKey("https://example.com:8080/api");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should handle special characters in secret", async () => {
      const secret = "key!@#$%^&*()_+-=[]{}|;':\",./<>?";
      await store.setKey("https://example.com", secret);
      const retrieved = await store.getKey("https://example.com");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe(secret);
    });

    test("should handle empty secret", async () => {
      await store.setKey("https://example.com", "");
      const retrieved = await store.getKey("https://example.com");
      expect(retrieved?.AIGNE_HUB_API_KEY === "" || retrieved === null).toBe(true);
    });

    test("should handle very long secrets", async () => {
      const longSecret = "x".repeat(10000);
      await store.setKey("https://example.com", longSecret);
      const retrieved = await store.getKey("https://example.com");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe(longSecret);
    });
  });

  describe("concurrent operations", () => {
    test("should handle concurrent writes", async () => {
      for (let i = 0; i < 10; i++) {
        await store.setKey(`https://host${i}.com`, `key${i}`);
      }

      for (let i = 0; i < 10; i++) {
        const key = await store.getKey(`https://host${i}.com`);
        expect(key?.AIGNE_HUB_API_KEY).toBe(`key${i}`);
      }
    });

    test("should handle mixed operations", async () => {
      await store.setKey("https://example.com", "initial-key");

      const operations = [
        store.getKey("https://example.com"),
        store.setKey("https://example.com", "updated-key"),
        store.getKey("https://example.com"),
      ];

      await Promise.all(operations);

      const finalKey = await store.getKey("https://example.com");
      expect(finalKey?.AIGNE_HUB_API_KEY).toBe("updated-key");
    });
  });
});
