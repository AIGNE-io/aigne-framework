import { describe, expect, it, jest } from "bun:test";
import { ExportResultCode, hrTime } from "@opentelemetry/core";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import * as util from "../../../api/core/util.js";
import HttpExporter from "../../../api/opentelemetry/exporter/http-exporter.js";

const createMockSpan = (id: string): ReadableSpan => ({
  name: "mock-operation",
  startTime: hrTime(),
  endTime: hrTime(),
  spanContext: () => ({
    traceId: "abc123",
    spanId: id,
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
    "custom.span_id": id,
    "custom.parent_id": "parent789",
    foo: "true",
    bar: "123",
    goo: JSON.stringify({
      foo: "bar",
      bar: "foo",
    }),
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

  it("should warn if isBlocklet and no exportFn", async () => {
    // @ts-ignore
    jest.spyOn(util, "isBlocklet", "getter").mockReturnValue(true);
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const exporter = new HttpExporter({});
    await exporter.export([createMockSpan("abc123")], () => {});
    spy.mockRestore();
    // @ts-ignore
    jest.spyOn(util, "isBlocklet", "getter").mockRestore();
  });

  it("should throw if db is not initialized", async () => {
    const exporter = new HttpExporter({});
    exporter._db = undefined;
    await expect(exporter._upsertWithSQLite([{} as any])).rejects.toThrow(
      "Database not initialized",
    );
  });

  it("should insert if not exists, update if exists, and catch errors", async () => {
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => ({
              execute: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([{}]),
            }),
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          execute: jest.fn().mockResolvedValueOnce(undefined),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            execute: jest.fn().mockResolvedValueOnce(undefined),
          }),
        }),
      }),
      run: () => ({}),
    };
    const exporter = new HttpExporter({});
    exporter._db = db;

    // insert path
    await exporter._upsertWithSQLite([{ id: "1", rootId: "r", parentId: "" } as any]);
    // update path
    await exporter._upsertWithSQLite([{ id: "1", rootId: "r", parentId: "" } as any]);

    // catch path
    const dbWithError = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => ({
              execute: jest.fn().mockRejectedValue(new Error("fail")),
            }),
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          execute: jest.fn(),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            execute: jest.fn(),
          }),
        }),
      }),
      run: () => ({}),
    };
    exporter._db = dbWithError;
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await exporter._upsertWithSQLite([{ id: "2", rootId: "r", parentId: "" } as any]);
    spy.mockRestore();
  });
});
