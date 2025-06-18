import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { joinURL } from "ufo";
import { formatSpans } from "./util.js";

class HttpApiExporter implements SpanExporter {
  constructor(private apiUrl: string) {}

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const validatedTraces = formatSpans(spans);

      await fetch(joinURL(this.apiUrl, "/api/trace/tree"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedTraces),
      });

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

export default HttpApiExporter;
