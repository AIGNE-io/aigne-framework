import path from "node:path";
import { startObservabilityBlockletServer } from "@aigne/observability/server";
import middleware from "@blocklet/sdk/lib/middlewares";
import fallback from "@blocklet/sdk/lib/middlewares/fallback";
import dotenv from "dotenv-flow";
import express, { type Request, type Response, type NextFunction } from "express";

dotenv.config({ silent: true });

const ADMIN_ROLES = ["owner", "admin"];

function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role && ADMIN_ROLES.includes(req.user?.role)) {
    return next();
  }

  res.status(403).json({ error: "Permission denied" });
  return;
}

const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";

const startServer = async () => {
  const { app, server } = await startObservabilityBlockletServer({
    port: Number(process.env.BLOCKLET_PORT) || 3000,
    dbUrl: path.join("file:", process.env.BLOCKLET_DATA_DIR || "", "observer.db"),
    traceTreeMiddleware: [middleware.session({ accessKey: true }), requireAdminRole],
  });

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
