import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { TraceFormatSpans } from "../../core/type.js";
import { insertTrace, isBlocklet } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import getAIGNEHomePath from "../../server/utils/image-home-path.js";
import saveFiles from "../../server/utils/save-files.js";
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
    this.upsert = exportFn ?? (isBlocklet ? async () => {} : this._upsertWithSQLite);
  }

  async _upsertWithSQLite(validatedData: TraceFormatSpans[]) {
    const db = await this._db;
    if (!db) throw new Error("Database not initialized");

    for (const trace of validatedData) {
      const dataDir = getAIGNEHomePath();

      for (const key of ["files", "images"]) {
        const items = trace.attributes?.output?.[key];
        if (trace?.attributes?.output?.[key] && items?.length) {
          trace.attributes.output[key] = await saveFiles(items, { dataDir });
        }
      }

      await insertTrace(db, trace);
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
      console.warn(
        "[Observability] Failed to export spans:",
        error.cause?.message || error.message,
      );
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  shutdown() {
    return Promise.resolve();
  }
}

export default HttpExporter;
