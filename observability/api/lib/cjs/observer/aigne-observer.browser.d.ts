import { type AIGNEObserverOptions } from "../core/type.js";
export declare class AIGNEObserver {
    private initPort?;
    tracer: {
        startSpan: () => {
            spanContext: () => {
                traceId: string;
                spanId: string;
            };
            parentSpanContext: () => {
                traceId: string;
                spanId: string;
            };
            setAttribute: () => void;
            setAttributes: () => void;
            end: () => void;
            setStatus: () => void;
            setSpanContext: () => void;
        };
    };
    constructor(options?: AIGNEObserverOptions);
    serve(): Promise<void>;
    close(): Promise<void>;
}
