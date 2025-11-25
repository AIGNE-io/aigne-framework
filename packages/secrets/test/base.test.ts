import { beforeEach, describe, expect, test } from "bun:test";
import { BaseSecretStore } from "../src/base.js";
import type { AIGNEHubAPIInfo, CredentialEntry, GetDefaultOptions } from "../src/types.js";

class TestSecretStore<
  K extends string = "AIGNE_HUB_API_KEY",
  U extends string = "AIGNE_HUB_API_URL",
> extends BaseSecretStore<K, U> {
  private storage = new Map<string, { url: string; key: string }>();
  private defaultValue: string | null = null;

  async available(): Promise<boolean> {
    return true;
  }

  async setKey(url: string, secret: string): Promise<void> {
    const host = this.normalizeHostFrom(url);
    this.storage.set(host, { url, key: secret });
  }

  async getKey(url: string): Promise<AIGNEHubAPIInfo<K, U> | null> {
    const host = this.normalizeHostFrom(url);
    const data = this.storage.get(host);
    if (!data) return null;

    return {
      [this.outputConfig.url]: data.url,
      [this.outputConfig.key]: data.key,
    } as AIGNEHubAPIInfo<K, U>;
  }

  async deleteKey(url: string): Promise<boolean> {
    const host = this.normalizeHostFrom(url);
    return this.storage.delete(host);
  }

  async listCredentials(): Promise<CredentialEntry[] | null> {
    const entries: CredentialEntry[] = [];
    for (const [account, data] of this.storage.entries()) {
      entries.push({ account, password: data.key });
    }
    return entries;
  }

  async listHosts(): Promise<AIGNEHubAPIInfo<K, U>[]> {
    const hosts: AIGNEHubAPIInfo<K, U>[] = [];
    for (const data of this.storage.values()) {
      hosts.push({
        [this.outputConfig.url]: data.url,
        [this.outputConfig.key]: data.key,
      } as AIGNEHubAPIInfo<K, U>);
    }
    return hosts;
  }

  async setDefault(value: string): Promise<void> {
    this.defaultValue = value;
  }

  async getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo<K, U> | null> {
    if (this.defaultValue) {
      return this.getKey(this.defaultValue);
    }
    if (options?.fallbackToFirst) {
      const hosts = await this.listHosts();
      return hosts[0] || null;
    }
    return null;
  }

  async deleteDefault(): Promise<void> {
    this.defaultValue = null;
  }
}

describe("BaseSecretStore", () => {
  describe("constructor", () => {
    test("should use default outputConfig", () => {
      const store = new TestSecretStore({});
      expect(store.outputConfig.key).toBe("AIGNE_HUB_API_KEY");
      expect(store.outputConfig.url).toBe("AIGNE_HUB_API_URL");
    });

    test("should use custom outputConfig", () => {
      const store = new TestSecretStore<"CUSTOM_API_KEY", "CUSTOM_API_URL">({
        outputConfig: {
          key: "CUSTOM_API_KEY",
          url: "CUSTOM_API_URL",
        },
      });
      expect(store.outputConfig.key).toBe("CUSTOM_API_KEY");
      expect(store.outputConfig.url).toBe("CUSTOM_API_URL");
    });

    test("should handle partial custom outputConfig", () => {
      const store = new TestSecretStore<"CUSTOM_KEY", "AIGNE_HUB_API_URL">({
        outputConfig: {
          key: "CUSTOM_KEY",
          url: "AIGNE_HUB_API_URL",
        },
      });
      expect(store.outputConfig.key).toBe("CUSTOM_KEY");
      expect(store.outputConfig.url).toBe("AIGNE_HUB_API_URL");
    });
  });

  describe("normalizeHostFrom", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore({});
    });

    test("should extract host from complete URL", () => {
      expect(store.normalizeHostFrom("https://example.com")).toBe("example.com");
      expect(store.normalizeHostFrom("https://api.example.com:8080")).toBe("api.example.com:8080");
      expect(store.normalizeHostFrom("http://localhost:3000/path")).toBe("localhost:3000");
    });

    test("should handle URLs with paths", () => {
      expect(store.normalizeHostFrom("https://example.com/api/v1")).toBe("example.com");
      expect(store.normalizeHostFrom("https://example.com/path/to/resource?query=value")).toBe(
        "example.com",
      );
    });

    test("should handle URLs with ports", () => {
      // Default ports are omitted (443 for https, 80 for http)
      expect(store.normalizeHostFrom("https://example.com:443")).toBe("example.com");
      expect(store.normalizeHostFrom("http://example.com:80")).toBe("example.com");
      // Non-default ports are preserved
      expect(store.normalizeHostFrom("http://example.com:8080")).toBe("example.com:8080");
      expect(store.normalizeHostFrom("https://example.com:8443")).toBe("example.com:8443");
    });

    test("should handle invalid URL input", () => {
      expect(store.normalizeHostFrom("not-a-url")).toBe("not-a-url");
      expect(store.normalizeHostFrom("")).toBe("");
      expect(store.normalizeHostFrom("just-text")).toBe("just-text");
    });

    test("should handle URLs with user info", () => {
      expect(store.normalizeHostFrom("https://user:pass@example.com")).toBe("example.com");
    });

    test("should handle URLs with hash", () => {
      expect(store.normalizeHostFrom("https://example.com/path#section")).toBe("example.com");
    });

    test("should handle IPv4 addresses", () => {
      expect(store.normalizeHostFrom("http://192.168.1.1:8080")).toBe("192.168.1.1:8080");
    });

    test("should handle IPv6 addresses", () => {
      expect(store.normalizeHostFrom("http://[::1]:8080")).toBe("[::1]:8080");
    });
  });

  describe("listHostsMap", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore({});
    });

    test("should return empty object when no hosts", async () => {
      const result = await store.listHostsMap();
      expect(result).toEqual({});
    });

    test("should convert hosts list to map", async () => {
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");
      await store.setKey("https://host3.com/path", "key3");

      const result = await store.listHostsMap();

      expect(result["host1.com"]).toEqual({
        AIGNE_HUB_API_URL: "https://host1.com",
        AIGNE_HUB_API_KEY: "key1",
      });
      expect(result["host2.com"]).toEqual({
        AIGNE_HUB_API_URL: "https://host2.com",
        AIGNE_HUB_API_KEY: "key2",
      });
      expect(result["host3.com"]).toEqual({
        AIGNE_HUB_API_URL: "https://host3.com/path",
        AIGNE_HUB_API_KEY: "key3",
      });
    });

    test("should use custom outputConfig keys", async () => {
      const customStore = new TestSecretStore<"MY_KEY", "MY_URL">({
        outputConfig: {
          key: "MY_KEY",
          url: "MY_URL",
        },
      });

      await customStore.setKey("https://example.com", "secret123");

      const result = await customStore.listHostsMap();

      expect(result["example.com"]?.MY_URL).toBe("https://example.com");
      expect(result["example.com"]?.MY_KEY).toBe("secret123");
    });

    test("should handle hosts with ports", async () => {
      await store.setKey("https://example.com:8080", "key1");
      await store.setKey("https://example.com:9090", "key2");

      const result = await store.listHostsMap();

      expect(result["example.com:8080"]).toBeDefined();
      expect(result["example.com:9090"]).toBeDefined();
      expect(result["example.com:8080"]?.AIGNE_HUB_API_KEY).toBe("key1");
      expect(result["example.com:9090"]?.AIGNE_HUB_API_KEY).toBe("key2");
    });

    test("should correctly handle URL normalization", async () => {
      await store.setKey("https://example.com/api/v1", "key1");

      const result = await store.listHostsMap();

      expect(result["example.com"]).toBeDefined();
      expect(result["example.com"]?.AIGNE_HUB_API_URL).toBe("https://example.com/api/v1");
    });

    test("should handle multiple paths on same host", async () => {
      // normalizeHostFrom normalizes different paths on the same host to the same host
      // Later settings will overwrite earlier ones
      await store.setKey("https://example.com/api/v1", "key1");
      await store.setKey("https://example.com/api/v2", "key2");

      const result = await store.listHostsMap();

      // Later settings overwrite
      expect(Object.keys(result).length).toBe(1);
      expect(result["example.com"]?.AIGNE_HUB_API_KEY).toBe("key2");
    });
  });

  describe("integration with concrete implementation", () => {
    let store: TestSecretStore;

    beforeEach(() => {
      store = new TestSecretStore({});
    });

    test("should correctly integrate all methods", async () => {
      // Set multiple keys
      await store.setKey("https://host1.com", "key1");
      await store.setKey("https://host2.com", "key2");

      // Get key
      const key1 = await store.getKey("https://host1.com");
      expect(key1?.AIGNE_HUB_API_KEY).toBe("key1");

      // List all hosts
      const hosts = await store.listHosts();
      expect(hosts.length).toBe(2);

      // Convert to map
      const hostsMap = await store.listHostsMap();
      expect(Object.keys(hostsMap).length).toBe(2);

      // Delete key
      const deleted = await store.deleteKey("https://host1.com");
      expect(deleted).toBe(true);

      // Verify deletion
      const hosts2 = await store.listHosts();
      expect(hosts2.length).toBe(1);
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

    test("should support fallbackToFirst option", async () => {
      await store.setKey("https://first.com", "first-key");
      await store.setKey("https://second.com", "second-key");

      const result = await store.getDefault({ fallbackToFirst: true });
      expect(result).not.toBe(null);
      expect(result?.AIGNE_HUB_API_KEY).toMatch(/first-key|second-key/);
    });
  });
});
