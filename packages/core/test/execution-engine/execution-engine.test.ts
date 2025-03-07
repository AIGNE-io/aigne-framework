import { expect, test } from "bun:test";
import {
  ExecutionEngine,
  FunctionAgent,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core";

test("ExecutionEngine.run", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const engine = new ExecutionEngine();

  const result = await engine.run({ a: 1, b: 2 }, plus);

  expect(result).toEqual({ sum: 3 });
});

test("ExecutionEngine.runLoop", async () => {
  const plusOne = FunctionAgent.from({
    subscribeTopic: [UserInputTopic, "revise"],
    publishTopic: "review_request",
    fn: (input: { num: number }) => ({ num: input.num + 1 }),
  });

  const reviewer = FunctionAgent.from({
    subscribeTopic: "review_request",
    publishTopic: (output) => (output.num > 10 ? UserOutputTopic : "revise"),
    fn: ({ num }: { num: number }) => {
      return {
        num,
        approval: num > 10 ? "approve" : "revise",
      };
    },
  });

  const engine = new ExecutionEngine({ agents: [plusOne, reviewer] });

  const result = await engine.runLoop({ num: 1 });

  expect(result).toEqual({ num: 11, approval: "approve" });
});
