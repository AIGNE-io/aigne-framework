import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import {
  AIGNE_ENV_FILE,
  connectToAIGNEHub,
  createConnect,
  decodeEncryptionKey,
  decrypt,
  encodeEncryptionKey,
  encrypt,
  fetchConfigs,
  formatModelName,
  loadAIGNE,
} from "../../src/utils/load-aigne.js";

async function createHonoServer() {
  const port = await detect();
  const url = `http://localhost:${port}/`;

  const honoApp = new Hono();
  honoApp.post("/api/access-key/session", async (c) => {
    return c.json({
      challenge: "test",
      accessKeyId: "test",
      accessKeySecret: "test",
      id: "test",
    });
  });

  honoApp.get("/api/access-key/session", async (c) => {
    const requestCount = parseInt(c.req.header("X-Request-Count") || "0");
    if (requestCount === 0) {
      return c.json({});
    } else {
      return c.json({
        challenge: "test",
        accessKeyId: "test",
        accessKeySecret: encrypt("test", "test", "test"),
      });
    }
  });

  honoApp.delete("/api/access-key/session", async (c) => {
    const body = {};
    return c.json(body);
  });

  const app = new Hono();
  app.route("/.well-known/service", honoApp);
  app.route("/", honoApp);
  app.get("/__blocklet__.js", async (c) => {
    return c.json({
      componentMountPoints: [
        { did: "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ", mountPoint: "/ai-kit" },
      ],
    });
  });

  const server = serve({ port, fetch: app.fetch });

  return {
    url,
    close: () => server.stop(true),
  };
}

describe("load aigne", () => {
  const mockOpen = mock(() => {
    console.log("Mocked open called");
  });

  mock.module("open", () => ({
    default: mockOpen,
  }));

  describe("Encryption Functions", () => {
    describe("encodeEncryptionKey", () => {
      test("should encode encryption key correctly", () => {
        const key = "test-key-123";
        const encoded = encodeEncryptionKey(key);

        expect(encoded).toBeDefined();
        expect(typeof encoded).toBe("string");
        expect(encoded).not.toContain("+");
        expect(encoded).not.toContain("/");
        expect(encoded).not.toContain("=");
      });

      test("should handle empty string", () => {
        const encoded = encodeEncryptionKey("");
        expect(encoded).toBe("");
      });

      test("should handle special characters", () => {
        const key = "test+key/with=special";
        const encoded = encodeEncryptionKey(key);

        expect(encoded).toBeDefined();
        expect(encoded).not.toContain("+");
        expect(encoded).not.toContain("/");
        expect(encoded).not.toContain("=");
      });
    });

    describe("decodeEncryptionKey", () => {
      test("should decode encryption key correctly", () => {
        const originalKey = "test-key-123";
        const encoded = encodeEncryptionKey(originalKey);
        const decoded = decodeEncryptionKey(encoded);

        expect(decoded).toBeInstanceOf(Uint8Array);
        expect(Buffer.from(decoded).toString()).toBe(originalKey);
      });

      test("should handle empty string", () => {
        const decoded = decodeEncryptionKey("");
        expect(decoded).toBeInstanceOf(Uint8Array);
        expect(decoded.length).toBe(0);
      });

      test("should round-trip encode and decode", () => {
        const testKeys = [
          "simple-key",
          "key-with-special+chars",
          "key/with/path",
          "key=with=equals",
          "key+with+plus+and/slash/and=equals",
          "1234567890",
          "!@#$%^&*()",
          "中文测试",
          "🚀 emoji test 🎉",
        ];

        for (const key of testKeys) {
          const encoded = encodeEncryptionKey(key);
          const decoded = decodeEncryptionKey(encoded);
          expect(Buffer.from(decoded).toString()).toBe(key);
        }
      });
    });

    describe("encrypt and decrypt", () => {
      test("should encrypt and decrypt message correctly", () => {
        const message = "Hello, World!";
        const salt = "test-salt";
        const iv = "test-iv";

        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);

        expect(encrypted).toBeDefined();
        expect(typeof encrypted).toBe("string");
        expect(encrypted).not.toBe(message);
        expect(decrypted).toBe(message);
      });

      test("should handle empty message", () => {
        const message = "";
        const salt = "test-salt";
        const iv = "test-iv";

        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);

        expect(encrypted).toBeDefined();
        expect(decrypted).toBe(message);
      });

      test("should handle special characters in message", () => {
        const message = "Hello! @#$%^&*() 中文 🚀";
        const salt = "test-salt";
        const iv = "test-iv";

        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);

        expect(decrypted).toBe(message);
      });

      test("should handle different salt and iv combinations", () => {
        const message = "Test message";
        const testCases = [
          { salt: "salt1", iv: "iv1" },
          { salt: "salt2", iv: "iv2" },
          { salt: "long-salt-value", iv: "long-iv-value" },
          { salt: "special+chars", iv: "special/chars" },
          { salt: "中文salt", iv: "中文iv" },
        ];

        for (const { salt, iv } of testCases) {
          const encrypted = encrypt(message, salt, iv);
          const decrypted = decrypt(encrypted, salt, iv);
          expect(decrypted).toBe(message);
        }
      });

      test("should produce different encrypted results for same message with different salt/iv", () => {
        const message = "Same message";
        const encrypted1 = encrypt(message, "salt1", "iv1");
        const encrypted2 = encrypt(message, "salt2", "iv2");
        const encrypted3 = encrypt(message, "salt1", "iv2");

        expect(encrypted1).not.toBe(encrypted2);
        expect(encrypted1).not.toBe(encrypted3);
        expect(encrypted2).not.toBe(encrypted3);
      });

      test("should handle large messages", () => {
        const message = `${"A".repeat(1000)}Large·message·with·repeated·characters`;
        const salt = "test-salt";
        const iv = "test-iv";

        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);

        expect(decrypted).toBe(message);
      });

      test("should handle unicode characters", () => {
        const messages = [
          "Hello 世界",
          "Привет мир",
          "こんにちは世界",
          "안녕하세요 세계",
          "مرحبا بالعالم",
          "🚀 Rocket emoji 🎉",
          "Mixed: Hello 世界 🚀 123 !@#",
        ];

        const salt = "test-salt";
        const iv = "test-iv";

        for (const message of messages) {
          const encrypted = encrypt(message, salt, iv);
          const decrypted = decrypt(encrypted, salt, iv);
          expect(decrypted).toBe(message);
        }
      });
    });

    describe("Integration tests", () => {
      test("should work with real-world scenario", () => {
        // Simulate a real-world scenario where we encode a key, then use it for encryption
        const originalKey = "my-secret-api-key-12345";
        const encodedKey = encodeEncryptionKey(originalKey);
        const decodedKey = decodeEncryptionKey(encodedKey);

        const message = "Sensitive data that needs encryption";
        const salt = "application-salt";
        const iv = "session-iv";

        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);

        expect(Buffer.from(decodedKey).toString()).toBe(originalKey);
        expect(decrypted).toBe(message);
      });

      test("should handle multiple encryption/decryption cycles", () => {
        const message = "Original message";
        const salt = "test-salt";
        const iv = "test-iv";

        let currentMessage = message;

        // Perform multiple encryption/decryption cycles
        for (let i = 0; i < 5; i++) {
          const encrypted = encrypt(currentMessage, salt, iv);
          const decrypted = decrypt(encrypted, salt, iv);
          expect(decrypted).toBe(currentMessage);
          currentMessage = encrypted; // Use encrypted as input for next cycle
        }
      });
    });
  });

  describe("formatModelName", () => {
    const originalEnv = process.env.NODE_ENV;
    beforeAll(() => {
      process.env.NODE_ENV = "dev";
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    const mockInquirerPrompt: any = mock(async () => ({ useAigneHub: true }));

    const createMockModel = (name: string, apiKeyEnvName?: string) => ({
      name,
      apiKeyEnvName,
      create: mock(() => ({})),
    });

    const mockModels: any = [
      createMockModel("openai", "OPENAI_API_KEY"),
      createMockModel("anthropic", "ANTHROPIC_API_KEY"),
      createMockModel("gemini", "GEMINI_API_KEY"),
      createMockModel("ollama"),
      createMockModel("aignehub"),
    ];

    afterEach(() => {
      mockInquirerPrompt.mockClear();
    });

    test("should return model as-is when NODE_ENV is test", async () => {
      process.env.OPENAI_API_KEY = undefined;

      const result = await formatModelName(mockModels, "openai:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-4");
    });

    test("should return default aignehub model when no model provided", async () => {
      const result = await formatModelName(mockModels, "", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-4o");
    });

    test("should return model as-is when provider is aignehub", async () => {
      const result = await formatModelName(mockModels, "aignehub:openai/gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:openai/gpt-4");
    });

    test("should return model as-is when provider contains aignehub", async () => {
      const result = await formatModelName(
        mockModels,
        "my-aignehub:openai/gpt-4",
        mockInquirerPrompt,
      );

      expect(result).toBe("my-aignehub:openai/gpt-4");
    });

    test("should throw error for unsupported model", async () => {
      await expect(
        formatModelName(mockModels, "unsupported:gpt-4", mockInquirerPrompt),
      ).rejects.toThrow("Unsupported model: unsupported gpt-4");
    });

    test("should handle case-insensitive model matching", async () => {
      const result = await formatModelName(mockModels, "OPENAI:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:OPENAI/gpt-4");
    });

    test("should handle providers with hyphens", async () => {
      const result = await formatModelName(mockModels, "open-ai:gpt-4", mockInquirerPrompt);
      expect(result).toBe("aignehub:open-ai/gpt-4");
    });

    test("should handle complex model names", async () => {
      process.env.ANTHROPIC_API_KEY = undefined;

      const result = await formatModelName(
        mockModels,
        "anthropic:claude-3-sonnet",
        mockInquirerPrompt,
      );

      expect(result).toBe("aignehub:anthropic/claude-3-sonnet");
    });

    test("should handle models with special characters", async () => {
      const result = await formatModelName(
        mockModels,
        "openai:gpt-4-turbo-preview",
        mockInquirerPrompt,
      );

      expect(result).toBe("aignehub:openai/gpt-4-turbo-preview");
    });
  });

  describe("fetchConfigs", () => {
    test("should fetch configs successfully", async () => {
      const { url, close } = await createHonoServer();
      const configs = await fetchConfigs({
        connectUrl: url,
        sessionId: "test",
        fetchInterval: 1000,
        fetchTimeout: 5000,
      });

      expect(configs).toBeDefined();
      expect(configs.accessKeyId).toBe("test");
      expect(configs.accessKeySecret).toBe("test");
      expect(configs.challenge).toBe("test");
      close();
    });
  });

  describe("createConnect", () => {
    test("should create connection successfully", async () => {
      const { url, close } = await createHonoServer();
      const mockOpenPage = mock(() => {});

      const result = await createConnect({ connectUrl: url, openPage: mockOpenPage });

      expect(result).toBeDefined();
      expect(result.accessKeyId).toBe("test");
      expect(result.accessKeySecret).toBe("test");

      expect(mockOpenPage).toHaveBeenCalledWith(
        expect.stringContaining(`${url}connect-cli?__token__=`),
      );

      close();
    });
  });

  describe("connectToAIGNEHub", () => {
    test("should create connection successfully", async () => {
      const { url, close } = await createHonoServer();
      const result = await connectToAIGNEHub(url);

      expect(result).toBeDefined();
      expect(result.apiKey).toBe("test");
      expect(result.url).toBe(joinURL(url, "ai-kit"));

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));

      await rm(AIGNE_ENV_FILE, { force: true });
      close();
    });
  });

  describe("loadAIGNE", () => {
    test("should load aigne successfully with default env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      await writeFile(AIGNE_ENV_FILE, stringify({ default: { AIGNE_HUB_API_URL: url } }));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with default env file with custom url", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async (data) => {
        if (data.type === "input") {
          return { customUrl: url };
        }
        return { subscribe: "custom" };
      });

      await writeFile(AIGNE_ENV_FILE, stringify({ default: { AIGNE_HUB_API_URL: url } }));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with empty env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(AIGNE_ENV_FILE, stringify({}));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no host env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          test: {
            AIGNE_HUB_API_KEY: "123",
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));
      close();
    });

    test("should load aigne successfully with no host key env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          [new URL(url).host]: {
            AIGNE_HUB_API_KEY1: "123",
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      close();
    });

    test("should load aigne successfully with no host key env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      process.env.AIGNE_HUB_API_URL = url;
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          [new URL(url).host]: {
            AIGNE_HUB_API_KEY: "123",
            AIGNE_HUB_API_URL: url,
          },
        }),
      );

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE(
        path,
        { model: "aignehub:openai/gpt-4o" },
        { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      );

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("123");
      close();
    });

    afterEach(async () => {
      await rm(AIGNE_ENV_FILE, { force: true });
    });
  });

  afterAll(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });
});
