import { NodeSDK } from "@opentelemetry/sdk-node";

import SqliteExporter from "../exporter/sqlite-exporter.js";

export function initOpenTelemetry(dbUrl: string) {
  const sdk = new NodeSDK({
    traceExporter: new SqliteExporter(dbUrl),
    instrumentations: [],
  });

  sdk.start();
}
