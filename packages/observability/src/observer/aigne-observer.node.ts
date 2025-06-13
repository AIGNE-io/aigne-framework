import type { Server } from "node:http";
import path from "node:path";
import { trace } from "@opentelemetry/api";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { initOpenTelemetry } from "../instrument/init.js";
import { startServer } from "../server/index.js";
import detect from "../server/utils/detect-port.js";

export class AIGNEObserver {
  private server: AIGNEObserverOptions["server"];
  private storage: AIGNEObserverOptions["storage"];
  private serverInstance?: Server;
  private initPort?: number;
  public tracer = trace.getTracer("aigne-tracer");

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

    const distPath = path.join(__dirname, "../../../frontend/dist");
    if (!this.server?.port || !this.storage?.url) {
      throw new Error("Server is not configured");
    }

    const port = this.server.port;
    const detected = await detect(port);
    if (this.initPort && detected !== port) {
      throw new Error(`Port ${port} is already in use`);
    }

    initOpenTelemetry(this.storage.url);

    this.server.port = detected;

    this.serverInstance = await startServer({
      distPath,
      port: this.server.port,
      dbUrl: this.storage.url,
    });
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
