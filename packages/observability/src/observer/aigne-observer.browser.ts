import { type AIGNEObserverOptions, AIGNEObserverOptionsSchema } from "../core/type.js";

export class AIGNEObserver {
  private initPort?: number;
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
    const parsed = AIGNEObserverOptionsSchema.parse(options);
    const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
    this.initPort = initPort ? Number(initPort) : undefined;
  }

  async serve(): Promise<void> {}
  async close(): Promise<void> {}
}
