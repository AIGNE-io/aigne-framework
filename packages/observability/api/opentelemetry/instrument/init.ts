import { NodeSDK } from "@opentelemetry/sdk-node";

import HttpExporter from "../exporter/http-exporter.js";

export function initOpenTelemetry({ serverUrl, dbPath }: { serverUrl: string; dbPath?: string }) {
  const traceExporter = new HttpExporter({ serverUrl, dbPath });

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [],
  });

  sdk.start();

  console.log("Observability OpenTelemetry SDK Started");

  return sdk;
}
