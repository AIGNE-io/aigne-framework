import { trace } from "@opentelemetry/api";
import getObservabilityDbPath from "../core/db-path.js";
import type { TraceFormatSpans } from "../core/type.js";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import type { HttpExporterInterface } from "../opentelemetry/exporter/http-exporter.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";

export class AIGNEObserver {
  private storage?: AIGNEObserverOptions["storage"];
  public tracer = trace.getTracer("aigne-tracer");
  public traceExporter: HttpExporterInterface | undefined;
  private sdkServerStarted: Promise<void> | undefined;

  static exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;

  static setExportFn(exportFn: (spans: TraceFormatSpans[]) => Promise<void>) {
    AIGNEObserver.exportFn = exportFn;
  }

  constructor(options?: AIGNEObserverOptions) {
    const parsed = AIGNEObserverOptionsSchema.parse(options);
    this.storage = parsed?.storage ?? (!isBlocklet ? getObservabilityDbPath() : undefined);
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
      exportFn: AIGNEObserver.exportFn,
    });
  }

  async close(): Promise<void> {}
}
