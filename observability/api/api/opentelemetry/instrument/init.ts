import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import chalk from "chalk";
import type { TraceFormatSpans } from "../../core/type.js";
import HttpExporter from "../exporter/http-exporter.js";

export async function initOpenTelemetry({
  dbPath,
  observeExportsFunction,
}: {
  dbPath?: string;
  observeExportsFunction?: (spans: TraceFormatSpans[]) => Promise<void>;
}) {
  const traceExporter = new HttpExporter({ dbPath, observeExportsFunction });
  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new NodeSDK({
    spanProcessor,
    instrumentations: [],
  });

  await sdk.start();

  console.log(
    `Install the CLI first with: ${chalk.greenBright("npm install -g @aigne/cli")}, then run ${chalk.greenBright(
      "aigne observe",
    )} to start the observability server.`,
  );

  return traceExporter;
}
