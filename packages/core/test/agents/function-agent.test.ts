import { expect, test } from "bun:test";
import { FunctionAgent } from "@aigne/core";

test("FunctionAgent from a function", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const result = await plus.invoke({ a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});

test("FunctionAgent from FunctionAgentOptions", async () => {
  const plus = FunctionAgent.from({
    process: ({ a, b }: { a: number; b: number }) => ({
      sum: a + b,
    }),
  });

  const result = await plus.invoke({ a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});

test("FunctionAgent should support access agent by this in process function", async () => {
  const plus = FunctionAgent.from({
    name: "TestFunctionAgent",
    description: "A test function agent",
    process() {
      const { name, description } = this;

      return { name, description };
    },
  });

  const result = await plus.invoke({});

  expect(result).toMatchInlineSnapshot(`
    {
      "description": "A test function agent",
      "name": "TestFunctionAgent",
    }
  `);
});
