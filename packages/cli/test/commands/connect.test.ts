import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFile, rm, writeFile } from "node:fs/promises";
import { AIGNE_ENV_FILE, encrypt } from "@aigne/aigne-hub";
import {
  createConnectCommand,
  displayStatus,
  getConnectionStatus,
} from "@aigne/cli/commands/connect.js";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import yargs from "yargs";

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
  const mockOpen = mock(() => {});
  mock.module("open", () => ({ default: mockOpen }));
  mock.module("../../src/utils/aigne-hub-user.ts", () => ({
    getUserInfo: async () => ({
      user: {
        fullName: "test",
        email: "test@test.com",
        did: "z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ",
      },
      creditBalance: { balance: 100, total: 100 },
      paymentLink: "https://test.com",
    }),
  }));

  afterEach(async () => {
    await rm(AIGNE_ENV_FILE, { force: true });
  });

  describe("loadAIGNE", () => {
    test("should connect to aigne hub successfully", async () => {
      const { url, close } = await createHonoServer();
      const command = yargs().command(createConnectCommand());
      await command.parseAsync(["connect", "--url", url]);

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));

      close();
    });

    test("should connect to aigne hub successfully", async () => {
      const command = yargs().command(createConnectCommand());
      await command.parseAsync(["", "connect", "status"]);
      await rm(AIGNE_ENV_FILE, { force: true });
      await command.parseAsync(["", "connect", "status"]);
    });
  });

  describe("getConnectionStatus", () => {
    test("should return empty array when env file does not exist", async () => {
      await rm(AIGNE_ENV_FILE, { force: true });
      const result = await getConnectionStatus();
      expect(result).toEqual([]);
    });

    test("should return empty array when env file is invalid", async () => {
      await writeFile(AIGNE_ENV_FILE, stringify({}));
      const result = await getConnectionStatus();
      expect(result).toEqual([]);
    });

    test("should return status list when env file is valid", async () => {
      await writeFile(
        AIGNE_ENV_FILE,
        stringify({
          "hub.aigne.io": {
            AIGNE_HUB_API_KEY: "test-key",
            AIGNE_HUB_API_URL: "https://hub.aigne.io/ai-kit",
          },
          "test.example.com": {
            AIGNE_HUB_API_KEY: "another-key",
            AIGNE_HUB_API_URL: "https://test.example.com/ai-kit",
          },
        }),
      );

      const result = await getConnectionStatus();

      expect(result).toEqual([
        {
          host: "hub.aigne.io",
          apiKey: "test-key",
          apiUrl: "https://hub.aigne.io/ai-kit",
        },
        {
          host: "test.example.com",
          apiKey: "another-key",
          apiUrl: "https://test.example.com/ai-kit",
        },
      ]);
    });
  });

  describe("displayStatus", () => {
    test("should display no connections message when status list is empty", async () => {
      const mockConsoleLog = mock(() => {});
      const originalConsoleLog = console.log;
      console.log = mockConsoleLog;

      try {
        await displayStatus([]);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining("No AIGNE Hub connections found"),
        );
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining("Use 'aigne connect <url>' to connect to a hub"),
        );
      } finally {
        console.log = originalConsoleLog;
      }
    });

    test("should display connection status for valid connections", async () => {
      const mockConsoleLog = mock(() => {});
      const originalConsoleLog = console.log;
      console.log = mockConsoleLog;

      try {
        await displayStatus([
          {
            host: "hub.aigne.io",
            apiKey: "test-key",
            apiUrl: "https://hub.aigne.io/ai-kit",
          },
        ]);

        const loggedCalls = mockConsoleLog.mock.calls.map((call: any) => call[0]);

        expect(loggedCalls.some((call: any) => call.includes("AIGNE Hub Connection Status"))).toBe(
          true,
        );
        expect(loggedCalls.some((call: any) => call.includes("hub.aigne.io"))).toBe(true);
      } finally {
        console.log = originalConsoleLog;
      }
    });
  });
});
