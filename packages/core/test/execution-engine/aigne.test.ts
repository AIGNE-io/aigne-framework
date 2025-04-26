import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  AIGNE,
  FunctionAgent,
  type MessageQueueListener,
  UserInputTopic,
  UserOutputTopic,
  createMessage,
  createPublishMessage,
} from "@aigne/core";
import { TeamAgent } from "@aigne/core/agents/team-agent.js";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { mockOpenAIStreaming } from "../_mocks/mock-openai-streaming.js";

test("AIGNE.call", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const aigne = new AIGNE();

  const result = await aigne.call(plus, { a: 1, b: 2 });

  expect(result).toEqual({ sum: 3 });
});

test("AIGNE.call with reflection", async () => {
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

  const aigne = new AIGNE({ agents: [plusOne, reviewer] });
  aigne.publish(UserInputTopic, createPublishMessage({ num: 1 }));
  const { message: result } = await aigne.subscribe(UserOutputTopic);

  expect(result).toEqual({ num: 11, approval: "approve" });
});

test("AIGNE.shutdown should shutdown all tools and agents", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const agent = AIAgent.from({
    memory: { subscribeTopic: "test_topic" },
  });

  const aigne = new AIGNE({
    tools: [plus],
    agents: [agent],
  });

  const plusShutdown = spyOn(plus, "shutdown");
  const agentShutdown = spyOn(agent, "shutdown");

  await aigne.shutdown();

  expect(plusShutdown).toHaveBeenCalled();
  expect(agentShutdown).toHaveBeenCalled();
});

test("AIGNE should throw error if reached max agent calls", async () => {
  const plus = FunctionAgent.from(
    async ({ num, times }: { num: number; times: number }, context): Promise<{ num: number }> => {
      if (times <= 1) {
        return { num: num + 1 };
      }

      return context.call(plus, { num: num + 1, times: times - 1 });
    },
  );

  const aigne = new AIGNE({
    limits: {
      maxAgentCalls: 2,
    },
  });

  expect(aigne.call(plus, { num: 0, times: 2 })).resolves.toEqual({ num: 2 });
  expect(aigne.call(plus, { num: 0, times: 3 })).rejects.toThrowError(
    "Exceeded max agent calls 2/2",
  );
});

test("AIGNE should throw error if reached max tokens", async () => {
  const model = new OpenAIChatModel({
    apiKey: "YOUR_API_KEY",
  });

  spyOn(model.client.chat.completions, "create").mockImplementation(() =>
    mockOpenAIStreaming({ text: "hello", inputTokens: 100, outputTokens: 200 }),
  );

  const agent = AIAgent.from({});

  const aigne = new AIGNE({
    model,
    limits: {
      maxTokens: 200,
    },
  });

  expect(aigne.call(agent, "test")).resolves.toEqual(createMessage("hello"));
  expect(
    aigne.call(
      TeamAgent.from({
        tools: [agent, agent],
      }),
      "test",
    ),
  ).rejects.toThrow("Exceeded max tokens 300/200");
});

test("AIGNE should throw timeout error", async () => {
  const agent = FunctionAgent.from(async ({ timeout }: { timeout: number }) => {
    await new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });

    return { timeout };
  });

  const aigne = new AIGNE({
    limits: {
      timeout: 200,
    },
  });

  expect(aigne.call(agent, { timeout: 100 })).resolves.toEqual({ timeout: 100 });
  expect(aigne.call(agent, { timeout: 300 })).rejects.toThrow("AIGNEContext is timeout");
});

test("AIGNEContext should subscribe/unsubscribe correctly", async () => {
  const aigne = new AIGNE({});

  const listener: MessageQueueListener = mock();

  aigne.subscribe("test_topic", listener);

  aigne.publish("test_topic", createPublishMessage("hello"));
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(
    expect.objectContaining({ message: createMessage("hello") }),
  );

  aigne.unsubscribe("test_topic", listener);
  aigne.publish("test_topic", createPublishMessage("hello"));
  expect(listener).toBeCalledTimes(1);
});
