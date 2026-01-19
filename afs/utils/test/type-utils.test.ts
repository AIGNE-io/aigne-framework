import { describe, expect, test } from "bun:test";
import { get, isEmpty, isNil, isNonNullable, isRecord } from "@aigne/afs-utils/type-utils.js";

describe("type-utils", () => {
  describe("isNil", () => {
    test("should return true for null", () => {
      expect(isNil(null)).toBe(true);
    });

    test("should return true for undefined", () => {
      expect(isNil(undefined)).toBe(true);
    });

    test("should return false for non-nil values", () => {
      expect(isNil(0)).toBe(false);
      expect(isNil("")).toBe(false);
      expect(isNil(false)).toBe(false);
      expect(isNil({})).toBe(false);
      expect(isNil([])).toBe(false);
    });

    test("should work as a filter predicate", () => {
      const values = [null, undefined, 0, "", false];
      expect(values.filter((v) => !isNil(v))).toEqual([0, "", false]);
    });
  });

  describe("isNonNullable", () => {
    test("should return false for null", () => {
      expect(isNonNullable(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isNonNullable(undefined)).toBe(false);
    });

    test("should return true for non-nullable values", () => {
      expect(isNonNullable(0)).toBe(true);
      expect(isNonNullable("")).toBe(true);
      expect(isNonNullable(false)).toBe(true);
      expect(isNonNullable({})).toBe(true);
      expect(isNonNullable([])).toBe(true);
    });

    test("should work as a filter predicate", () => {
      const values = [null, undefined, 0, "", false];
      expect(values.filter(isNonNullable)).toEqual([0, "", false]);
    });
  });

  describe("isRecord", () => {
    test("should return true for plain objects", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ foo: "bar" })).toBe(true);
      expect(isRecord({ a: 1, b: 2 })).toBe(true);
    });

    test("should return false for arrays", () => {
      expect(isRecord([])).toBe(false);
      expect(isRecord([1, 2, 3])).toBe(false);
    });

    test("should return false for primitive types", () => {
      expect(isRecord("")).toBe(false);
      expect(isRecord("string")).toBe(false);
      expect(isRecord(0)).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord(true)).toBe(false);
      expect(isRecord(false)).toBe(false);
    });

    test("should return false for null and undefined", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
    });

    test("should return true for class instances", () => {
      class TestClass {}
      expect(isRecord(new TestClass())).toBe(true);
    });

    test("should return true for objects with prototypes", () => {
      expect(isRecord(new Date())).toBe(true);
      expect(isRecord(new Map())).toBe(true);
      expect(isRecord(new Set())).toBe(true);
    });
  });

  describe("isEmpty", () => {
    test("should return true for empty objects", () => {
      expect(isEmpty({})).toBe(true);
    });

    test("should return false for non-empty objects", () => {
      expect(isEmpty({ foo: "bar" })).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    test("should return true for empty strings", () => {
      expect(isEmpty("")).toBe(true);
    });

    test("should return false for non-empty strings", () => {
      expect(isEmpty("test")).toBe(false);
      expect(isEmpty(" ")).toBe(false);
    });

    test("should return true for empty arrays", () => {
      expect(isEmpty([])).toBe(true);
    });

    test("should return false for non-empty arrays", () => {
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    test("should return true for null and undefined", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    test("should return false for primitive non-empty values", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(123)).toBe(false);
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe("get", () => {
    test("should retrieve nested values with valid path", () => {
      const obj = { foo: { bar: { baz: 1 } } };
      expect(get(obj, ["foo", "bar", "baz"])).toBe(1);
    });

    test("should return undefined for non-existent paths", () => {
      const obj = { foo: {} };
      expect(get(obj, ["foo", "bar", "qux"])).toBeUndefined();
    });

    test("should return the object itself for empty path", () => {
      const obj = { foo: "bar" };
      expect(get(obj, [])).toEqual(obj);
    });

    test("should handle single-level paths", () => {
      const obj = { foo: "bar" };
      expect(get(obj, ["foo"])).toBe("bar");
    });

    test("should return undefined for paths through non-objects", () => {
      const obj = { foo: "bar" };
      expect(get(obj, ["foo", "baz"])).toBeUndefined();
    });

    test("should return undefined for array indices (arrays are not records)", () => {
      const obj = { arr: [1, 2, 3] };
      expect(get(obj, ["arr", 0])).toBeUndefined();
      expect(get(obj, ["arr", 1])).toBeUndefined();
    });

    test("should handle symbol keys", () => {
      const sym = Symbol("test");
      const obj = { [sym]: "value" };
      expect(get(obj, [sym])).toBe("value");
    });

    test("should return undefined for null or undefined objects", () => {
      expect(get(null, ["foo"])).toBeUndefined();
      expect(get(undefined, ["foo"])).toBeUndefined();
    });

    test("should handle deeply nested objects", () => {
      const obj = { a: { b: { c: { d: { e: 42 } } } } };
      expect(get(obj, ["a", "b", "c", "d", "e"])).toBe(42);
    });
  });
});
