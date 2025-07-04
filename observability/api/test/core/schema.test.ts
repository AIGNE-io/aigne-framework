import { expect, test } from "bun:test";
import { recordTraceBatchSchema, recordTraceSchema } from "../../api/core/schema.js";

const validTrace = {
  id: "trace-1",
  rootId: "root-1",
  name: "test-trace",
  startTime: 1710000000,
  endTime: 1710000010,
  status: { code: "OK" },
  attributes: { foo: "bar" },
};

test("recordTraceSchema: valid trace passes validation", () => {
  const result = recordTraceSchema.safeParse(validTrace);
  expect(result.success).toBe(true);
});

test("recordTraceSchema: missing required field fails validation", () => {
  const invalidTrace = { ...validTrace } as Omit<typeof validTrace, "id"> & { id?: string };
  delete invalidTrace.id;
  const result = recordTraceSchema.safeParse(invalidTrace);
  expect(result.success).toBe(false);
});

test("recordTraceSchema: wrong type fails validation", () => {
  const invalidTrace = { ...validTrace, startTime: "not-a-number" };
  const result = recordTraceSchema.safeParse(invalidTrace);
  expect(result.success).toBe(false);
});

test("recordTraceSchema: optional fields are optional", () => {
  const minimalTrace = {
    id: "trace-2",
    rootId: "root-2",
    name: "minimal",
    startTime: 1,
    endTime: 2,
    status: {},
    attributes: {},
  };
  const result = recordTraceSchema.safeParse(minimalTrace);
  expect(result.success).toBe(true);
});

test("recordTraceBatchSchema: array of valid traces passes", () => {
  const traces = [validTrace, { ...validTrace, id: "trace-3" }];
  const result = recordTraceBatchSchema.safeParse(traces);
  expect(result.success).toBe(true);
});

test("recordTraceBatchSchema: array with invalid trace fails", () => {
  const traces = [validTrace, { ...validTrace, startTime: "bad" }];
  const result = recordTraceBatchSchema.safeParse(traces);
  expect(result.success).toBe(false);
});
