import { expect, test } from "bun:test";
import { FunctionAgent } from "@aigne/core";

test("FunctionAgent.run", async () => {
  const plus = FunctionAgent.from({
    function: ({ a, b }: { a: number; b: number }) => ({
      sum: a + b,
    }),
  });

  const result = await plus.run({ a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});
