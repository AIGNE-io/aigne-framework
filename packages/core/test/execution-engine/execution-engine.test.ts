import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  ExecutionEngine,
  FunctionAgent,
  type MessageQueueListener,
  UserInputTopic,
  UserOutputTopic,
  createMessage,
  sequential,
} from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { mockOpenAIStreaming } from "../_mocks/mock-openai-streaming.js";

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
  const plus = FunctionAgent.from(
    async ({ num, times }: { num: number; times: number }, context): Promise<{ num: number }> => {
      if (times <= 1) {
        return { num: num + 1 };
      }

      return context.call(plus, { num: num + 1, times: times - 1 });
    },
  );

  const engine = new ExecutionEngine({
    limits: {
      maxAgentCalls: 2,
    },
  });

  expect(engine.call(plus, { num: 0, times: 2 })).resolves.toEqual({ num: 2 });
  expect(engine.call(plus, { num: 0, times: 3 })).rejects.toThrowError(
    "Exceeded max agent calls 2/2",
  );
});

test("ExecutionEngine should throw error if reached max tokens", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.chat.completions, "create").mockImplementation(() =>
    mockOpenAIStreaming({ text: "hello", promptTokens: 100, completeTokens: 200 }),
  );

  const agent = AIAgent.from({});

  const engine = new ExecutionEngine({
    model,
    limits: {
      maxTokens: 200,
    },
  });

  expect(engine.call(agent, "test")).resolves.toEqual(createMessage("hello"));
  expect(engine.call(sequential(agent, agent), "test")).rejects.toThrow(
    "Exceeded max tokens 300/200",
  );
});

test("ExecutionEngine should throw timeout error", async () => {
  const agent = FunctionAgent.from(async ({ timeout }: { timeout: number }) => {
    await new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });

    return { timeout };
  });

  const engine = new ExecutionEngine({
    limits: {
      timeout: 200,
    },
  });

  expect(engine.call(agent, { timeout: 100 })).resolves.toEqual({ timeout: 100 });
  expect(engine.call(agent, { timeout: 300 })).rejects.toThrow("ExecutionEngine is timeout");
});

test("ExecutionEngineContext should subscribe/unsubscribe correctly", async () => {
  const context = new ExecutionEngine({}).newContext();

  const listener: MessageQueueListener = mock();

  context.subscribe("test_topic", listener);

  context.publish("test_topic", "hello");
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(
    expect.objectContaining({ message: createMessage("hello") }),
  );

  context.unsubscribe("test_topic", listener);
  context.publish("test_topic", "hello");
  expect(listener).toBeCalledTimes(1);
});
