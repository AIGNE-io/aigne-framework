import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FileStore from "../src/file.js";
import type { ValueInfo } from "../src/types.js";

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

  describe("setItem() and getItem()", () => {
    test("should store and retrieve an item", async () => {
      const key = "example.com";
      const value: ValueInfo = { apiKey: "test-key", apiUrl: "https://example.com" };

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved).toEqual(value);
    });

    test("should handle multiple items", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setItem("host2", { apiKey: "key2" });
      await store.setItem("host3", { apiKey: "key3" });

      expect((await store.getItem("host1"))?.apiKey).toBe("key1");
      expect((await store.getItem("host2"))?.apiKey).toBe("key2");
      expect((await store.getItem("host3"))?.apiKey).toBe("key3");
    });

    test("should overwrite existing item", async () => {
      const key = "example.com";

      await store.setItem(key, { apiKey: "old-key" });
      await store.setItem(key, { apiKey: "new-key" });

      const retrieved = await store.getItem(key);
      expect(retrieved?.apiKey).toBe("new-key");
    });

    test("should return null for non-existent item", async () => {
      const retrieved = await store.getItem("nonexistent");
      expect(retrieved).toBe(null);
    });

    test("should throw error when setting item and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });

      await expect(invalidStore.setItem("test", { apiKey: "key" })).rejects.toThrow(
        "File store not available",
      );
    });

    test("should return null when getting item and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.getItem("test");
      expect(result).toBe(null);
    });

    test("should persist data to file", async () => {
      await store.setItem("example.com", { apiKey: "test-key" });

      const newStore = new FileStore({ filepath: testFilePath });
      const retrieved = await newStore.getItem("example.com");

      expect(retrieved?.apiKey).toBe("test-key");
    });

    test("should store complex ValueInfo objects", async () => {
      const value: ValueInfo = {
        apiKey: "test-key",
        apiUrl: "https://example.com/api",
        customField: "custom-value",
      };

      await store.setItem("example.com", value);
      const retrieved = await store.getItem("example.com");

      expect(retrieved).toEqual(value);
    });
  });

  describe("deleteItem()", () => {
    test("should delete existing item", async () => {
      await store.setItem("example.com", { apiKey: "test-key" });

      const deleted = await store.deleteItem("example.com");
      expect(deleted).toBe(true);

      const retrieved = await store.getItem("example.com");
      expect(retrieved).toBe(null);
    });

    test("should return false when deleting non-existent item", async () => {
      const deleted = await store.deleteItem("nonexistent");
      expect(deleted).toBe(false);
    });

    test("should return false when store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.deleteItem("test");
      expect(result).toBe(false);
    });

    test("should not affect other items", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setItem("host2", { apiKey: "key2" });

      await store.deleteItem("host1");

      expect(await store.getItem("host1")).toBe(null);
      expect((await store.getItem("host2"))?.apiKey).toBe("key2");
    });
  });

  describe("listItems()", () => {
    test("should return null for empty store", async () => {
      const items = await store.listItems();
      expect(items).toBe(null);
    });

    test("should list all items excluding default", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setItem("host2", { apiKey: "key2" });

      const items = await store.listItems();

      expect(items).not.toBe(null);
      expect(items?.length).toBe(2);
      expect(items?.[0]?.account).toBe("host1");
      expect(items?.[1]?.account).toBe("host2");
    });

    test("should not include default in list", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setDefaultItem({ apiKey: "default-key" });

      const items = await store.listItems();

      expect(items?.length).toBe(1);
      expect(items?.[0]?.account).toBe("host1");
    });

    test("should return null when store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.listItems();
      expect(result).toBe(null);
    });
  });

  describe("listEntries()", () => {
    test("should return empty array for empty store", async () => {
      const entries = await store.listEntries();
      expect(entries).toEqual([]);
    });

    test("should list all entries as ValueInfo array", async () => {
      await store.setItem("host1", { apiKey: "key1", apiUrl: "https://host1.com" });
      await store.setItem("host2", { apiKey: "key2", apiUrl: "https://host2.com" });

      const entries = await store.listEntries();

      expect(entries.length).toBe(2);
      expect(entries[0]?.apiKey).toBe("key1");
      expect(entries[1]?.apiKey).toBe("key2");
    });
  });

  describe("listMap()", () => {
    test("should return empty object for empty store", async () => {
      const map = await store.listMap();
      expect(map).toEqual({});
    });

    test("should return map of all entries", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setItem("host2", { apiKey: "key2" });

      const map = await store.listMap();

      expect(map.host1?.apiKey).toBe("key1");
      expect(map.host2?.apiKey).toBe("key2");
    });
  });

  describe("setDefaultItem() and getDefaultItem()", () => {
    test("should set and get default item", async () => {
      const value: ValueInfo = { apiKey: "default-key", apiUrl: "https://default.com" };
      await store.setDefaultItem(value);

      const retrieved = await store.getDefaultItem();
      expect(retrieved).toEqual(value);
    });

    test("should throw when setting default and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });

      await expect(invalidStore.setDefaultItem({ apiKey: "key" })).rejects.toThrow(
        "File store not available",
      );
    });

    test("should return null when getting default and store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      const result = await invalidStore.getDefaultItem();
      expect(result).toBe(null);
    });

    test("should return null when no default set", async () => {
      const retrieved = await store.getDefaultItem();
      expect(retrieved).toBe(null);
    });

    test("should update default when changed", async () => {
      await store.setDefaultItem({ apiKey: "key1" });
      expect((await store.getDefaultItem())?.apiKey).toBe("key1");

      await store.setDefaultItem({ apiKey: "key2" });
      expect((await store.getDefaultItem())?.apiKey).toBe("key2");
    });
  });

  describe("deleteDefaultItem()", () => {
    test("should delete default item", async () => {
      await store.setDefaultItem({ apiKey: "default-key" });
      expect(await store.getDefaultItem()).not.toBe(null);

      await store.deleteDefaultItem();
      expect(await store.getDefaultItem()).toBe(null);
    });

    test("should throw when store unavailable", async () => {
      const invalidStore = new FileStore({ filepath: "/non/existent/path/secrets.yaml" });
      await expect(invalidStore.deleteDefaultItem()).rejects.toThrow("File store not available");
    });

    test("should not affect other items", async () => {
      await store.setItem("host1", { apiKey: "key1" });
      await store.setDefaultItem({ apiKey: "default-key" });

      await store.deleteDefaultItem();

      expect(await store.getDefaultItem()).toBe(null);
      expect((await store.getItem("host1"))?.apiKey).toBe("key1");
    });
  });

  describe("file format", () => {
    test("should create valid YAML file", async () => {
      await store.setItem("example.com", { apiKey: "test-key", apiUrl: "https://example.com" });

      const fileContent = await fs.readFile(testFilePath, "utf-8");

      expect(fileContent).toContain("example.com:");
      expect(fileContent).toContain("apiKey:");
      expect(fileContent).toContain("apiUrl:");
    });

    test("should handle empty or corrupted file gracefully", async () => {
      await fs.writeFile(testFilePath, "invalid: yaml: content: [[[", "utf-8");

      await store.setItem("example.com", { apiKey: "test-key" });
      const retrieved = await store.getItem("example.com");

      expect(retrieved?.apiKey).toBe("test-key");
    });

    test("should handle non-object YAML content", async () => {
      await fs.writeFile(testFilePath, "just a string", "utf-8");

      await store.setItem("example.com", { apiKey: "test-key" });
      const retrieved = await store.getItem("example.com");

      expect(retrieved?.apiKey).toBe("test-key");
    });
  });

  describe("edge cases", () => {
    test("should handle keys with special characters", async () => {
      const key = "example.com:8080/api/v1";
      await store.setItem(key, { apiKey: "test-key" });
      const retrieved = await store.getItem(key);
      expect(retrieved?.apiKey).toBe("test-key");
    });

    test("should handle complex nested ValueInfo", async () => {
      const value: ValueInfo = {
        apiKey: "key",
        nested: { prop: "value" },
        array: [1, 2, 3],
      };
      await store.setItem("example.com", value);
      const retrieved = await store.getItem("example.com");
      expect(retrieved).toEqual(value);
    });

    test("should handle empty string values", async () => {
      await store.setItem("example.com", { apiKey: "" });
      const retrieved = await store.getItem("example.com");
      expect(retrieved?.apiKey).toBe("");
    });

    test("should handle very long keys and values", async () => {
      const longKey = "x".repeat(1000);
      const longValue = { apiKey: "y".repeat(10000) };
      await store.setItem(longKey, longValue);
      const retrieved = await store.getItem(longKey);
      expect(retrieved?.apiKey).toBe(longValue.apiKey);
    });
  });
});
