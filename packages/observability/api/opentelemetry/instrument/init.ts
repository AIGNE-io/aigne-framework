import { NodeSDK } from "@opentelemetry/sdk-node";

import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({ apiUrl }: { apiUrl?: string }) {
  const traceExporter = new HttpExporter(apiUrl);

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [],
  });

  await sdk.start();

  console.log("Running observability OpenTelemetry started");

  return sdk;
}
