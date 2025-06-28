import fs from "node:fs";
import type { Server } from "node:http";
import path from "node:path";
import type express from "express";

import { type StartServerOptions, startServer } from "./base.js";

export async function startObservabilityBlockletServer(
  options: StartServerOptions,
): Promise<{ app: express.Express; server: Server }> {
  const { app, server } = await startServer(options);

  app.get("/api/static/modelPricesAndContextWindow.json", (_req, res) => {
    res.set("Cache-Control", "public, max-age=86400, immutable");
    res.type("application/javascript");
    res.send(
      `window._modelPricesAndContextWindow = ${fs.readFileSync(path.join(__dirname, "./utils/modelPricesAndContextWindow.json"), "utf8")}`,
    );
  });

  return { app, server };
}
