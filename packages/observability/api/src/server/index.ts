import type { Server } from "node:http";
import path from "node:path";
import { initDatabase } from "@aigne/sqlite";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import SSE from "express-sse";

import { ZodError } from "zod";
import { migrate } from "./migrate.js";
import traceRouter from "./routes/trace.js";
export interface StartServerOptions {
  port?: number;
  dbUrl?: string;
  distPath?: string;
}

const sse = new SSE();

dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";

export async function startServer({ port, distPath, dbUrl }: StartServerOptions): Promise<{
  app: express.Express;
  server: Server;
}> {
  const isBlocklet = !!process.env.BLOCKLET_APP_DIR;

  const dbPath = process.env.BLOCKLET_DATA_DIR
    ? path.join("file:", process.env.BLOCKLET_DATA_DIR, "observer.db")
    : dbUrl;
  if (!dbPath) {
    throw new Error("server db path is required");
  }

  const db = await initDatabase({ url: dbPath });
  await migrate(db);

  const app: express.Express = express();
  app.locals.db = db;

  app.set("trust proxy", true);
  app.use(cookieParser());
  app.use(express.json({ limit: "1 mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1 mb" }));
  app.use(cors());

  app.get("/api/sse", sse.init);
  app.use("/api/trace", traceRouter(sse));

  if (isBlocklet) {
    const blockletAppDir = process.env.BLOCKLET_APP_DIR;
    if (isProduction && blockletAppDir) {
      const staticDir = path.resolve(blockletAppDir, "dist");
      app.use(express.static(staticDir, { maxAge: "30d", index: false }));
      app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(staticDir, "index.html"));
      });

      app.use(<ErrorRequestHandler>((_err, _req, res, _next) => {
        res.status(500).send("Something broke!");
      }));
    }
  } else {
    if (!distPath) {
      throw new Error("distPath is required in development");
    }

    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: err.errors });
    } else {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ success: false, error: message });
    }
  });

  const serverPort = process.env.BLOCKLET_PORT || port;
  if (!serverPort) {
    throw new Error("server port is required");
  }

  const server: Server = app.listen(Number(serverPort), () => {
    console.log(`Running observability server on http://localhost:${port}`);
  });

  return { app, server };
}
