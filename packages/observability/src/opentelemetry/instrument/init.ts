import { NodeSDK } from "@opentelemetry/sdk-node";

import HttpExporter from "../exporter/http-exporter.js";

export function initOpenTelemetry({ apiUrl }: { apiUrl?: string }) {
  const traceExporter = new HttpExporter(apiUrl);

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [],
  });

  sdk.start();
}
