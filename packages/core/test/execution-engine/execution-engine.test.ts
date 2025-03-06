import { expect, test } from "bun:test";
import { ExecutionEngine, FunctionAgent } from "@aigne/core";
import {
  UserInput,
  UserOutput,
} from "../../src/execution-engine/message-queue";

test("ExecutionEngine.run", async () => {
  const plus = FunctionAgent.from({
    fn: ({ a, b }: { a: number; b: number }) => ({
      sum: a + b,
    }),
  });

  const engine = new ExecutionEngine();

  const result = await engine.run({ a: 1, b: 2 }, plus);

  expect(result).toEqual({ sum: 3 });
});

test("ExecutionEngine.runLoop", async () => {
  const plusOne = FunctionAgent.from({
    subscribeTopic: [UserInput, "review_result"],
    fn: (input: { num: number; approval?: string }, context) => {
      if (input.approval === "approve") {
        context?.publish(UserOutput, input);
        return input;
      }

      const result = { num: input.num + 1 };
      context?.publish("review_request", result);
      return result;
    },
  });

  const reviewer = FunctionAgent.from({
    subscribeTopic: "review_request",
    publishTopic: "review_result",
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
