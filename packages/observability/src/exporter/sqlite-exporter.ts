import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode, hrTimeToMilliseconds } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { recordTraceBatchSchema } from "../schema.js";
import { migrate } from "../server/migrate.js";
import { Trace } from "../server/models/trace.js";

class SqliteExporter implements SpanExporter {
  private db?: LibSQLDatabase;
  private isInitialized = false;

  constructor(url: string) {
    this.initDb(url);
  }

  private async initDb(url: string) {
    try {
      this.db = (await initDatabase({ url })) as LibSQLDatabase;
      await migrate(this.db);
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    if (!this.isInitialized || !this.db) {
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    try {
      const payload = spans
        .map((span) => {
          const {
            "custom.started_at": startTime,
            "custom.trace_id": traceId,
            "custom.span_id": spanId,
            "custom.parent_id": parentId,
            ...restAttributes
          } = span.attributes;

          const parsedAttributes = Object.fromEntries(
            Object.entries(restAttributes).map(([k, v]) => {
              try {
                return [k, typeof v === "string" ? JSON.parse(v) : v];
              } catch {
                return [k, v];
              }
            }),
          );

          // console.log("================");
          // console.log("trace_id", span.spanContext().traceId === traceId);
          // console.log("span_id", span.spanContext().spanId === spanId);
          // console.log("parent_id", span.parentSpanContext?.spanId === parentId);
          // console.log("================");

          const trace = {
            id: span.spanContext().spanId,
            rootId: span.spanContext().traceId,
            parentId: span?.parentSpanContext?.spanId,
            name: span.name,
            startTime: Math.floor(hrTimeToMilliseconds(span.startTime)),
            endTime: Math.floor(hrTimeToMilliseconds(span.endTime)),
            status: span.status,
            attributes: parsedAttributes,
          };

          return trace;
        })
        .reverse();

      const validatedTraces = recordTraceBatchSchema.parse(payload);

      await this.db.insert(Trace).values(validatedTraces).returning({ id: Trace.id }).execute();

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error("Failed to export spans:", error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  shutdown() {
    return Promise.resolve();
  }
}

export default SqliteExporter;
