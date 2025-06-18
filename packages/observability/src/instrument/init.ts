import { NodeSDK } from "@opentelemetry/sdk-node";

import HttpApiExporter from "../exporter/http-exporter.js";
import SqliteExporter from "../exporter/sqlite-exporter.js";

export function initOpenTelemetry({
  dbUrl,
  apiUrl,
  useAPI,
}: {
  dbUrl: string;
  apiUrl?: string;
  useAPI?: boolean;
}) {
  const traceExporter = useAPI && apiUrl ? new HttpApiExporter(apiUrl) : new SqliteExporter(dbUrl);

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [],
  });

  sdk.start();
}
