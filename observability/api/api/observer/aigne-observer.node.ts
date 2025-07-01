import { trace } from "@opentelemetry/api";
import getObservabilityDbPath from "../core/db-path.js";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import type { HttpExporterInterface } from "../opentelemetry/exporter/http-exporter.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";

export class AIGNEObserver {
  private server: AIGNEObserverOptions["server"];
  private storage: AIGNEObserverOptions["storage"];
  private initPort?: number;
  public tracer = trace.getTracer("aigne-tracer");
  public traceExporter: HttpExporterInterface | undefined;
  private sdkServerStarted: Promise<void> | undefined;

  constructor(options?: AIGNEObserverOptions) {
    const params = { ...(options ?? {}) };

    if (!params?.storage?.url && !isBlocklet) {
      params.storage = { url: getObservabilityDbPath() };
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
    if (!this.storage?.url) {
      throw new Error("Server storage url is not configured");
    }

    this.traceExporter = await initOpenTelemetry({ dbPath: this.storage.url });
  }

  async close(): Promise<void> {}
}
