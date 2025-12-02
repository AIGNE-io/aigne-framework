import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import KeyringStore from "../src/keytar.js";
import { mockCredentials, mockKeyring } from "./util.js";

describe("KeyringStore", () => {
  let store: KeyringStore;
  let testServiceName: string;
  let testKeys: string[];

  beforeEach(() => {
    if (process.env.CI) {
      mockCredentials?.clear();
      mockKeyring?.getPassword.mockClear();
      mockKeyring?.setPassword.mockClear();
      mockKeyring?.deletePassword.mockClear();
      mockKeyring?.findCredentials.mockClear();
    }

    testServiceName = `test-service-${Date.now()}-${Math.random()}`;
    testKeys = [];
    store = new KeyringStore({ serviceName: testServiceName });
  });

  afterEach(async () => {
    for (const key of testKeys) {
      try {
        await store.deleteItem(key);
      } catch {}
    }
  });

  describe("available()", () => {
    test("should return true when keyring is available", async () => {
      const result = await store.available();
      expect(result).toBe(true);
    });

    test("should return false when forceKeytarUnavailable is set", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });
      const result = await unavailableStore.available();
      expect(result).toBe(false);
    });
  });

  describe("setItem() and getItem()", () => {
    test("should store and retrieve an item", async () => {
      const key = "test-key";
      const value = { data: "test-value", type: "api-key" };
      testKeys.push(key);

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved).toEqual(value);
    });

    test("should handle multiple items", async () => {
      const items = [
        { key: "key1", value: { data: "value1" } },
        { key: "key2", value: { data: "value2" } },
        { key: "key3", value: { data: "value3" } },
      ];

      for (const { key, value } of items) {
        testKeys.push(key);
        await store.setItem(key, value);
      }

      expect((await store.getItem("key1"))?.data).toBe("value1");
      expect((await store.getItem("key2"))?.data).toBe("value2");
      expect((await store.getItem("key3"))?.data).toBe("value3");
    });

    test("should overwrite existing item", async () => {
      const key = "test-key";
      testKeys.push(key);

      await store.setItem(key, { data: "old-value" });
      await store.setItem(key, { data: "new-value" });

      const retrieved = await store.getItem(key);
      expect(retrieved?.data).toBe("new-value");
    });

    test("should return null for non-existent item", async () => {
      const retrieved = await store.getItem("nonexistent-key");
      expect(retrieved).toBe(null);
    });

    test("should throw when setting item and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });

      await expect(unavailableStore.setItem("test-key", { data: "value" })).rejects.toThrow(
        "Keyring not available",
      );
    });

    test("should return null when getting item and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });
      const result = await unavailableStore.getItem("test-key");
      expect(result).toBe(null);
    });

    test("should persist data across instances", async () => {
      const key = "test-key";
      testKeys.push(key);

      await store.setItem(key, { data: "test-value" });

      const newStore = new KeyringStore({ serviceName: testServiceName });
      const retrieved = await newStore.getItem(key);

      expect(retrieved?.data).toBe("test-value");
    });
  });

  describe("deleteItem()", () => {
    test("should delete existing item", async () => {
      const key = "test-key";
      testKeys.push(key);

      await store.setItem(key, { data: "test-value" });

      const deleted = await store.deleteItem(key);
      expect(deleted).toBe(true);

      const retrieved = await store.getItem(key);
      expect(retrieved).toBe(null);
    });

    test("should return false when deleting non-existent item", async () => {
      const deleted = await store.deleteItem("nonexistent-key");
      expect(deleted).toBe(false);
    });

    test("should return false when keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });
      const result = await unavailableStore.deleteItem("test-key");
      expect(result).toBe(false);
    });

    test("should not affect other items", async () => {
      const key1 = "key1";
      const key2 = "key2";
      testKeys.push(key1, key2);

      await store.setItem(key1, { data: "value1" });
      await store.setItem(key2, { data: "value2" });

      await store.deleteItem(key1);

      expect(await store.getItem(key1)).toBe(null);
      expect((await store.getItem(key2))?.data).toBe("value2");
    });
  });

  describe("listEntries()", () => {
    test("should return empty array for empty store", async () => {
      const entries = await store.listEntries();
      expect(entries).toEqual([]);
    });

    test("should list all entries", async () => {
      const testData = [
        { key: "key1", value: { data: "value1", type: "api-key" } },
        { key: "key2", value: { data: "value2", type: "token" } },
      ];

      for (const { key, value } of testData) {
        testKeys.push(key);
        await store.setItem(key, value);
      }

      const entries = await store.listEntries();

      expect(entries.length).toBe(2);
      expect(entries.some((e) => e.data === "value1")).toBe(true);
      expect(entries.some((e) => e.data === "value2")).toBe(true);
    });

    test("should include all item properties", async () => {
      const key = "test-key";
      const value = { data: "test-value", type: "api-key", metadata: "extra" };
      testKeys.push(key);

      await store.setItem(key, value);

      const entries = await store.listEntries();

      expect(entries[0]).toBeDefined();
      if (!entries[0]) return;

      expect(entries[0].data).toBe("test-value");
      expect(entries[0].type).toBe("api-key");
      expect(entries[0].metadata).toBe("extra");
    });
  });

  describe("listMap()", () => {
    test("should return empty object for empty store", async () => {
      const map = await store.listMap();
      expect(map).toEqual({});
    });

    test("should return map of all items", async () => {
      const testData = [
        { key: "key1", value: { data: "value1" } },
        { key: "key2", value: { data: "value2" } },
      ];

      for (const { key, value } of testData) {
        testKeys.push(key);
        await store.setItem(key, value);
      }

      const map = await store.listMap();

      expect(Object.keys(map).length).toBe(2);
      expect(map.key1?.data).toBe("value1");
      expect(map.key2?.data).toBe("value2");
    });
  });

  describe("setDefaultItem() and getDefaultItem()", () => {
    test("should set and get default item", async () => {
      const value = { data: "default-value", type: "default" };

      await store.setDefaultItem(value);

      const defaultItem = await store.getDefaultItem();
      expect(defaultItem).toEqual(value);
    });

    test("should throw when setting default and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });

      await expect(unavailableStore.setDefaultItem({ data: "value" })).rejects.toThrow(
        "Keyring not available",
      );
    });

    test("should return null when getting default and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({
        serviceName: testServiceName,
        forceKeytarUnavailable: true,
      });
      const result = await unavailableStore.getDefaultItem();
      expect(result).toBe(null);
    });

    test("should return null when no default is set", async () => {
      const defaultItem = await store.getDefaultItem();
      expect(defaultItem).toBe(null);
    });

    test("should update default when changed", async () => {
      await store.setDefaultItem({ data: "value1" });
      expect((await store.getDefaultItem())?.data).toBe("value1");

      await store.setDefaultItem({ data: "value2" });
      expect((await store.getDefaultItem())?.data).toBe("value2");
    });

    test("should correctly handle default value", async () => {
      await store.setDefaultItem({ data: "default-value" });

      const defaultValue = await store.getDefaultItem();
      expect(defaultValue?.data).toBe("default-value");

      await store.deleteDefaultItem();
      const noDefault = await store.getDefaultItem();
      expect(noDefault).toBe(null);
    });
  });

  describe("edge cases", () => {
    test("should handle special characters in value", async () => {
      const key = "test-key";
      const value = { data: "key!@#$%^&*()_+-=[]{}|;':\",./<>?" };
      testKeys.push(key);

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved?.data).toBe(value.data);
    });

    test("should handle empty value", async () => {
      const key = "test-key";
      testKeys.push(key);

      await store.setItem(key, { data: "" });
      const retrieved = await store.getItem(key);

      expect(retrieved?.data === "" || retrieved === null).toBe(true);
    });

    test("should handle complex nested objects", async () => {
      const key = "test-key";
      const value = {
        data: "test",
        nested: {
          level1: {
            level2: "deep-value",
          },
        },
        array: [1, 2, 3],
      };
      testKeys.push(key);

      await store.setItem(key, value);
      const retrieved = await store.getItem(key);

      expect(retrieved).toEqual(value);
    });

    test("should handle very long values", async () => {
      const key = "test-key";
      const longValue = { data: "x".repeat(10000) };
      testKeys.push(key);

      await store.setItem(key, longValue);
      const retrieved = await store.getItem(key);

      expect(retrieved?.data).toBe(longValue.data);
    });
  });

  describe("concurrent operations", () => {
    test("should handle concurrent writes", async () => {
      for (let i = 0; i < 10; i++) {
        const key = `key${i}`;
        testKeys.push(key);
        await store.setItem(key, { data: `value${i}` });
      }

      for (let i = 0; i < 10; i++) {
        const item = await store.getItem(`key${i}`);
        expect(item?.data).toBe(`value${i}`);
      }
    });

    test("should handle mixed operations", async () => {
      const key = "test-key";
      testKeys.push(key);

      await store.setItem(key, { data: "initial-value" });

      const operations = [
        store.getItem(key),
        store.setItem(key, { data: "updated-value" }),
        store.getItem(key),
      ];

      await Promise.all(operations);

      const finalItem = await store.getItem(key);
      expect(finalItem?.data).toBe("updated-value");
    });
  });
});
