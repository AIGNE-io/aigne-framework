import { expect, spyOn, test } from "bun:test";
import {
  AIAgent,
  ExecutionEngine,
  FunctionAgent,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core-next";

test("ExecutionEngine.call", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const engine = new ExecutionEngine();

  const result = await engine.call(plus, { a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});

test("ExecutionEngine.call with reflection", async () => {
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
  engine.publish(UserInputTopic, { num: 1 });
  const { message: result } = await engine.subscribe(UserOutputTopic);

  expect(result).toEqual({ num: 11, approval: "approve" });
});

test("ExecutionEngine.shutdown should shutdown all tools and agents", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const agent = AIAgent.from({
    memory: { subscribeTopic: "test_topic" },
  });

  const engine = new ExecutionEngine({
    tools: [plus],
    agents: [agent],
  });

  const plusShutdown = spyOn(plus, "shutdown");
  const agentShutdown = spyOn(agent, "shutdown");

  await engine.shutdown();

  expect(plusShutdown).toHaveBeenCalled();
  expect(agentShutdown).toHaveBeenCalled();
});
