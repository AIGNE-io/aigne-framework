import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { sql } from "drizzle-orm";
import type { TraceFormatSpans } from "../../core/type.js";
import { isBlocklet } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import { validateTraceSpans } from "./util.js";

export interface HttpExporterInterface extends SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ): Promise<void>;

  shutdown(): Promise<void>;
}

class HttpExporter implements HttpExporterInterface {
  private dbPath?: string;
  public _db?: any;
  private upsert: (spans: TraceFormatSpans[]) => Promise<void>;

  async getDb() {
    if (isBlocklet) return;

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
    if (!db) throw new Error("Database not initialized");

    for (const trace of validatedData) {
      const insertSql = sql`
        INSERT INTO Trace (
          id,
          rootId,
          parentId,
          name,
          startTime,
          endTime,
          attributes,
          status,
          userId,
          sessionId,
          componentId,
          action
        ) VALUES (
          ${trace.id},
          ${trace.rootId},
          ${trace.parentId || null},
          ${trace.name},
          ${trace.startTime},
          ${trace.endTime},
          ${JSON.stringify(trace.attributes)},
          ${JSON.stringify(trace.status)},
          ${trace.userId || null},
          ${trace.sessionId || null},
          ${trace.componentId || null},
          ${trace.action || null}
        )
        ON CONFLICT(id)
        DO UPDATE SET
          name = excluded.name,
          startTime = excluded.startTime,
          endTime = excluded.endTime,
          attributes = excluded.attributes,
          status = excluded.status,
          userId = excluded.userId,
          sessionId = excluded.sessionId,
          componentId = excluded.componentId,
          action = excluded.action;
      `;

      await db?.run?.(insertSql);
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
}

export default HttpExporter;
