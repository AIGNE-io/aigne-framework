import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type { TraceFormatSpans } from "../../core/type.js";
import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({
  dbPath,
  exportFn,
}: {
  dbPath?: string;
  exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;
}) {
  const traceExporter = new HttpExporter({ dbPath, exportFn });
  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    spanProcessor,
    instrumentations: [],
  });

  sdk.start();

  return spanProcessor;
}
