import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({ dbPath }: { dbPath?: string }) {
  const traceExporter = new HttpExporter({ dbPath });
  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    spanProcessor,
    instrumentations: [],
  });

  await sdk.start();

  console.log(
    "Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.",
  );

  return traceExporter;
}
