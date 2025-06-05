import type { Server } from "node:http";
import path from "node:path";
import { initDatabase } from "@aigne/sqlite";
import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { migrate } from "./migrate.js";
import traceRouter from "./routes/trace.js";

export interface StartServerOptions {
  port: number;
  dbUrl?: string;
  distPath: string;
}

export async function startServer({ port, distPath, dbUrl }: StartServerOptions): Promise<Server> {
  const db = await initDatabase({ url: dbUrl });
  await migrate(db);

  const app: express.Express = express();
  app.locals.db = db;

  app.use(express.static(distPath));
  app.use(express.json());
  app.use("/api/trace", traceRouter);

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: err.errors });
    } else {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ success: false, error: message });
    }
  });

  const server: Server = app.listen(port, () => {
    console.log(`Running observability server on http://localhost:${port}`);
  });

  return server;
}
