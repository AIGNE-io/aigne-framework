"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTraceSpans = void 0;
const core_1 = require("@opentelemetry/core");
const schema_js_1 = require("../../core/schema.js");
const validateTraceSpans = (spans) => {
    const payload = spans
        .map((span) => {
        const { "custom.started_at": startTime, "custom.trace_id": _traceId, "custom.span_id": _spanId, "custom.parent_id": _parentId, ...restAttributes } = span.attributes;
        const parsedAttributes = Object.fromEntries(Object.entries(restAttributes).map(([k, v]) => {
            try {
                return [k, typeof v === "string" ? JSON.parse(v) : v];
            }
            catch {
                return [k, v];
            }
        }));
        // console.log("================");
        // console.log("trace_id", span.spanContext().traceId === traceId);
        // console.log("span_id", span.spanContext().spanId === spanId);
        // console.log("parent_id", span.parentSpanContext?.spanId === parentId);
        // console.log("================");
        const trace = {
            id: span.spanContext().spanId,
            rootId: span.spanContext().traceId,
            parentId: span?.parentSpanContext?.spanId,
            name: span.name,
            startTime: Number.isNaN(Number(startTime))
                ? Math.floor((0, core_1.hrTimeToMilliseconds)(span.startTime))
                : Number(startTime),
            endTime: Math.floor((0, core_1.hrTimeToMilliseconds)(span.endTime)),
            status: span.status,
            attributes: parsedAttributes,
        };
        return trace;
    })
        .reverse();
    const validatedTraces = schema_js_1.recordTraceBatchSchema.parse(payload);
    return validatedTraces;
};
exports.validateTraceSpans = validateTraceSpans;
