// src/schema.test.ts
import { describe, expect, test } from "bun:test";
import { AIGNEObserverOptionsSchema } from "../../api/core/type.js";

describe("AIGNEObserverOptionsSchema", () => {
  test("should return default empty object when undefined", () => {
    const result = AIGNEObserverOptionsSchema.parse(undefined);
    expect(result).toEqual({});
  });

  test("should preserve valid input", () => {
    const input = { storage: "sqlite" };
    const result = AIGNEObserverOptionsSchema.parse(input);
    expect(result).toEqual({ storage: "sqlite" });
  });
});
