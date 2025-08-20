import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import { AIGNE_ENV_FILE } from "../../../src/utils/aigne-hub/constants.js";
import {
  checkConnectionStatus,
  connectToAIGNEHub,
  createConnect,
  fetchConfigs,
  loadAIGNEHubCredential as loadCredential,
} from "../../../src/utils/aigne-hub/credential.js";
import { createHonoServer } from "../../_mocks_/server.js";

describe("credential util functions", () => {
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

  afterAll(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });
});

describe("credential", () => {
  beforeEach(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });

  describe("checkConnectionStatus", () => {
    test("should throw error when AIGNE_ENV_FILE does not exist", async () => {
      await expect(checkConnectionStatus("test-host")).rejects.toThrow(
        "AIGNE_HUB_API_KEY file not found, need to login first",
      );
    });

    test("should throw error when file exists but does not contain AIGNE_HUB_API_KEY", async () => {
      const testContent = { otherKey: "value" };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      await expect(checkConnectionStatus("test-host")).rejects.toThrow(
        "AIGNE_HUB_API_KEY key not found, need to login first",
      );
    });

    test("should throw error when host not found in config", async () => {
      const testContent = {
        "other-host": {
          AIGNE_HUB_API_KEY: "test-key",
          AIGNE_HUB_API_URL: "https://other-host.com",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      await expect(checkConnectionStatus("test-host")).rejects.toThrow(
        "AIGNE_HUB_API_KEY host not found, need to login first",
      );
    });

    test("should throw error when host exists but AIGNE_HUB_API_KEY is missing", async () => {
      const testContent = {
        "test-host": {
          AIGNE_HUB_API_URL: "https://test-host.com",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      await expect(checkConnectionStatus("test-host")).rejects.toThrow(
        "AIGNE_HUB_API_KEY key not found, need to login first",
      );
    });

    test("should return credentials when valid config exists", async () => {
      const testContent = {
        "test-host": {
          AIGNE_HUB_API_KEY: "test-api-key",
          AIGNE_HUB_API_URL: "https://test-host.com/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await checkConnectionStatus("test-host");

      expect(result).toEqual({
        apiKey: "test-api-key",
        url: "https://test-host.com/ai-kit",
      });
    });

    test("should handle multiple hosts correctly", async () => {
      const testContent = {
        host1: {
          AIGNE_HUB_API_KEY: "key1",
          AIGNE_HUB_API_URL: "https://host1.com/ai-kit",
        },
        host2: {
          AIGNE_HUB_API_KEY: "key2",
          AIGNE_HUB_API_URL: "https://host2.com/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result1 = await checkConnectionStatus("host1");
      const result2 = await checkConnectionStatus("host2");

      expect(result1).toEqual({
        apiKey: "key1",
        url: "https://host1.com/ai-kit",
      });
      expect(result2).toEqual({
        apiKey: "key2",
        url: "https://host2.com/ai-kit",
      });
    });
  });

  describe("loadCredential", async () => {
    const { url, close } = await createHonoServer();

    test("should use custom inquirer prompt function when provided", async () => {
      const mockInquirerPrompt = mock(async (prompt: any) => {
        if (prompt.name === "subscribe") {
          return { subscribe: "custom" };
        }

        if (prompt.name === "customUrl") {
          return { customUrl: url };
        }

        return {};
      });

      const testContent = {
        default: {
          AIGNE_HUB_API_URL: joinURL(url, "ai-kit"),
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential({
        inquirerPromptFn: mockInquirerPrompt,
      });

      expect(result).toEqual({
        apiKey: "test",
        url: joinURL(url, "ai-kit"),
      });

      await close();
    });
  });

  describe("loadCredential", async () => {
    const { url, close } = await createHonoServer();

    beforeEach(async () => {
      await rm(AIGNE_ENV_FILE, { force: true });
    });

    test("should return undefined when BLOCKLET environment variables are set", async () => {
      process.env.BLOCKLET_AIGNE_API_URL = "https://blocklet.com";
      process.env.BLOCKLET_AIGNE_API_PROVIDER = "openai";

      const result = await loadCredential();

      expect(result).toBeUndefined();

      delete process.env.BLOCKLET_AIGNE_API_URL;
      delete process.env.BLOCKLET_AIGNE_API_PROVIDER;
    });

    test("should return credentials when AIGNE Hub model and valid connection exist", async () => {
      const testContent = {
        "hub.aigne.io": {
          AIGNE_HUB_API_KEY: "test-key",
          AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential();

      expect(result).toEqual({
        apiKey: "test-key",
        url: "https://hub.aigne.io/ai-kit",
      });
    });

    test("should return credentials when model contains aignehub (case insensitive)", async () => {
      const testContent = {
        "hub.aigne.io": {
          AIGNE_HUB_API_KEY: "test-key",
          AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential();

      expect(result).toEqual({
        apiKey: "test-key",
        url: "https://hub.aigne.io/ai-kit",
      });
    });

    test("should use custom aigneHubUrl when provided", async () => {
      const testContent = {
        "custom-hub.com": {
          AIGNE_HUB_API_KEY: "custom-key",
          AIGNE_HUB_API_URL: "https://custom-hub.com/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential({
        aigneHubUrl: "https://custom-hub.com",
      });

      expect(result).toEqual({
        apiKey: "custom-key",
        url: "https://custom-hub.com/ai-kit",
      });
    });

    test("should use AIGNE_HUB_API_URL environment variable when available", async () => {
      process.env.AIGNE_HUB_API_URL = url;

      const testContent = {
        "env-hub.com": {
          AIGNE_HUB_API_KEY: "env-key",
          AIGNE_HUB_API_URL: joinURL(url, "ai-kit"),
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential();

      expect(result).toEqual({
        apiKey: "test",
        url: joinURL(url, "ai-kit"),
      });
    });

    test("should handle official hub subscription choice", async () => {
      const mockInquirerPrompt = mock(async (prompt: any) => {
        if (prompt.name === "subscribe") {
          return { subscribe: "official" };
        }
        return {};
      });

      const result = await loadCredential({
        inquirerPromptFn: mockInquirerPrompt,
      });

      expect(result).toEqual({
        apiKey: "test",
        url: joinURL(url, "ai-kit"),
      });
    });

    test("should handle manual configuration choice and exit", async () => {
      const mockInquirerPrompt = mock(async (prompt: any) => {
        if (prompt.name === "subscribe") {
          return { subscribe: "manual" };
        }
        return {};
      });

      const mockExit = mock((code?: number) => {
        throw new Error(`Process exit called with code: ${code}`);
      });
      const originalExit = process.exit;
      process.exit = mockExit;

      try {
        await loadCredential({
          inquirerPromptFn: mockInquirerPrompt,
        });
      } catch {
        // Expected to exit
      }

      process.exit = originalExit;
    });

    test("should handle custom URL input with validation", async () => {
      const mockInquirerPrompt = mock(async (prompt: any) => {
        if (prompt.name === "subscribe") {
          return { subscribe: "custom" };
        }
        if (prompt.name === "customUrl") {
          return { customUrl: url };
        }
        return {};
      });

      const result = await loadCredential({
        inquirerPromptFn: mockInquirerPrompt,
      });

      expect(result).toEqual({
        apiKey: "test",
        url: joinURL(url, "ai-kit"),
      });
    });

    test("should handle connectToAIGNEHub error gracefully", async () => {
      const mockInquirerPrompt = mock(async (prompt: any) => {
        if (prompt.name === "subscribe") {
          return { subscribe: "official" };
        }
        return {};
      });

      const result = await loadCredential({
        inquirerPromptFn: mockInquirerPrompt,
      });

      expect(result).toEqual({ apiKey: "test", url: joinURL(url, "ai-kit") });
    });

    test("should handle case insensitive model name matching", async () => {
      const testContent = {
        "hub.aigne.io": {
          AIGNE_HUB_API_KEY: "test-key",
          AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
        },
      };
      await writeFile(AIGNE_ENV_FILE, stringify(testContent));

      const result = await loadCredential();

      expect(result).toEqual({
        apiKey: "test",
        url: joinURL(url, "ai-kit"),
      });
    });

    afterAll(async () => {
      await close();
    });
  });
});
