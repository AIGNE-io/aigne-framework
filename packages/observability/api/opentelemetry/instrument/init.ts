import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({
  serverUrl,
  dbPath,
}: { serverUrl: string; dbPath?: string }) {
  const traceExporter = new HttpExporter({ serverUrl, dbPath });
  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    spanProcessor,
    instrumentations: [],
  });

  await sdk.start();

  console.log("Observability OpenTelemetry SDK Started");

  return sdk;
}
