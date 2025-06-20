import { initDatabase } from "@aigne/sqlite";
//@ts-ignore
import { call } from "@blocklet/sdk/lib/component";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { joinURL } from "ufo";
import { isBlocklet } from "../../core/util.js";
import { Trace } from "../../server/models/trace.js";
import { formatSpans } from "./util.js";

class HttpExporter implements SpanExporter {
  private serverUrl: string;
  private dbPath?: string;

  constructor({ serverUrl, dbPath }: { serverUrl: string; dbPath?: string }) {
    this.serverUrl = serverUrl;
    this.dbPath = dbPath;
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const validatedTraces = formatSpans(spans);

      if (isBlocklet) {
        await call({
          name: "observability",
          method: "POST",
          path: "/api/trace/tree",
          data: validatedTraces,
        });
      } else {
        const url = joinURL(this.serverUrl, "/api/trace/tree");
        console.log("url ===============", url);

        const res = await fetch(url, {
          method: "POST",
          body: JSON.stringify(validatedTraces),
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("fetch result ===============", res.ok);

        if (!res.ok) {
          // fallback to local db save
          const db = await initDatabase({ url: this.dbPath });
          await db.insert(Trace).values(validatedTraces).returning({ id: Trace.id }).execute();
          console.log("inserted into db");
        }
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
