import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";

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

  constructor(options?: AIGNEObserverOptions) {
    AIGNEObserverOptionsSchema.parse(options);
  }

  async serve(): Promise<void> {}
  async close(): Promise<void> {}
}
