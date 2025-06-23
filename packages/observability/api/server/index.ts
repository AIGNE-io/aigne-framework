import type { Server } from "node:http";
import path from "node:path";
import { initDatabase } from "@aigne/sqlite";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express, { type NextFunction, type Request, type Response } from "express";
import SSE from "express-sse";

import { z } from "zod";

import { ZodError } from "zod";
import { isBlocklet } from "../core/util.js";
import { migrate } from "./migrate.js";
import traceRouter from "./routes/trace.js";

const sse = new SSE();

dotenv.config();

const startServerOptionsSchema = z.object({
  port: z.number().int().positive(),
  dbUrl: z.string().min(1),
  distPath: z.string(),
});

export type StartServerOptions = z.infer<typeof startServerOptionsSchema>;

export async function startServer(
  options: StartServerOptions,
): Promise<{ app: express.Express; server: Server }> {
  const { port, distPath, dbUrl } = startServerOptionsSchema.parse(options);

  const db = await initDatabase({ url: dbUrl });
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

  if (!isBlocklet) {
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

  const server: Server = app.listen(Number(port), () => {
    console.log(`Running observability server on http://localhost:${port}`);
  });

  return { app, server };
}
