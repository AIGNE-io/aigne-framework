import { beforeEach, describe, expect, test } from "bun:test";
import { BaseSecretStore } from "../src/base.js";
import type { CredentialEntry, GetDefaultOptions, ItemInfo } from "../src/types.js";

class TestSecretStore extends BaseSecretStore {
  private storage = new Map<string, ItemInfo>();
  private defaultValue: ItemInfo | null = null;

  async available(): Promise<boolean> {
    return true;
  }

  async setItem(key: string, value: ItemInfo): Promise<void> {
    const host = this.normalizeHostFrom(key);
    this.storage.set(host, value);
  }

  async getItem(key: string): Promise<ItemInfo | null> {
    const host = this.normalizeHostFrom(key);
    return this.storage.get(host) || null;
  }

  async deleteItem(key: string): Promise<boolean> {
    const host = this.normalizeHostFrom(key);
    return this.storage.delete(host);
  }

  async listItems(): Promise<CredentialEntry[] | null> {
    const entries: CredentialEntry[] = [];
    for (const [account, value] of this.storage.entries()) {
      entries.push({ account, password: JSON.stringify(value) });
    }
    return entries;
  }

  async listEntries(): Promise<ItemInfo[]> {
    return Array.from(this.storage.values());
  }

  async listMap(): Promise<Record<string, ItemInfo>> {
    const map: Record<string, ItemInfo> = {};
    for (const [key, value] of this.storage.entries()) {
      map[key] = value;
    }
    return map;
  }

  async setDefaultItem(value: ItemInfo): Promise<void> {
    this.defaultValue = value;
  }

  async getDefaultItem(options?: GetDefaultOptions): Promise<ItemInfo | null> {
    if (this.defaultValue) {
      return this.defaultValue;
    }
    if (options?.fallbackToFirst) {
      const entries = await this.listEntries();
      return entries[0] || null;
    }
    return null;
  }

  async deleteDefaultItem(): Promise<void> {
    this.defaultValue = null;
  }
}

describe("BaseSecretStore", () => {
  describe("available", () => {
    test("should return true", async () => {
      const store = new TestSecretStore();
      expect(await store.available()).toBe(true);
    });
  });

  describe("normalizeHostFrom", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore();
    });

    test("should extract host from complete URL", () => {
      expect(store["normalizeHostFrom"]("https://example.com")).toBe("example.com");
      expect(store["normalizeHostFrom"]("https://api.example.com:8080")).toBe(
        "api.example.com:8080",
      );
      expect(store["normalizeHostFrom"]("http://localhost:3000/path")).toBe("localhost:3000");
    });

    test("should handle URLs with paths", () => {
      expect(store["normalizeHostFrom"]("https://example.com/api/v1")).toBe("example.com");
      expect(store["normalizeHostFrom"]("https://example.com/path/to/resource?query=value")).toBe(
        "example.com",
      );
    });

    test("should handle URLs with ports", () => {
      // Default ports are omitted (443 for https, 80 for http)
      expect(store["normalizeHostFrom"]("https://example.com:443")).toBe("example.com");
      expect(store["normalizeHostFrom"]("http://example.com:80")).toBe("example.com");
      // Non-default ports are preserved
      expect(store["normalizeHostFrom"]("http://example.com:8080")).toBe("example.com:8080");
      expect(store["normalizeHostFrom"]("https://example.com:8443")).toBe("example.com:8443");
    });

    test("should handle invalid URL input", () => {
      expect(store["normalizeHostFrom"]("not-a-url")).toBe("not-a-url");
      expect(store["normalizeHostFrom"]("")).toBe("");
      expect(store["normalizeHostFrom"]("just-text")).toBe("just-text");
    });

    test("should handle URLs with user info", () => {
      expect(store["normalizeHostFrom"]("https://user:pass@example.com")).toBe("example.com");
    });

    test("should handle URLs with hash", () => {
      expect(store["normalizeHostFrom"]("https://example.com/path#section")).toBe("example.com");
    });

    test("should handle IPv4 addresses", () => {
      expect(store["normalizeHostFrom"]("http://192.168.1.1:8080")).toBe("192.168.1.1:8080");
    });

    test("should handle IPv6 addresses", () => {
      expect(store["normalizeHostFrom"]("http://[::1]:8080")).toBe("[::1]:8080");
    });
  });

  describe("listMap", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore();
    });

    test("should return empty object when no items", async () => {
      const result = await store.listMap();
      expect(result).toEqual({});
    });

    test("should convert items list to map", async () => {
      await store.setItem("https://host1.com", { url: "https://host1.com", key: "key1" });
      await store.setItem("https://host2.com", { url: "https://host2.com", key: "key2" });
      await store.setItem("https://host3.com/path", { url: "https://host3.com/path", key: "key3" });

      const result = await store.listMap();

      expect(result["host1.com"]).toEqual({ url: "https://host1.com", key: "key1" });
      expect(result["host2.com"]).toEqual({ url: "https://host2.com", key: "key2" });
      expect(result["host3.com"]).toEqual({ url: "https://host3.com/path", key: "key3" });
    });

    test("should handle hosts with ports", async () => {
      await store.setItem("https://example.com:8080", {
        url: "https://example.com:8080",
        key: "key1",
      });
      await store.setItem("https://example.com:9090", {
        url: "https://example.com:9090",
        key: "key2",
      });

      const result = await store.listMap();

      expect(result["example.com:8080"]).toBeDefined();
      expect(result["example.com:9090"]).toBeDefined();
      expect(result["example.com:8080"]?.key).toBe("key1");
      expect(result["example.com:9090"]?.key).toBe("key2");
    });

    test("should correctly handle URL normalization", async () => {
      await store.setItem("https://example.com/api/v1", {
        url: "https://example.com/api/v1",
        key: "key1",
      });

      const result = await store.listMap();

      expect(result["example.com"]).toBeDefined();
      expect(result["example.com"]?.url).toBe("https://example.com/api/v1");
    });

    test("should handle multiple paths on same host", async () => {
      // normalizeHostFrom normalizes different paths on the same host to the same host
      // Later settings will overwrite earlier ones
      await store.setItem("https://example.com/api/v1", {
        url: "https://example.com/api/v1",
        key: "key1",
      });
      await store.setItem("https://example.com/api/v2", {
        url: "https://example.com/api/v2",
        key: "key2",
      });

      const result = await store.listMap();

      // Later settings overwrite
      expect(Object.keys(result).length).toBe(1);
      expect(result["example.com"]?.key).toBe("key2");
    });
  });

  describe("parseKey", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore();
    });

    test("should parse valid JSON string", () => {
      const jsonStr = '{"url":"https://example.com","key":"secret123"}';
      const result = store["parseKey"](jsonStr);
      expect(result).toEqual({ url: "https://example.com", key: "secret123" });
    });

    test("should return null for invalid JSON", () => {
      expect(store["parseKey"]("not a json")).toBe(null);
      expect(store["parseKey"]("")).toBe(null);
      expect(store["parseKey"]("{invalid}")).toBe(null);
    });

    test("should handle complex objects", () => {
      const jsonStr = '{"nested":{"key":"value"},"array":[1,2,3]}';
      const result = store["parseKey"](jsonStr);
      expect(result).toEqual({ nested: { key: "value" }, array: [1, 2, 3] });
    });
  });

  describe("integration with concrete implementation", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore();
    });

    test("should correctly integrate all methods", async () => {
      // Set multiple items
      await store.setItem("https://host1.com", { url: "https://host1.com", key: "key1" });
      await store.setItem("https://host2.com", { url: "https://host2.com", key: "key2" });

      // Get item
      const item1 = await store.getItem("https://host1.com");
      expect(item1?.key).toBe("key1");

      // List all entries
      const entries = await store.listEntries();
      expect(entries.length).toBe(2);

      // List items
      const items = await store.listItems();
      expect(items?.length).toBe(2);

      // Convert to map
      const itemsMap = await store.listMap();
      expect(Object.keys(itemsMap).length).toBe(2);

      // Delete item
      const deleted = await store.deleteItem("https://host1.com");
      expect(deleted).toBe(true);

      // Verify deletion
      const entries2 = await store.listEntries();
      expect(entries2.length).toBe(1);
    });

    test("should correctly handle default item", async () => {
      const defaultValue = { url: "https://default.com", key: "default-key" };
      await store.setDefaultItem(defaultValue);

      const result = await store.getDefaultItem();
      expect(result?.key).toBe("default-key");

      await store.deleteDefaultItem();
      const noDefault = await store.getDefaultItem();
      expect(noDefault).toBe(null);
    });

    test("should support fallbackToFirst option", async () => {
      await store.setItem("https://first.com", { url: "https://first.com", key: "first-key" });
      await store.setItem("https://second.com", { url: "https://second.com", key: "second-key" });

      const result = await store.getDefaultItem({ fallbackToFirst: true });
      expect(result).not.toBe(null);
      expect(result?.key).toMatch(/first-key|second-key/);
    });

    test("should return null when no default and fallbackToFirst is false", async () => {
      await store.setItem("https://example.com", { url: "https://example.com", key: "key1" });

      const result = await store.getDefaultItem({ fallbackToFirst: false });
      expect(result).toBe(null);
    });
  });
});
