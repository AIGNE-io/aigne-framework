import path from "node:path";
import { startServer as startObservabilityServer } from "@aigne/observability/server";
import fallback from "@blocklet/sdk/lib/middlewares/fallback";
import dotenv from "dotenv-flow";
import express from "express";
import chat from "./routes/chat.js";

dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";

const startServer = async () => {
  const { app, server } = await startObservabilityServer({
    port: Number(process.env.BLOCKLET_PORT) || 3000,
    dbUrl: path.join("file:", process.env.BLOCKLET_DATA_DIR || "", "observer.db"),
    distPath: "",
  });

  app.use("/api", chat);

  const BLOCKLET_APP_DIR = process.env.BLOCKLET_APP_DIR;
  if (isProduction && BLOCKLET_APP_DIR) {
    const staticDir = path.resolve(BLOCKLET_APP_DIR, "dist");
    app.use(express.static(staticDir, { maxAge: "30d", index: false }));
    app.use(fallback("index.html", { root: staticDir }));
  }

  return { app, server };
};

if (isProduction) {
  startServer();
}

export default startServer;
