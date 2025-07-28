import type { Span } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";
import type { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import getObservabilityDbPath from "../core/db-path.js";
import type { TraceFormatSpans } from "../core/type.js";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";

export class AIGNEObserver {
  private storage?: AIGNEObserverOptions["storage"];
  public tracer = trace.getTracer("aigne-tracer");
  public processor: SimpleSpanProcessor | undefined;
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

    this.processor = await initOpenTelemetry({
      dbPath: this.storage,
      exportFn: AIGNEObserver.exportFn,
    });
  }

  async flush(span: Span): Promise<void> {
    await this.processor?.onEnd(span as any);
    await this.processor?.forceFlush();
  }

  async close(): Promise<void> {}
}
