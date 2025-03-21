import { expect, test } from "bun:test";
import { ExecutionEngine, FunctionAgent } from "@aigne/core-next";

test("Patterns - Run", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const engine = new ExecutionEngine();

  const result = await engine.call(plus, { a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});
