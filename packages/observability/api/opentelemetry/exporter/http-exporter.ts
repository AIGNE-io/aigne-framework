import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { isBlocklet } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import { Trace } from "../../server/models/trace.js";
import { validateTraceSpans } from "./util.js";

class HttpExporter implements SpanExporter {
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

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const validatedData = validateTraceSpans(spans);

      if (isBlocklet) {
        const { call } = await import("@blocklet/sdk/lib/component");
        await call({
          name: "z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh",
          method: "POST",
          path: "/api/trace/tree",
          data: validatedData,
        });
      } else {
        const db = await this._db;
        await db.insert(Trace).values(validatedData).returning({ id: Trace.id }).execute();
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
}

export default HttpExporter;
