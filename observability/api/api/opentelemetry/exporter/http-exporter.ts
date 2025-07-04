import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { and, eq, isNull, or } from "drizzle-orm";
import type { TraceFormatSpans } from "../../core/type.js";
import { isBlocklet } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import { Trace } from "../../server/models/trace.js";
import { validateTraceSpans } from "./util.js";

export interface HttpExporterInterface extends SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ): Promise<void>;

  shutdown(): Promise<void>;

  upsertInitialSpan(span: ReadableSpan): Promise<void>;
}

class HttpExporter implements HttpExporterInterface {
  private dbPath?: string;
  public _db?: any;
  private upsert: (spans: TraceFormatSpans[]) => Promise<void>;

  async getDb() {
    if (isBlocklet) {
      return;
    }

    const db = await initDatabase({ url: this.dbPath, wal: true });
    await migrate(db);
    return db;
  }

  constructor({
    dbPath,
    exportFn,
  }: { dbPath?: string; exportFn?: (spans: TraceFormatSpans[]) => Promise<void> }) {
    this.dbPath = dbPath;
    this._db ??= this.getDb();
    this.upsert =
      exportFn ??
      (isBlocklet
        ? async () => {
            console.warn(
              "Please setup AIGNEObserver.setExportFn to collect tracing data from agents.",
            );
          }
        : this._upsertWithSQLite);
  }

  async _upsertWithSQLite(validatedData: TraceFormatSpans[]) {
    const db = await this._db;

    if (!db) {
      throw new Error("Database not initialized");
    }

    for (const trace of validatedData) {
      const whereClause = and(
        eq(Trace.id, trace.id),
        eq(Trace.rootId, trace.rootId),
        !trace.parentId
          ? or(isNull(Trace.parentId), eq(Trace.parentId, ""))
          : eq(Trace.parentId, trace.parentId),
      );

      try {
        const existing = await db.select().from(Trace).where(whereClause).limit(1).execute();

        if (existing.length > 0) {
          await db.update(Trace).set(trace).where(whereClause).execute();
        } else {
          await db.insert(Trace).values(trace).execute();
        }
      } catch (err) {
        console.error(`upsert spans failed for trace ${trace.id}:`, err);
      }
    }
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      await this.upsert(validateTraceSpans(spans));

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error("Failed to export spans:", error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  shutdown() {
    return Promise.resolve();
  }

  async upsertInitialSpan(span: ReadableSpan) {
    await this.upsert(validateTraceSpans([span]));
  }
}

export default HttpExporter;
