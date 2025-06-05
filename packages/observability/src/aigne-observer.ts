import type { Server } from "node:http";
import path from "node:path";
import { initDatabase } from "@aigne/sqlite";
import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { z } from "zod";
import { recordTraceSchema, updateTraceSchema } from "./schema.js";
import { startServer } from "./server/index.js";
import { migrate } from "./server/migrate.js";
import { Trace } from "./server/models/trace.js";
import detect from "./server/utils/detect-port.js";

const AIGNEObserverOptionsSchema = z
  .object({
    server: z
      .object({
        host: z.string().optional(),
        port: z.number().optional(),
      })
      .optional(),
    storage: z.object({ url: z.string() }).optional().default({ url: "file:observer.sqlite3" }),
  })
  .optional()
  .default({});

type AIGNEObserverOptions = z.infer<typeof AIGNEObserverOptionsSchema>;

export class AIGNEObserver {
  private server: AIGNEObserverOptions["server"];
  private storage: AIGNEObserverOptions["storage"];
  private serverInstance?: Server;
  private initPort?: number;
  private db?: LibSQLDatabase;

  constructor(options?: AIGNEObserverOptions) {
    const parsed = AIGNEObserverOptionsSchema.parse(options);
    const host = parsed.server?.host ?? process.env.AIGNE_OBSERVER_HOST ?? "localhost";
    const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
    this.initPort = initPort ? Number(initPort) : undefined;
    const port = this.initPort ?? 7890;
    this.server = { host, port };
    this.storage = parsed.storage;
  }

  async serve(): Promise<void> {
    if (this.serverInstance) return;

    const distPath = path.join(__dirname, "../../frontend/dist");
    if (!this.server?.port || !this.storage?.url) {
      throw new Error("Server is not configured");
    }

    const port = this.server.port;
    const detected = await detect(port);
    if (this.initPort && detected !== port) {
      throw new Error(`Port ${port} is already in use`);
    }
    this.server.port = detected;

    this.serverInstance = await startServer({
      distPath,
      port: this.server.port,
      dbUrl: this.storage.url,
    });
  }

  private async ensureDb() {
    if (!this.db) {
      this.db = (await initDatabase({ url: this.storage.url })) as LibSQLDatabase;
      await migrate(this.db);
    }
  }

  private getDbOrThrow(): LibSQLDatabase {
    if (!this.db) throw new Error("Database is not initialized");
    return this.db;
  }

  async close(): Promise<void> {
    if (typeof window !== "undefined") return;
    if (!this.serverInstance) return;

    const server = this.serverInstance;
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    this.serverInstance = undefined;
  }

  async record(params: typeof recordTraceSchema._type): Promise<{ success: boolean; id: string }> {
    await this.ensureDb();
    const db = this.getDbOrThrow();
    const parsed = recordTraceSchema.parse(params);
    const result = await db
      .insert(Trace)
      .values({ ...parsed, input: JSON.stringify(parsed.input) })
      .returning({ id: Trace.id })
      .execute();
    return { success: true, id: result[0]?.id ?? "" };
  }

  async update(params: typeof updateTraceSchema._type): Promise<{ success: boolean }> {
    await this.ensureDb();
    const db = this.getDbOrThrow();
    const parsed = updateTraceSchema.parse(params);
    const { id, ...rest } = parsed;
    const fields = ["output", "error", "metadata"];
    const toUpdate = Object.fromEntries(
      Object.entries(rest)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, fields.includes(key) ? JSON.stringify(value) : value]),
    );
    await db.update(Trace).set(toUpdate).where(eq(Trace.id, id)).execute();
    return { success: true };
  }
}
