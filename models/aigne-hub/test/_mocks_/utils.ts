import { serve } from "bun";
import { detect } from "detect-port";
import { Hono } from "hono";
import { encrypt } from "../../src/index.js";

export async function createHonoServer() {
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
