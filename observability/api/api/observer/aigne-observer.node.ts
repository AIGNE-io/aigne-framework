import type { Span } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";
import type { NodeSDK } from "@opentelemetry/sdk-node";
import type { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import getObservabilityDbPath from "../core/db-path.js";
import type { AttributeParams, TraceFormatSpans } from "../core/type.js";
import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import type HttpExporter from "../opentelemetry/exporter/http-exporter.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";

export class AIGNEObserver {
  private storage?: AIGNEObserverOptions["storage"];
  public tracer = trace.getTracer("aigne-tracer");
  public processor: SimpleSpanProcessor | undefined;
  public exporter: HttpExporter | undefined;
  private sdkServerStarted: Promise<void> | undefined;
  sdk: NodeSDK | undefined;

  static exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;
  static setExportFn(exportFn: (spans: TraceFormatSpans[]) => Promise<void>) {
    AIGNEObserver.exportFn = exportFn;
  }

  static updateFn?: (id: string, data: AttributeParams) => Promise<void>;
  static setUpdateFn(updateFn: (id: string, data: AttributeParams) => Promise<void>) {
    AIGNEObserver.updateFn = updateFn;
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

    const { sdk, spanProcessor, traceExporter } = await initOpenTelemetry({
      dbPath: this.storage,
      exportFn: AIGNEObserver.exportFn,
      updateFn: AIGNEObserver.updateFn,
    });

    this.sdk = sdk;
    this.processor = spanProcessor;
    this.exporter = traceExporter;
  }

  async flush(span: Span): Promise<void> {
    await this.processor?.onEnd(span as any);
    await this.processor?.forceFlush();
  }

  async update(id: string, data: AttributeParams) {
    await this.exporter?.update(id, data);
  }

  async close(contextIds: string[] = []): Promise<void> {
    try {
      await this.exporter?.shutdown(contextIds);
      this.processor = undefined;
      this.sdk = undefined;
      this.sdkServerStarted = undefined;
    } catch (error) {
      console.error("[Observability] Error during shutdown:", error);
    }
  }
}
