import { initDatabase } from "@aigne/sqlite";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { joinURL, withQuery } from "ufo";
import { migrate } from "../server/migrate.js";
import { Trace } from "../server/models/trace.js";
import { formatSpans } from "./util.js";

class SqliteExporter implements SpanExporter {
  private db?: LibSQLDatabase;
  private isInitialized = false;
  private apiUrl?: string;

  constructor(url: string, apiUrl?: string) {
    this.initDb(url);
    this.apiUrl = apiUrl;
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
      const validatedTraces = formatSpans(spans);

      await this.db.insert(Trace).values(validatedTraces).returning({ id: Trace.id }).execute();

      if (this.apiUrl) {
        fetch(withQuery(joinURL(this.apiUrl, "/api/ws"), { type: "event", data: {} }));
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

export default SqliteExporter;
