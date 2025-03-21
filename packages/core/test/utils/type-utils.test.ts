import { expect, test } from "bun:test";
import {
  createAccessorArray,
  get,
  isNonNullable,
  orArrayToArray,
} from "../../src/utils/type-utils.js";

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

test("type-utils.createAccessorArray", async () => {
  const array = [{ name: "foo" }, { name: "bar" }];

  const accessorArray = createAccessorArray(array, (array, name) =>
    array.find((item) => item.name === name),
  );

  expect(accessorArray.foo).toEqual({ name: "foo" });
  expect(accessorArray.bar).toEqual({ name: "bar" });
  expect(accessorArray.baz).toBeUndefined();
});
