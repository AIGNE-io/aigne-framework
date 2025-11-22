import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type { AttributeParams, TraceFormatSpans } from "../../core/type.js";
import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({
  dbPath,
  exportFn,
  updateFn,
}: {
  dbPath?: string;
  exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;
  updateFn?: (id: string, data: AttributeParams) => Promise<void>;
}) {
  const traceExporter = new HttpExporter({ dbPath, exportFn, updateFn });
  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    spanProcessor,
    instrumentations: [],
  });

  sdk.start();

  return {
    sdk,
    spanProcessor,
    traceExporter,
  };
}
