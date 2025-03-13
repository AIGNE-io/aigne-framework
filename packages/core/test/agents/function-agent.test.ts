import { expect, test } from "bun:test";
import { FunctionAgent } from "@aigne/core-next";

test("FunctionAgent from a function", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const result = await plus.call({ a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});

test("FunctionAgent from FunctionAgentOptions", async () => {
  const plus = FunctionAgent.from({
    fn: ({ a, b }: { a: number; b: number }) => ({
      sum: a + b,
    }),
  });

  const result = await plus.call({ a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});
