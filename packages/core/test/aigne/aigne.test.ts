import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import {
  AIAgent,
  AIGNE,
  FunctionAgent,
  type InvokeOptions,
  isAgentResponseDelta,
  isAgentResponseProgress,
  type MessageQueueListener,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core";
import { TeamAgent } from "@aigne/core/agents/team-agent.js";
import {
  arrayToReadableStream,
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";
import { omit, omitDeep } from "@aigne/core/utils/type-utils.js";
import { OpenAIChatModel } from "../_mocks/mock-models.js";
import { createToolCallResponse } from "../_utils/openai-like-utils.js";

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
    inputKey: "message",
  });

  const result = await aigne.invoke(agent, { message: "hello" });
  console.log(result); // { message: "Hello, How can I assist you today?" }

  expect(result).toEqual({ message: "Hello, How can I assist you today?" });
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
    inputKey: "message",
  });

  let text = "";

  const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk) && chunk.delta.text?.message) {
      text += chunk.delta.text.message;
    }
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
    inputKey: "message",
  });

  await aigne.invoke(agent, { message: "hello" });

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
    inputKey: "message",
  });

  await aigne.invoke(agent, { message: "hello" });

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
    inputKey: "message",
  });

  const userAgent = aigne.invoke(agent);

  const result1 = await userAgent.invoke({ message: "hello" });
  console.log(result1); // { message: "Hello, How can I assist you today?" }

  expect(result1).toEqual({ message: "Hello, How can I assist you today?" });

  const result2 = await userAgent.invoke({ message: "I'm Bob!" });
  console.log(result2); // { message: "Nice to meet you, Bob!" }

  expect(result2).toEqual({ message: "Nice to meet you, Bob!" });
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
    inputKey: "message",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
    // Add agent to AIGNE
    agents: [agent],
  });

  const subscription = aigne.subscribe("result_topic");

  aigne.publish("test_topic", { message: "hello" });

  const { message } = await subscription;

  console.log(message); // { message: "Hello, How can I assist you today?" }

  expect(message).toEqual({ message: "Hello, How can I assist you today?" });
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
    inputKey: "message",
  });

  // AIGNE: Main execution engine of AIGNE Framework.
  const aigne = new AIGNE({
    model,
    // Add agent to AIGNE
    agents: [agent],
  });

  const unsubscribe = aigne.subscribe("result_topic", ({ message }) => {
    console.log(message); // { message: "Hello, How can I assist you today?" }

    unsubscribe();
  });

  aigne.publish("test_topic", { message: "hello" });

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

  const agent = AIAgent.from({
    inputKey: "message",
  });

  const aigne = new AIGNE({
    model,
    limits: {
      maxTokens: 200,
    },
  });

  expect(aigne.invoke(agent, { message: "test" })).resolves.toEqual({ message: "hello" });
  expect(
    aigne.invoke(TeamAgent.from({ skills: [agent, agent] }), { message: "test" }),
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

  expect(aigne.invoke(agent, { timeout: 100 })).resolves.toEqual({ timeout: 100 });
  expect(aigne.invoke(agent, { timeout: 300 })).rejects.toThrow("AIGNEContext is timeout");
});

test("AIGNEContext should subscribe/unsubscribe correctly", async () => {
  const aigne = new AIGNE({});

  const listener: MessageQueueListener = mock();

  aigne.subscribe("test_topic", listener);

  aigne.publish("test_topic", { message: "hello" });
  expect(listener).toBeCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ message: { message: "hello" } }));

  aigne.unsubscribe("test_topic", listener);
  aigne.publish("test_topic", { message: "hello" });
  expect(listener).toBeCalledTimes(1);
});

test("AIGNE.invoke support custom user context", async () => {
  const aigne = new AIGNE<{ id: string; name: string }>({});

  const agent = FunctionAgent.from((_, options) => {
    options.context.userContext.newContextProperty = "foo";

    return options.context.invoke(childAgent, {});
  });

  const childAgent = FunctionAgent.from(() => ({
    text: "I am a child agent",
  }));

  const agentProcess = spyOn(agent, "process");
  const childAgentProcess = spyOn(childAgent, "process");

  const result = await aigne.invoke(
    agent,
    { message: "hello" },
    {
      userContext: { id: "test_user_id", name: "test_user_name" },
    },
  );
  expect(result).toEqual({ text: "I am a child agent" });
  expect(agentProcess).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      context: expect.objectContaining({
        userContext: expect.objectContaining({ id: "test_user_id", name: "test_user_name" }),
      }),
    }),
  );
  expect(childAgentProcess).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      context: expect.objectContaining({
        userContext: expect.objectContaining({
          id: "test_user_id",
          name: "test_user_name",
          newContextProperty: "foo",
        }),
      }),
    }),
  );
});

test("AIGNE.publish support custom user context", async () => {
  const agent = FunctionAgent.from({
    publishTopic: "test_topic",
    subscribeTopic: "test_topic1",
    process: () => ({
      text: "I am a test agent",
    }),
  });

  const aigne = new AIGNE({
    model: new OpenAIChatModel(),
    agents: [agent],
  });
  assert(aigne.model);

  const agentProcess = spyOn(agent, "process");
  spyOn(aigne.model, "process").mockReturnValueOnce({
    text: "I am a test agent",
  });
  const result = aigne.subscribe("test_topic");
  aigne.publish(
    "test_topic1",
    { message: "hello" },
    {
      userContext: { id: "test_user_id", name: "test_user_name" },
    },
  );
  const { message: response } = await result;
  expect(response).toEqual({ text: "I am a test agent" });
  expect(agentProcess).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      context: expect.objectContaining({
        userContext: { id: "test_user_id", name: "test_user_name" },
      }),
    }),
  );
});

test("AIGNE.invoke should respond progressing chunks correctly", async () => {
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    stringToAgentResponseStream("Hello, How can I assist you today?"),
  );

  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    inputKey: "message",
    taskTitle: "Start process {{message}}",
  });

  const stream = await aigne.invoke(
    agent,
    { message: "hello" },
    {
      streaming: true,
      returnProgressChunks: true,
    },
  );
  expect(
    (await readableStreamToArray(stream)).map((i) =>
      isAgentResponseProgress(i)
        ? { progress: omit(i.progress, ["contextId", "parentContextId", "timestamp"]) }
        : i,
    ),
  ).toMatchSnapshot();
});

test("AIGNE.invoke should respond progressing chunks (with failed chunks) correctly", async () => {
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    arrayToReadableStream([
      { delta: { text: { text: "Hello" } } },
      { delta: { text: { text: " world" } } },
      new Error("Test error"),
      { delta: { text: { text: " foo" } } },
    ]),
  );

  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    inputKey: "message",
  });

  const stream = await aigne.invoke(
    agent,
    { message: "hello" },
    {
      streaming: true,
      returnProgressChunks: true,
    },
  );
  expect(
    (await readableStreamToArray(stream, { catchError: true })).map((i) =>
      !(i instanceof Error) && isAgentResponseProgress(i)
        ? { progress: omit(i.progress, ["contextId", "parentContextId", "timestamp"]) }
        : i,
    ),
  ).toMatchSnapshot();
});

test.each<[InvokeOptions]>([
  [{ streaming: true, returnMetadata: true }],
  [{ streaming: false, returnMetadata: true }],
])("AIGNE.invoke should respond $meta field with usage metrics with %p", async (options) => {
  const model = new OpenAIChatModel();

  spyOn(model, "process")
    .mockReturnValueOnce({
      toolCalls: [createToolCallResponse("greet", {})],
      usage: { inputTokens: 3, outputTokens: 4 },
    })
    .mockReturnValueOnce(
      arrayToReadableStream([
        { delta: { text: { text: "Hello" } } },
        { delta: { text: { text: " world" } } },
        { delta: { json: { usage: { inputTokens: 10, outputTokens: 20 } } } },
      ]),
    );

  const aigne = new AIGNE({
    model,
  });

  const agent = AIAgent.from({
    name: "chat",
    skills: [
      FunctionAgent.from({
        name: "greet",
        process: () => ({
          message: "Hello world",
        }),
      }),
    ],
  });

  const response = await aigne.invoke(agent, { message: "hello" }, options);

  if (options.streaming) {
    assert(response instanceof ReadableStream);
    expect(
      omitDeep(await readableStreamToArray(response, { catchError: true }), "duration"),
    ).toMatchSnapshot();
  } else {
    expect(omitDeep(response, "duration")).toMatchInlineSnapshot(`
        {
          "$meta": {
            "usage": {
              "agentCalls": 4,
              "aigneHubCredits": 0,
              "cacheCreationInputTokens": 0,
              "cacheReadInputTokens": 0,
              "inputTokens": 13,
              "outputTokens": 24,
            },
          },
          "message": "Hello world",
        }
      `);
  }
});
