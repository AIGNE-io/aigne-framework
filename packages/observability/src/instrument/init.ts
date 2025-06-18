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
  const useHttpExporter = useAPI && apiUrl;
  const traceExporter = useHttpExporter
    ? new HttpApiExporter(apiUrl)
    : new SqliteExporter(dbUrl, apiUrl);

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [],
  });

  sdk.start();
}
