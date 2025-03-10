import { expect, test } from "bun:test";
import { get, isNonNullable, orArrayToArray } from "../../src/utils/type-utils";

test("type-utils.isNonNullable", async () => {
  expect([null, undefined, 0].filter(isNonNullable)).toEqual([0]);
});

test("type-utils.orArrayToArray", async () => {
  expect(orArrayToArray(1)).toEqual([1]);
  expect(orArrayToArray([1, 2, 3])).toEqual([1, 2, 3]);
});

test("type-utils.get", async () => {
  expect(get({ foo: "hello" }, "foo", "string")).toBe("hello");

  expect(get({ foo: "hello" }, "foo", "number")).toBeUndefined();
});
