import { describe, expect, it, jest } from "bun:test";
import { ExportResultCode, hrTime } from "@opentelemetry/core";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import HttpExporter from "../../../api/opentelemetry/exporter/http-exporter.js";

const createMockSpan = (_id: string): ReadableSpan => ({
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
});

const mockExportFn = jest.fn(() => Promise.resolve());

describe("HttpExporter", () => {
  it("should call exportFn with validated spans", async () => {
    const exporter = new HttpExporter({ exportFn: mockExportFn });

    const span = createMockSpan("abc123");
    await exporter.export([span], ({ code }) => {
      expect(code).toBe(ExportResultCode.SUCCESS);
    });

    expect(mockExportFn).toHaveBeenCalledTimes(1);
  });

  it("should call upsertInitialSpan", async () => {
    const exporter = new HttpExporter({ exportFn: mockExportFn });

    const span = createMockSpan("xyz789");
    await exporter.upsertInitialSpan(span);

    expect(mockExportFn).toHaveBeenCalledWith(expect.any(Array));
  });
});
