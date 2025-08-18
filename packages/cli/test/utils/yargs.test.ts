import { expect, test } from "bun:test";
import { inferZodType } from "@aigne/cli/utils/yargs.js";
import { z } from "zod";

test("inferZodType should infer type correctly", async () => {
  expect(inferZodType(z.string())).toEqual({ type: "string" });
  expect(inferZodType(z.number())).toEqual({ type: "number" });
  expect(inferZodType(z.boolean())).toEqual({ type: "boolean" });
});

test("inferZodType should handle array types", async () => {
  expect(inferZodType(z.array(z.string()))).toEqual({ type: "string", array: true });
  expect(inferZodType(z.array(z.number()))).toEqual({ type: "number", array: true });
  expect(inferZodType(z.array(z.boolean()))).toEqual({ type: "boolean", array: true });
});

test("inferZodType should handle optional types", async () => {
  expect(inferZodType(z.string().optional())).toEqual({ type: "string", optional: true });
  expect(inferZodType(z.number().optional())).toEqual({ type: "number", optional: true });
  expect(inferZodType(z.boolean().optional())).toEqual({ type: "boolean", optional: true });
});

test("inferZodType should handle optional types", async () => {
  expect(inferZodType(z.string().nullable())).toEqual({ type: "string", optional: true });
  expect(inferZodType(z.number().nullable())).toEqual({ type: "number", optional: true });
  expect(inferZodType(z.boolean().nullable())).toEqual({ type: "boolean", optional: true });
});

test("inferZodType should handle nullish types", async () => {
  expect(inferZodType(z.string().nullish())).toEqual({ type: "string", optional: true });
  expect(inferZodType(z.number().nullish())).toEqual({ type: "number", optional: true });
  expect(inferZodType(z.boolean().nullish())).toEqual({ type: "boolean", optional: true });
});

test("inferZodType should handle unknown type as string", async () => {
  expect(inferZodType(z.unknown())).toEqual({ type: "string", optional: true });
  expect(inferZodType(z.any())).toEqual({ type: "string", optional: true });
});
