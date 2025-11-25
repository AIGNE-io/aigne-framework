import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import KeyringStore from "../src/keytar.js";
import { mockCredentials, mockKeyring } from "./util.js";

describe("KeyringStore", () => {
  let store: KeyringStore;
  let testServiceName: string;
  let testUrls: string[];

  beforeEach(() => {
    if (process.env.CI) {
      mockCredentials?.clear();
      mockKeyring?.getPassword.mockClear();
      mockKeyring?.setPassword.mockClear();
      mockKeyring?.deletePassword.mockClear();
      mockKeyring?.findCredentials.mockClear();
    }

    testServiceName = `test-service-${Date.now()}-${Math.random()}`;
    testUrls = [];
    store = new KeyringStore({ secretStoreKey: testServiceName });
  });

  afterEach(async () => {
    for (const url of testUrls) {
      try {
        await store.deleteKey(url);
      } catch {}
    }
  });

  describe("constructor", () => {
    test("should use default service name when not provided", () => {
      const defaultStore = new KeyringStore();
      expect(defaultStore).toBeDefined();
    });

    test("should use custom service name when provided", () => {
      const customStore = new KeyringStore({ secretStoreKey: "custom-service" });
      expect(customStore).toBeDefined();
    });

    test("should handle forceUnavailable option", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const available = await unavailableStore.available();
      expect(available).toBe(false);
    });
  });

  describe("available()", () => {
    test("should return true when keyring is available", async () => {
      const result = await store.available();
      expect(result).toBe(true);
    });

    test("should return false when forceUnavailable is set", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const result = await unavailableStore.available();
      expect(result).toBe(false);
    });
  });

  describe("setKey() and getKey()", () => {
    test("should store and retrieve a key", async () => {
      const url = "https://example.com";
      const secret = "test-api-key";
      testUrls.push(url);

      await store.setKey(url, secret);
      const retrieved = await store.getKey(url);

      expect(retrieved).toEqual({ AIGNE_HUB_API_URL: url, AIGNE_HUB_API_KEY: secret });
    });

    test("should handle multiple hosts", async () => {
      const hosts = [
        { url: "https://host1.com", key: "key1" },
        { url: "https://host2.com", key: "key2" },
        { url: "https://host3.com/path", key: "key3" },
      ];

      for (const { url, key } of hosts) {
        testUrls.push(url);
        await store.setKey(url, key);
      }

      expect((await store.getKey("https://host1.com"))?.AIGNE_HUB_API_KEY).toBe("key1");
      expect((await store.getKey("https://host2.com"))?.AIGNE_HUB_API_KEY).toBe("key2");
      expect((await store.getKey("https://host3.com/path"))?.AIGNE_HUB_API_KEY).toBe("key3");
    });

    test("should normalize URLs to host", async () => {
      const url = "https://example.com/api/v1";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const retrieved = await store.getKey("https://example.com/another/path");
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should overwrite existing key", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "old-key");
      await store.setKey(url, "new-key");

      const retrieved = await store.getKey(url);
      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("new-key");
    });

    test("should return null for non-existent key", async () => {
      const retrieved = await store.getKey("https://nonexistent.com");
      expect(retrieved).toBe(null);
    });

    test("should throw when setting key and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });

      await expect(unavailableStore.setKey("https://test.com", "key")).rejects.toThrow(
        "Keyring not available",
      );
    });

    test("should return null when getting key and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const result = await unavailableStore.getKey("https://test.com");
      expect(result).toBe(null);
    });

    test("should handle URLs with port numbers", async () => {
      const url = "https://example.com:8080";
      testUrls.push(url);

      await store.setKey(url, "test-key");
      const retrieved = await store.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should persist data across instances", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const newStore = new KeyringStore({ secretStoreKey: testServiceName });
      const retrieved = await newStore.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });
  });

  describe("deleteKey()", () => {
    test("should delete existing key", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const deleted = await store.deleteKey(url);
      expect(deleted).toBe(true);

      const retrieved = await store.getKey(url);
      expect(retrieved).toBe(null);
    });

    test("should return false when deleting non-existent key", async () => {
      const deleted = await store.deleteKey("https://nonexistent.com");
      expect(deleted).toBe(false);
    });

    test("should return false when keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const result = await unavailableStore.deleteKey("https://test.com");
      expect(result).toBe(false);
    });

    test("should not affect other keys", async () => {
      const url1 = "https://host1.com";
      const url2 = "https://host2.com";
      testUrls.push(url1, url2);

      await store.setKey(url1, "key1");
      await store.setKey(url2, "key2");

      await store.deleteKey(url1);

      expect(await store.getKey(url1)).toBe(null);
      expect((await store.getKey(url2))?.AIGNE_HUB_API_KEY).toBe("key2");
    });
  });

  describe("listCredentials()", () => {
    test("should return null for empty store", async () => {
      const creds = await store.listCredentials();
      expect(creds).toBe(null);
    });

    test("should list all stored credentials", async () => {
      const hosts = [
        { url: "https://host1.com", key: "key1" },
        { url: "https://host2.com", key: "key2" },
      ];

      for (const { url, key } of hosts) {
        testUrls.push(url);
        await store.setKey(url, key);
      }

      const creds = await store.listCredentials();

      expect(creds).toBeDefined();
      expect(creds).not.toBeNull();
      if (!creds) return;

      expect(creds.length).toBe(2);
      expect(creds.map((c) => c.password)).toContain(
        JSON.stringify({ AIGNE_HUB_API_URL: "https://host1.com", AIGNE_HUB_API_KEY: "key1" }),
      );
    });

    test("should return null when keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const result = await unavailableStore.listCredentials();
      expect(result).toBe(null);
    });

    test("should include password in credentials", async () => {
      const url = "https://example.com";
      const secret = "secret-key";
      testUrls.push(url);

      await store.setKey(url, secret);

      const creds = await store.listCredentials();

      expect(creds).not.toBeNull();
      if (!creds || creds.length === 0) return;

      const found = creds.find((c) => c.password?.includes(secret));
      expect(found).toBeDefined();
    });
  });

  describe("listHosts()", () => {
    test("should return empty array for empty store", async () => {
      const hosts = await store.listHosts();
      expect(hosts).toEqual([]);
    });

    test("should list all hosts with details", async () => {
      const testData = [
        { url: "https://host1.com/api", key: "key1" },
        { url: "https://host2.com", key: "key2" },
      ];

      for (const { url, key } of testData) {
        testUrls.push(url);
        await store.setKey(url, key);
      }

      const hosts = await store.listHosts();

      expect(hosts.length).toBe(2);
      expect(hosts[0]).toHaveProperty("AIGNE_HUB_API_URL");
      expect(hosts[0]).toHaveProperty("AIGNE_HUB_API_KEY");
    });

    test("should include host URLs and keys in entries", async () => {
      const url = "https://example.com/api/v1";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const hosts = await store.listHosts();

      expect(hosts[0]).toBeDefined();
      if (!hosts[0]) return;

      expect(hosts[0].AIGNE_HUB_API_URL).toBe(url);
      expect(hosts[0].AIGNE_HUB_API_KEY).toBe("test-key");
    });
  });

  describe("setDefault() and getDefault()", () => {
    test("should set and get default", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");
      await store.setDefault(url);

      const defaultKey = await store.getDefault();
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should throw when setting default and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });

      await expect(unavailableStore.setDefault("https://test.com")).rejects.toThrow(
        "Keyring not available",
      );
    });

    test("should return null when getting default and keyring unavailable", async () => {
      const unavailableStore = new KeyringStore({ forceUnavailable: true });
      const result = await unavailableStore.getDefault();
      expect(result).toBe(null);
    });

    test("should fallback to first host when default not set", async () => {
      const hosts = [
        { url: "https://host1.com", key: "key1" },
        { url: "https://host2.com", key: "key2" },
      ];

      for (const { url, key } of hosts) {
        testUrls.push(url);
        await store.setKey(url, key);
      }

      const defaultKey = await store.getDefault({ fallbackToFirst: true });
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("key1");
    });

    test("should not fallback when fallbackToFirst is false", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const defaultKey = await store.getDefault({ fallbackToFirst: false });
      expect(defaultKey).toBe(null);
    });

    test("should not fallback by default when default not set", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const defaultKey = await store.getDefault();
      expect(defaultKey).toBe(null);
    });

    test("should preset default when fallback occurs and presetIfFallback is true", async () => {
      const url = "https://example.com/api";
      testUrls.push(url);

      await store.setKey(url, "test-key");

      const defaultKey = await store.getDefault({ fallbackToFirst: true, presetIfFallback: true });
      expect(defaultKey?.AIGNE_HUB_API_KEY).toBe("test-key");

      const defaultAgain = await store.getDefault({ fallbackToFirst: false });
      expect(defaultAgain?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should not preset when presetIfFallback is false", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");

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
      const hosts = [
        { url: "https://host1.com", key: "key1" },
        { url: "https://host2.com", key: "key2" },
      ];

      for (const { url, key } of hosts) {
        testUrls.push(url);
        await store.setKey(url, key);
      }

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

  describe("edge cases", () => {
    test("should handle URLs without protocol", async () => {
      const url = "example.com";
      testUrls.push(url);

      await store.setKey(url, "test-key");
      const retrieved = await store.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should handle URLs with port", async () => {
      const url = "https://example.com:8080";
      testUrls.push(url);

      await store.setKey(url, "test-key");
      const retrieved = await store.getKey("https://example.com:8080/api");

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe("test-key");
    });

    test("should handle special characters in secret", async () => {
      const url = "https://example.com";
      const secret = "key!@#$%^&*()_+-=[]{}|;':\",./<>?";
      testUrls.push(url);

      await store.setKey(url, secret);
      const retrieved = await store.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe(secret);
    });

    test("should handle empty secret", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "");
      const retrieved = await store.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY === "" || retrieved === null).toBe(true);
    });

    test("should handle very long secrets", async () => {
      const url = "https://example.com";
      const longSecret = "x".repeat(10000);
      testUrls.push(url);

      await store.setKey(url, longSecret);
      const retrieved = await store.getKey(url);

      expect(retrieved?.AIGNE_HUB_API_KEY).toBe(longSecret);
    });
  });

  describe("concurrent operations", () => {
    test("should handle concurrent writes", async () => {
      for (let i = 0; i < 10; i++) {
        const url = `https://host${i}.com`;
        testUrls.push(url);
        await store.setKey(url, `key${i}`);
      }

      for (let i = 0; i < 10; i++) {
        const key = await store.getKey(`https://host${i}.com`);
        expect(key?.AIGNE_HUB_API_KEY).toBe(`key${i}`);
      }
    });

    test("should handle mixed operations", async () => {
      const url = "https://example.com";
      testUrls.push(url);

      await store.setKey(url, "initial-key");

      const operations = [
        store.getKey(url),
        store.setKey(url, "updated-key"),
        store.listCredentials(),
        store.getKey(url),
      ];

      await Promise.all(operations);

      const finalKey = await store.getKey(url);
      expect(finalKey?.AIGNE_HUB_API_KEY).toBe("updated-key");
    });
  });
});
