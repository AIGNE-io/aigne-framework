import { expect, spyOn, test } from "bun:test";
import {
  AIAgent,
  ExecutionEngine,
  FunctionAgent,
  UserInputTopic,
  UserOutputTopic,
  createMessage,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model";
import { mockOpenAIStreaming } from "../_mocks/mock-openai-streaming";

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

test("ExecutionEngine should throw error if reached max agent calls", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const engine = new ExecutionEngine({
    limits: {
      maxAgentCalls: 2,
    },
  });

  expect(engine.call(plus, { a: 1, b: 2 })).resolves.toEqual({ sum: 3 });
  expect(engine.call(plus, { a: 1, b: 2 })).resolves.toEqual({ sum: 3 });
  expect(engine.call(plus, { a: 1, b: 2 })).rejects.toThrowError("Exceeded max agent calls 2/2");
});

test("ExecutionEngine should throw error if reached max tokens", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.chat.completions, "create")
    .mockReturnValueOnce(
      mockOpenAIStreaming({ text: "hello", promptTokens: 100, completeTokens: 200 }),
    )
    .mockReturnValueOnce(
      mockOpenAIStreaming({ text: "world", promptTokens: 100, completeTokens: 200 }),
    );

  const agent = AIAgent.from({});

  const engine = new ExecutionEngine({
    model,
    limits: {
      maxTokens: 400,
    },
  });

  expect(engine.call(agent, "test")).resolves.toEqual(createMessage("hello"));
  expect(engine.call(agent, "test")).resolves.toEqual(createMessage("world"));
  expect(engine.call(agent, "test")).rejects.toThrow("Exceeded max tokens 600/400");
});
