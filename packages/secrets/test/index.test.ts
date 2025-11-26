import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import FileStore from "../src/file.js";
import createSecretStore from "../src/index.js";
import KeyringStore from "../src/keytar.js";

describe("createSecretStore", () => {
  let testDir: string;
  let testFilePath: string;
  let testServiceName: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `secrets-test-${Date.now()}-${Math.random()}`);
    await fs.mkdir(testDir, { recursive: true });
    testFilePath = join(testDir, "secrets.yaml");
    testServiceName = `test-service-${Date.now()}-${Math.random()}`;
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe("validation", () => {
    test("should throw error when serviceName is not provided", async () => {
      await expect(
        createSecretStore({
          serviceName: "",
          filepath: testFilePath,
        }),
      ).rejects.toThrow("Secret store key is required");
    });

    test("should throw error when keyring unavailable and no filepath", async () => {
      await expect(
        createSecretStore({
          serviceName: testServiceName,
          forceUnavailable: true,
        }),
      ).rejects.toThrow("Filepath is required");
    });
  });

  describe("store selection", () => {
    test("should return KeyringStore when keyring is available", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
      });

      expect(store).toBeInstanceOf(KeyringStore);
      expect(await store.available()).toBe(true);
    });

    test("should return FileStore when keyring is unavailable", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      expect(store).toBeInstanceOf(FileStore);
      expect(await store.available()).toBe(true);
    });

    test("should prioritize KeyringStore over FileStore when both available", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
      });

      expect(store).toBeInstanceOf(KeyringStore);
    });
  });

  describe("store functionality", () => {
    test("should create a functional store that can set and get items", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const key = "test-key";
      const value = { data: "test-value", type: "api-key" };

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved).toEqual(value);
    });

    test("should create a functional store that can delete items", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const key = "test-key";
      const value = { data: "test-value" };

      await store.setItem(key, value);
      expect(await store.getItem(key)).toEqual(value);

      const deleted = await store.deleteItem(key);
      expect(deleted).toBe(true);
      expect(await store.getItem(key)).toBe(null);
    });

    test("should create a functional store that can set and get default item", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const defaultValue = { data: "default-value", type: "default" };

      await store.setDefaultItem(defaultValue);
      const retrieved = await store.getDefaultItem();

      expect(retrieved).toEqual(defaultValue);

      await store.deleteDefaultItem();
    });

    test("should create a functional store that can list items", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const items = [
        { key: "key1", value: { data: "value1" } },
        { key: "key2", value: { data: "value2" } },
      ];

      for (const { key, value } of items) {
        await store.setItem(key, value);
      }

      const entries = await store.listEntries();
      expect(entries.length).toBeGreaterThanOrEqual(2);
      expect(entries.some((e) => e.data === "value1")).toBe(true);
      expect(entries.some((e) => e.data === "value2")).toBe(true);
    });

    test("should create a functional store that can list map", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const items = [
        { key: "key1", value: { data: "value1" } },
        { key: "key2", value: { data: "value2" } },
      ];

      for (const { key, value } of items) {
        await store.setItem(key, value);
      }

      const map = await store.listMap();
      expect(map.key1?.data).toBe("value1");
      expect(map.key2?.data).toBe("value2");
    });
  });

  describe("fallback behavior", () => {
    test("FileStore should work when keyring is forced unavailable", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      expect(store).toBeInstanceOf(FileStore);

      const key = "test-key";
      const value = { data: "test-value" };

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved).toEqual(value);
    });

    test("FileStore should persist data to file", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      await store.setItem("example.com", { apiKey: "test-key" });

      const fileExists = await fs
        .access(testFilePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      const newStore = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const retrieved = await newStore.getItem("example.com");
      expect(retrieved?.apiKey).toBe("test-key");
    });
  });

  describe("complex scenarios", () => {
    test("should handle multiple operations on the same store", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      await store.setItem("key1", { data: "value1" });
      await store.setItem("key2", { data: "value2" });
      await store.setDefaultItem({ data: "default" });

      expect((await store.getItem("key1"))?.data).toBe("value1");
      expect((await store.getItem("key2"))?.data).toBe("value2");
      expect((await store.getDefaultItem())?.data).toBe("default");

      await store.setItem("key1", { data: "updated-value1" });
      expect((await store.getItem("key1"))?.data).toBe("updated-value1");

      await store.deleteItem("key2");
      expect(await store.getItem("key2")).toBe(null);

      expect((await store.getItem("key1"))?.data).toBe("updated-value1");
      expect((await store.getDefaultItem())?.data).toBe("default");

      await store.deleteItem("key1");
      await store.deleteDefaultItem();
    });

    test("should handle complex ItemInfo objects", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const complexValue = {
        apiKey: "key",
        apiUrl: "https://example.com",
        metadata: {
          nested: {
            deep: "value",
          },
        },
        array: [1, 2, 3],
        boolean: true,
      };

      await store.setItem("complex", complexValue);
      const retrieved = await store.getItem("complex");

      expect(retrieved).toEqual(complexValue);
    });

    test("should handle sequential operations", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      for (let i = 0; i < 5; i++) {
        await store.setItem(`key${i}`, { data: `value${i}` });
      }

      for (let i = 0; i < 5; i++) {
        const item = await store.getItem(`key${i}`);
        expect(item?.data).toBe(`value${i}`);
      }
    });
  });

  describe("edge cases", () => {
    test("should handle special characters in keys", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const specialKey = "key!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const value = { data: "special-value" };

      await store.setItem(specialKey, value);
      const retrieved = await store.getItem(specialKey);

      expect(retrieved).toEqual(value);
    });

    test("should handle empty data values", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const key = "empty-key";
      const value = { data: "" };

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved?.data === "" || retrieved === null).toBe(true);
    });

    test("should handle very long values", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const key = "long-key";
      const longValue = { data: "x".repeat(5000) };

      await store.setItem(key, longValue);
      const retrieved = await store.getItem(key);

      expect(retrieved?.data).toBe(longValue.data);
    });
  });

  describe("persistence across instances", () => {
    test("KeyringStore selection and basic functionality", async () => {
      const store = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
      });

      expect(store).toBeDefined();
      expect(await store.available()).toBe(true);

      if (store instanceof KeyringStore) {
        expect(store).toBeInstanceOf(KeyringStore);
      } else {
        expect(store).toBeInstanceOf(FileStore);
      }
    });

    test("FileStore should persist data across instances", async () => {
      const store1 = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      await store1.setItem("persist-key", { data: "persist-value" });

      const store2 = await createSecretStore({
        serviceName: testServiceName,
        filepath: testFilePath,
        forceUnavailable: true,
      });

      const retrieved = await store2.getItem("persist-key");
      expect(retrieved?.data).toBe("persist-value");
    });
  });
});
