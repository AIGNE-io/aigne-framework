import { afterAll, afterEach, describe, expect, mock, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AIGNE_ENV_FILE, encrypt } from "@aigne/aigne-hub";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import { loadAIGNE } from "../../src/utils/load-aigne.js";

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
  describe("loadAIGNE", () => {
    test("should load aigne successfully with default env file", async () => {
      const { url, close } = await createHonoServer();
      const mockInquirerPrompt: any = mock(async () => ({ subscribe: "official" }));

      await writeFile(AIGNE_ENV_FILE, stringify({ default: { AIGNE_HUB_API_URL: url } }));

      const path = join(import.meta.dirname, "../_mocks_");
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
      await loadAIGNE({
        path,
        options: { model: "aignehub:openai/gpt-4o" },
        actionOptions: { inquirerPromptFn: mockInquirerPrompt, runTest: true },
      });

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
