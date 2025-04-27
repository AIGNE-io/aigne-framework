import { expect, spyOn, test } from "bun:test";
import { inspect } from "node:util";
import { AIAgent, FunctionAgent } from "@aigne/core";
import { z } from "zod";

test("Agent inspect should return it's name", async () => {
  expect(inspect(AIAgent.from({}))).toBe("AIAgent");

  expect(inspect(AIAgent.from({ name: "test_agent" }))).toBe("test_agent");
});

test("Agent should check input and output schema", async () => {
  const plus = FunctionAgent.from({
    name: "test-agent-plus",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      sum: z.number(),
    }),
    fn: async (input) => {
      return {
        sum: input.a + input.b,
      };
    },
  });

  expect(
    plus.invoke({ a: "foo" as unknown as number, b: "bar" as unknown as number }),
  ).rejects.toThrow(
    "Agent test-agent-plus input check arguments error: a: Expected number, received string, b: Expected number, received string",
  );

  spyOn(plus, "fn").mockReturnValueOnce({ sum: "3" as unknown as number });
  expect(plus.invoke({ a: 1, b: 2 })).rejects.toThrow(
    "Agent test-agent-plus output check arguments error: sum: Expected number, received string",
  );
});
