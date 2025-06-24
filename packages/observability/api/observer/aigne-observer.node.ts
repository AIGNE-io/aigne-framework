import { existsSync, mkdirSync } from "node:fs";
import type { Server } from "node:http";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { trace } from "@opentelemetry/api";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";
import { startServer } from "../server/index.js";
import detect from "../server/utils/detect-port.js";

export class AIGNEObserver {
  private server: AIGNEObserverOptions["server"];
  private storage: AIGNEObserverOptions["storage"];
  private serverInstance?: Server;
  private initPort?: number;
  public tracer = trace.getTracer("aigne-tracer");
  public traceExporter: SpanExporter | undefined;
  private sdkServerStarted: Promise<void> | undefined;

  constructor(options?: AIGNEObserverOptions) {
    const params = { ...(options ?? {}) };

    if (!params?.storage?.url) {
      const AIGNE_OBSERVER_DIR = join(homedir(), ".aigne", "observability");
      if (!existsSync(AIGNE_OBSERVER_DIR)) {
        mkdirSync(AIGNE_OBSERVER_DIR, { recursive: true });
      }
      const dbFilePath = resolve(AIGNE_OBSERVER_DIR, "observer.db");
      const dbUrl = `file://${dbFilePath.replace(/\\/g, "/")}`;
      params.storage = { url: dbUrl };
    }

    const parsed = AIGNEObserverOptionsSchema.parse(params);
    const host = parsed.server?.host ?? process.env.AIGNE_OBSERVER_HOST ?? "localhost";
    const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
    this.initPort = initPort ? Number(initPort) : undefined;
    const port = this.initPort ?? 7890;
    this.server = { host, port };
    this.storage = parsed.storage;
  }

  async serve(): Promise<void> {
    this.sdkServerStarted ??= this._serve();
    return this.sdkServerStarted;
  }

  async _serve(): Promise<void> {
    if (!this.server?.port || !this.storage?.url) {
      throw new Error("Server is not configured");
    }

    const port = this.server.port;
    const detected = await detect(port);
    if (this.initPort && detected !== port) {
      throw new Error(`Port ${port} is already in use`);
    }
    this.server.port = detected;

    this.traceExporter = await initOpenTelemetry({
      serverUrl: `http://localhost:${this.server.port}`,
      dbPath: this.storage.url,
    });

    if (isBlocklet) return;

    this.serverInstance = (
      await startServer({ port: this.server.port, dbUrl: this.storage.url })
    ).server;
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
}
