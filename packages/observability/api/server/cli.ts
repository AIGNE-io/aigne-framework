import fs from "node:fs";
import type { Server } from "node:http";
import path from "node:path";
import express from "express";

import { type StartServerOptions, startServer } from "./base.js";

export async function startObservabilityCLIServer(
  options: StartServerOptions,
): Promise<{ app: express.Express; server: Server }> {
  const { app, server } = await startServer(options);

  app.get("/api/static/modelPricesAndContextWindow.json", (_req, res) => {
    res.set("Cache-Control", "public, max-age=86400, immutable");
    res.type("application/javascript");
    res.send(
      `window._modelPricesAndContextWindow = ${fs.readFileSync(
        // @ts-ignore
        path.join(import.meta.dirname, "./utils/modelPricesAndContextWindow.json"),
        "utf8",
      )}`,
    );
  });

  // @ts-ignore
  const distPath = path.join(import.meta.dirname, "../../../dist");
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  return { app, server };
}
