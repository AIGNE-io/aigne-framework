import { describe, expect, mock, test } from "bun:test";
import { readFile, rm } from "node:fs/promises";
import { createConnectCommand } from "@aigne/cli/commands/connect.js";
import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { joinURL } from "ufo";
import { parse, stringify } from "yaml";
import { AIGNE_ENV_FILE, encrypt } from "../../src/utils/load-aigne.js";

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
      user: { fullName: "test", email: "test@test.com" },
      creditBalance: { balance: 100, total: 100 },
      paymentLink: "https://test.com",
    }),
  }));

  describe("loadAIGNE", () => {
    test("should connect to aigne hub successfully", async () => {
      const { url, close } = await createHonoServer();
      const command = createConnectCommand();
      await command.parseAsync(["", "connect", "--url", url]);

      const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
      const env = envs[new URL(url).host];

      expect(env).toBeDefined();
      expect(env.AIGNE_HUB_API_KEY).toBe("test");
      expect(env.AIGNE_HUB_API_URL).toBe(joinURL(url, "ai-kit"));

      close();
    });

    test("should connect to aigne hub successfully", async () => {
      const command = createConnectCommand();
      await command.parseAsync(["", "connect", "status"]);
      await rm(AIGNE_ENV_FILE, { force: true });
      await command.parseAsync(["", "connect", "status"]);
    });
  });
});
