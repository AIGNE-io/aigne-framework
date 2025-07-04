import { describe, expect, test } from "bun:test";
import { hrTime } from "@opentelemetry/core";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import { validateTraceSpans } from "../../../api/opentelemetry/exporter/util.js";

// mock span
const mockSpan: ReadableSpan = {
  name: "mock-operation",
  startTime: hrTime(),
  endTime: hrTime(),
  spanContext: () => ({
    traceId: "abc123",
    spanId: "def456",
    traceFlags: 1,
  }),
  parentSpanContext: {
    traceId: "abc123",
    spanId: "parent789",
    traceFlags: 1,
  },
  status: { code: 1 },
  attributes: {
    "custom.started_at": "1720000000000",
    "custom.trace_id": "abc123",
    "custom.span_id": "def456",
    "custom.parent_id": "parent789",
    foo: "true",
    bar: "123",
  },
  links: [],
  events: [],
  duration: [0, 0],
  resource: {} as any,
  kind: 0,
  ended: true,
  instrumentationScope: {} as any,
  droppedAttributesCount: 0,
  droppedEventsCount: 0,
  droppedLinksCount: 0,
};

describe("validateTraceSpans", () => {
  test("should parse spans into validated trace objects", () => {
    const result = validateTraceSpans([mockSpan]);

    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      id: "def456",
      rootId: "abc123",
      parentId: "parent789",
      name: "mock-operation",
      startTime: 1720000000000,
      status: { code: 1 },
      attributes: {
        foo: true,
        bar: 123,
      },
    });
  });
});
