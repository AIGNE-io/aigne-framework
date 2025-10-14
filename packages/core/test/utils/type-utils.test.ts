import { expect, test } from "bun:test";
import { Agent, type FunctionAgentFn } from "@aigne/core";
import {
  checkArguments,
  createAccessorArray,
  duplicates,
  flat,
  isEmpty,
  isNil,
  isNonNullable,
  isNotEmpty,
  isRecord,
  omit,
  omitBy,
  omitByDeep,
  omitDeep,
  partition,
  pick,
  remove,
  tryOrThrow,
  unique,
} from "@aigne/core/utils/type-utils.js";
import { type ZodType, z } from "zod";

test("type-utils.isNonNullable", async () => {
  expect([null, undefined, 0].filter(isNonNullable)).toEqual([0]);
});

test("type-utils.isNil", async () => {
  expect([null, undefined, 0].filter((value) => !isNil(value))).toEqual([0]);
});

test("type-utils.isRecord", async () => {
  expect(isRecord({})).toBe(true);
  expect(isRecord({ foo: "bar" })).toBe(true);
  expect(isRecord([])).toBe(false);
  expect(isRecord("")).toBe(false);
  expect(isRecord(null)).toBe(false);
  expect(isRecord(undefined)).toBe(false);
  expect(isRecord(1)).toBe(false);
  expect(isRecord(true)).toBe(false);
});

test("type-utils.isEmpty", async () => {
  expect(isEmpty({})).toBe(true);
  expect(isEmpty("")).toBe(true);
  expect(isEmpty([])).toBe(true);
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty({ foo: "bar" })).toBe(false);
  expect(isEmpty("test")).toBe(false);
  expect(isEmpty([1])).toBe(false);
});

test("type-utils.isNotEmpty", async () => {
  expect(isNotEmpty([])).toBe(false);
  expect(isNotEmpty([1])).toBe(true);
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

test("test-utils.remove", async () => {
  const array1 = [1, 2, 3, 4, 5];
  expect(remove(array1, [1, 2])).toEqual([1, 2]);
  expect(array1).toEqual([3, 4, 5]);

  const array2 = [1, 2, 3, 4, 5];
  expect(remove(array2, (item) => item > 3)).toEqual([4, 5]);
  expect(array2).toEqual([1, 2, 3]);
});

test("type-utils.unique", async () => {
  expect(unique([1, 2, 3, 1, 2, 3])).toEqual([1, 2, 3]);

  expect(unique([{ id: 1 }, { id: 2 }, { id: 1 }], (item) => item.id)).toEqual([
    { id: 1 },
    { id: 2 },
  ]);
});

test("type-utils.pick", async () => {
  expect(pick({ foo: 1, bar: 2, baz: "3" }, "foo")).toEqual({ foo: 1 });

  expect(pick({ foo: 1, bar: 2, baz: "3" }, "foo", "bar")).toEqual({ foo: 1, bar: 2 });
});

test("type-utils.omit", async () => {
  expect(omit({ foo: 1, bar: 2 }, "foo")).toEqual({ bar: 2 });

  expect(omit({ foo: 1, bar: 2 }, ["foo"])).toEqual({ bar: 2 });
});

test("type-utils.omitDeep should omit nested properties", async () => {
  expect(omitDeep({ foo: { bar: 1, baz: 2 }, qux: 3 }, "bar")).toEqual({ foo: { baz: 2 }, qux: 3 });
  expect(omitDeep([{ foo: { bar: 1, baz: 2 } }, { qux: 3 }], "bar")).toEqual([
    { foo: { baz: 2 } },
    { qux: 3 },
  ]);
});

test("type-utils.omitBy", async () => {
  expect(omitBy({ foo: 1, bar: 2 }, (value) => value === 1)).toEqual({ bar: 2 });

  expect(omitBy({ foo: 1, bar: 2 }, (_, key) => key === "foo")).toEqual({ bar: 2 });
});

test("type-utils.omitByDeep", async () => {
  expect(omitByDeep({ foo: { bar: 1, baz: 2 }, qux: 3 }, (value) => value === 1)).toEqual({
    foo: { baz: 2 },
    qux: 3,
  });

  expect(omitByDeep([{ foo: { bar: 1, baz: 2 } }, { qux: 3 }], (value) => value === 1)).toEqual([
    { foo: { baz: 2 } },
    { qux: 3 },
  ]);
});

test("type-utils.flat", async () => {
  expect(flat(1)).toEqual([1]);
  expect(flat([1, 2, 3])).toEqual([1, 2, 3]);
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

test("type-utils.tryOrThrow should return the value if the function succeeds", async () => {
  const result = tryOrThrow(
    () => 42,
    (error) => new Error(`Error: ${error.message}`),
  );
  expect(result).toBe(42);

  const result2 = await tryOrThrow(
    () => Promise.resolve(42),
    (error) => new Error(`Error: ${error.message}`),
  );
  expect(result2).toBe(42);
});

test("type-utils.tryOrThrow should throw an error if the function fails", async () => {
  expect(() => {
    tryOrThrow(() => {
      throw new Error("Test error");
    }, "Error: Test error");
  }).toThrow("Error: Test error");

  expect(() => {
    tryOrThrow(() => {
      throw new Error("Test error");
    }, new Error("Error: Test error"));
  }).toThrow("Error: Test error");

  expect(() => {
    tryOrThrow(
      () => {
        throw new Error("Test error");
      },
      (error) => new Error(`Error: ${error.message}`),
    );
  }).toThrow("Error: Test error");
});

test("type-utils.partition should partition the array based on the predicate", async () => {
  const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
  expect(even).toEqual([2, 4]);
  expect(odd).toEqual([1, 3, 5]);
});
