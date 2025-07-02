import { trace } from "@opentelemetry/api";
import getObservabilityDbPath from "../core/db-path.js";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import type { TraceFormatSpans } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import type { HttpExporterInterface } from "../opentelemetry/exporter/http-exporter.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";

export class AIGNEObserver {
  private storage?: AIGNEObserverOptions["storage"];
  public tracer = trace.getTracer("aigne-tracer");
  public traceExporter: HttpExporterInterface | undefined;
  private sdkServerStarted: Promise<void> | undefined;
  private observeExportsFunction: ((spans: TraceFormatSpans[]) => Promise<void>) | undefined;

  constructor(options?: AIGNEObserverOptions) {
    const parsed = AIGNEObserverOptionsSchema.parse(options);
    this.storage = parsed?.storage ?? (!isBlocklet ? getObservabilityDbPath() : undefined);
    this.observeExportsFunction = parsed?.observeExportsFunction;
  }

  async serve(): Promise<void> {
    this.sdkServerStarted ??= this._serve();
    return this.sdkServerStarted;
  }

  async _serve(): Promise<void> {
    if (!this.storage && !isBlocklet) {
      throw new Error("Server storage is not configured");
    }

    this.traceExporter = await initOpenTelemetry({
      dbPath: this.storage,
      observeExportsFunction: this.observeExportsFunction,
    });
  }

  async close(): Promise<void> {}
}
