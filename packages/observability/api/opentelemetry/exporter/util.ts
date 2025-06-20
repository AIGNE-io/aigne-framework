import { hrTimeToMilliseconds } from "@opentelemetry/core";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

import { recordTraceBatchSchema } from "../../core/schema.js";

export const formatSpans = (spans: ReadableSpan[]) => {
  const payload = spans
    .map((span) => {
      const {
        "custom.started_at": startTime,
        "custom.trace_id": traceId,
        "custom.span_id": spanId,
        "custom.parent_id": parentId,
        ...restAttributes
      } = span.attributes;

      const parsedAttributes = Object.fromEntries(
        Object.entries(restAttributes).map(([k, v]) => {
          try {
            return [k, typeof v === "string" ? JSON.parse(v) : v];
          } catch {
            return [k, v];
          }
        }),
      );

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
        startTime: Math.floor(hrTimeToMilliseconds(span.startTime)),
        endTime: Math.floor(hrTimeToMilliseconds(span.endTime)),
        status: span.status,
        attributes: parsedAttributes,
      };

      return trace;
    })
    .reverse();

  const validatedTraces = recordTraceBatchSchema.parse(payload);

  return validatedTraces;
};
