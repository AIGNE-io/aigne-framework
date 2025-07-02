import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";
import type { TraceFormatSpans } from "../core/type.js";

export class AIGNEObserver {
  public tracer = {
    startSpan: () => {
      return {
        spanContext: () => ({ traceId: "", spanId: "" }),
        parentSpanContext: () => ({ traceId: "", spanId: "" }),
        setAttribute: () => {},
        setAttributes: () => {},
        end: () => {},
        setStatus: () => {},
        setSpanContext: () => {},
      };
    },
  };

  static exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;

  static setExportFn(exportFn: (spans: TraceFormatSpans[]) => Promise<void>) {
    AIGNEObserver.exportFn = exportFn;
  }

  constructor(options?: AIGNEObserverOptions) {
    AIGNEObserverOptionsSchema.parse(options);
  }

  async serve(): Promise<void> {}
  async close(): Promise<void> {}
}
