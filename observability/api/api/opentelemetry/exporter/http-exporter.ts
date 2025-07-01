import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { and, eq, isNull, or } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { isBlocklet } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import { Trace } from "../../server/models/trace.js";
import { validateTraceSpans } from "./util.js";

type TraceInsertOrUpdateData = InferInsertModel<typeof Trace>;

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
  private _db?: any;

  async getDb() {
    const db = await initDatabase({ url: this.dbPath });
    await migrate(db);
    return db;
  }

  constructor({ dbPath }: { dbPath?: string }) {
    this.dbPath = dbPath;
    this._db ??= this.getDb();
  }

  async _upsertWithSQLite(spans: ReadableSpan[]) {
    const validatedData = validateTraceSpans(spans);

    const db = await this._db;

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

  async _upsertWithBlocklet(validatedData: TraceInsertOrUpdateData[]) {
    const { call } = await import("@blocklet/sdk/lib/component/index.js");
    await call({
      name: "z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh",
      method: "POST",
      path: "/api/trace/tree",
      data: validatedData,
    });
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const validatedData = validateTraceSpans(spans);

      if (isBlocklet) {
        await this._upsertWithBlocklet(validatedData);
      } else {
        await this._upsertWithSQLite(spans);
      }

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
    if (isBlocklet) {
      const validatedData = validateTraceSpans([span]);
      await this._upsertWithBlocklet(validatedData);
    } else {
      await this._upsertWithSQLite([span]);
    }
  }
}

export default HttpExporter;
