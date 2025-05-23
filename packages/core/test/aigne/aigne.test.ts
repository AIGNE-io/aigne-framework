import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  AIGNE,
  FunctionAgent,
  type MessageQueueListener,
  UserInputTopic,
  UserOutputTopic,
  createMessage,
} from "@aigne/core";
import { TeamAgent } from "@aigne/core/agents/team-agent.js";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { OpenAIChatModel } from "../_mocks/mock-models.js";

test("AIGNE simple example", async () => {
  // #region example-simple
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
  });

  const result = await aigne.invoke(agent, "hello");
  console.log(result); // { $message: "Hello, How can I assist you today?" }

  expect(result).toEqual({ $message: "Hello, How can I assist you today?" });
  // #endregion example-simple
});

test("AIGNE example with streaming response", async () => {
  // #region example-streaming
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
  });

  let text = "";

  const stream = await aigne.invoke(agent, "hello", { streaming: true });
  for await (const chunk of stream) {
    if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
  }

  console.log(text); // Output: Hello, How can I assist you today?

  expect(text).toEqual("Hello, How can I assist you today?");

  // #endregion example-streaming
});

test("AIGNE example shutdown", async () => {
  // #region example-shutdown
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
  });

  await aigne.invoke(agent, "hello");

  await aigne.shutdown();
  // #endregion example-shutdown
});

test("AIGNE example shutdown by `using` statement", async () => {
  // #region example-shutdown-using
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  // AIGNE: Main execution engine of AIGNE Framework.
  await using aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
  });

  await aigne.invoke(agent, "hello");

  // aigne will be automatically shutdown when exiting the using block

  // #endregion example-shutdown-using
});

test("AIGNE example invoke get an user agent ", async () => {
  // #region example-user-agent
  const model = new OpenAIChatModel();

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
    )
    .mockReturnValueOnce(Promise.resolve(stringToAgentResponseStream("Nice to meet you, Bob!")));

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
  });

  const userAgent = aigne.invoke(agent);

  const result1 = await userAgent.invoke("hello");
  console.log(result1); // { $message: "Hello, How can I assist you today?" }

  expect(result1).toEqual({ $message: "Hello, How can I assist you today?" });

  const result2 = await userAgent.invoke("I'm Bob!");
  console.log(result2); // { $message: "Nice to meet you, Bob!" }

  expect(result2).toEqual({ $message: "Nice to meet you, Bob!" });
  // #endregion example-user-agent
});

test("AIGNE example publish message", async () => {
  // #region example-publish-message
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
    subscribeTopic: "test_topic",
    publishTopic: "result_topic",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
    // Add agent to AIGNE
    agents: [agent],
  });

  const subscription = aigne.subscribe("result_topic");

  aigne.publish("test_topic", "hello");

  const { message } = await subscription;

  console.log(message); // { $message: "Hello, How can I assist you today?" }

  expect(message).toEqual({ $message: "Hello, How can I assist you today?" });
  // #endregion example-publish-message
});

test("AIGNE example subscribe topic", async () => {
  // #region example-subscribe-topic
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Hello, How can I assist you today?")),
  );

  const agent = AIAgent.from({
    name: "chat",
    description: "A chat agent",
    subscribeTopic: "test_topic",
    publishTopic: "result_topic",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
    // Add agent to AIGNE
    agents: [agent],
  });

  const unsubscribe = aigne.subscribe("result_topic", ({ message }) => {
    console.log(message); // { $message: "Hello, How can I assist you today?" }

    unsubscribe();
  });

  aigne.publish("test_topic", "hello");

  // #endregion example-subscribe-topic
});

test("AIGNE.invoke with reflection", async () => {
  const plusOne = FunctionAgent.from({
    subscribeTopic: [UserInputTopic, "revise"],
    publishTopic: "review_request",
    process: (input: { num: number }) => ({ num: input.num + 1 }),
  });

  const reviewer = FunctionAgent.from({
    subscribeTopic: "review_request",
    publishTopic: (output) => (output.num > 10 ? UserOutputTopic : "revise"),
    process: ({ num }: { num: number }) => {
      return {
        num,
        approval: num > 10 ? "approve" : "revise",
      };
    },
  });

  const aigne = new AIGNE({ agents: [plusOne, reviewer] });
  aigne.publish(UserInputTopic, { num: 1 });
  const { message: result } = await aigne.subscribe(UserOutputTopic);

  expect(result).toEqual({ num: 11, approval: "approve" });
});

test("AIGNE.shutdown should shutdown all tools and agents", async () => {
  const plus = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({
    sum: a + b,
  }));

  const agent = AIAgent.from({});

  const aigne = new AIGNE({
    skills: [plus],
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
    async (
      { num, times }: { num: number; times: number },
      { context },
    ): Promise<{ num: number }> => {
      if (times <= 1) {
        return { num: num + 1 };
      }

      return context.invoke(plus, { num: num + 1, times: times - 1 });
    },
  );

  const aigne = new AIGNE({
    limits: {
      maxAgentInvokes: 2,
    },
  });

  expect(aigne.invoke(plus, { num: 0, times: 2 })).resolves.toEqual({ num: 2 });
  expect(aigne.invoke(plus, { num: 0, times: 3 })).rejects.toThrowError(
    "Exceeded max agent invokes 2/2",
  );
});

test("AIGNE should throw error if reached max tokens", async () => {
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValue({
    text: "hello",
    usage: {
      inputTokens: 100,
      outputTokens: 200,
    },
  });

  const agent = AIAgent.from({});

  const aigne = new AIGNE({
    model,
    limits: {
      maxTokens: 200,
    },
  });

  expect(aigne.invoke(agent, "test")).resolves.toEqual(createMessage("hello"));
  expect(aigne.invoke(TeamAgent.from({ skills: [agent, agent] }), "test")).rejects.toThrow(
    "Exceeded max tokens 300/200",
  );
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

  expect(aigne.invoke(agent, { timeout: 100 })).resolves.toEqual({ timeout: 100 });
  expect(aigne.invoke(agent, { timeout: 300 })).rejects.toThrow("AIGNEContext is timeout");
});

test("AIGNEContext should subscribe/unsubscribe correctly", async () => {
  const aigne = new AIGNE({});

  const listener: MessageQueueListener = mock();

  aigne.subscribe("test_topic", listener);

  aigne.publish("test_topic", "hello");
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(
    expect.objectContaining({ message: createMessage("hello") }),
  );

  aigne.unsubscribe("test_topic", listener);
  aigne.publish("test_topic", "hello");
  expect(listener).toBeCalledTimes(1);
});
