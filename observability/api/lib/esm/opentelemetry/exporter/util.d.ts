import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
export declare const validateTraceSpans: (spans: ReadableSpan[]) => {
    status: Record<string, any>;
    id: string;
    name: string;
    rootId: string;
    startTime: number;
    endTime: number;
    attributes: Record<string, any>;
    parentId?: string | undefined;
    links?: any[] | undefined;
    events?: any[] | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
}[];
