//@ts-ignore
import { call } from "@blocklet/sdk/lib/component";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { joinURL } from "ufo";
import { isBlocklet } from "../../core/util.js";
import { formatSpans } from "./util.js";

class HttpExporter implements SpanExporter {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
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
        const res = await fetch(joinURL(this.apiUrl, "/api/trace/tree"), {
          method: "POST",
          body: JSON.stringify(validatedTraces),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("res===============", res);
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
