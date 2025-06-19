import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { joinURL } from "ufo";
import { isBlocklet } from "../../core/util.js";
import { formatSpans } from "./util.js";

class HttpExporter implements SpanExporter {
  private apiUrl?: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl;
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const validatedTraces = formatSpans(spans);

      console.log("======================");

      if (isBlocklet) {
        console.log("isBlocklet===============", validatedTraces);
      } else {
        if (this.apiUrl) {
          await fetch(joinURL(this.apiUrl, "/api/trace/tree"), {
            method: "POST",
            body: JSON.stringify(validatedTraces),
            headers: {
              "Content-Type": "application/json",
            },
          });
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
