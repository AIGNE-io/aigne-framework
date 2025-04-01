import { expect, test } from "bun:test";
import { Agent, type FunctionAgentFn } from "@aigne/core";
import {
  checkArguments,
  createAccessorArray,
  duplicates,
  isEmpty,
  isNil,
  isNonNullable,
  orArrayToArray,
} from "@aigne/core/utils/type-utils.js";
import { type ZodType, z } from "zod";

test("type-utils.isNonNullable", async () => {
  expect([null, undefined, 0].filter(isNonNullable)).toEqual([0]);
});

test("type-utils.isNil", async () => {
  expect([null, undefined, 0].filter((value) => !isNil(value))).toEqual([0]);
});

test("types-utils.isEmpty", async () => {
  expect(isEmpty({})).toBe(true);
  expect(isEmpty("")).toBe(true);
  expect(isEmpty([])).toBe(true);
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty({ foo: "bar" })).toBe(false);
  expect(isEmpty("test")).toBe(false);
  expect(isEmpty([1])).toBe(false);
});

test("type-utils.duplicates", async () => {
  const array = [
    { id: 1, name: "foo" },
    { id: 2, name: "bar" },
    { id: 1, name: "baz" },
  ];

  const duplicated = duplicates(array, (item) => item.id);

  expect(duplicated).toEqual([{ id: 1, name: "baz" }]);

  expect(duplicates(["foo", "bar", "baz", "foo"])).toEqual(["foo"]);
});

test("type-utils.orArrayToArray", async () => {
  expect(orArrayToArray(1)).toEqual([1]);
  expect(orArrayToArray([1, 2, 3])).toEqual([1, 2, 3]);
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

test("type-utils.checkArguments should throw an error if the arguments do not match the schema", async () => {
  expect(() => {
    checkArguments("test", z.object({ foo: z.string() }), { foo: 1 } as unknown);
  }).toThrow("test check arguments error: foo: Expected string, received number");
});

test("type-utils.checkArguments should throw an error if the arguments do not match the union schema", async () => {
  expect(() => {
    checkArguments("test", z.object({ foo: z.union([z.string(), z.boolean()]) }), {
      foo: 1,
    } as unknown);
  }).toThrow("test check arguments error: foo: Expected string or boolean, received number");

  expect(() => {
    checkArguments(
      "test",
      z.object({ agent: z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]) }),
      { agent: 1 } as unknown,
    );
  }).toThrow("test check arguments error: agent: Input not instance of Agent");
});
