import { expect, test } from "bun:test";
import { ExecutionEngine, FunctionAgent } from "../../src";

test("Patterns - Run", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const result = await new ExecutionEngine().run({ a: 1, b: 2 }, plus);

  expect(result).toEqual({ sum: 3 });
});
