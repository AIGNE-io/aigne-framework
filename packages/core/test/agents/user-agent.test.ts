import { expect, mock, spyOn, test } from "bun:test";
import { AIAgent, AIGNE, UserAgent, createMessage, createPublishMessage } from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";

test("UserAgent.stream", async () => {
  const aigne = new AIGNE({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: aigne.newContext(),
    subscribeTopic: "test_topic",
  });

  const reader = userAgent.stream.getReader();
  userAgent.publish("test_topic", createPublishMessage("hello", userAgent));
  expect(reader.read()).resolves.toEqual({
    value: {
      topic: "test_topic",
      role: "user",
      message: createMessage("hello"),
      source: "user_agent",
      context: expect.anything(),
    },
    done: false,
  });

  reader.cancel();
});

test("UserAgent.invoke should invoke process correctly", async () => {
  const aigne = new AIGNE({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: aigne.newContext(),
    process: (input) => input,
  });

  const result = await aigne.invoke(userAgent, "hello");
  expect(result).toEqual(createMessage("hello"));
});

test("UserAgent.invoke should invoke activeAgent correctly", async () => {
  const aigne = new AIGNE({});

  const testAgent = AIAgent.from({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: aigne.newContext(),
    activeAgent: testAgent,
  });

  const testAgentCall = spyOn(testAgent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([{ delta: { json: createMessage("world") } }]),
  );

  const result = await aigne.invoke(userAgent, "hello");
  expect(result).toEqual(createMessage("world"));
  expect(testAgentCall).toHaveBeenLastCalledWith(
    createMessage("hello"),
    expect.anything(),
    expect.anything(),
  );
});

test("UserAgent.invoke should publish topic correctly", async () => {
  const aigne = new AIGNE({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: aigne.newContext(),
    publishTopic: "test_publish_topic",
  });

  const sub = aigne.subscribe("test_publish_topic");

  await aigne.invoke(userAgent, "hello");

  expect(sub).resolves.toEqual(
    expect.objectContaining({
      message: createMessage("hello"),
    }),
  );
});

test("UserAgent pub/sub should work correctly", async () => {
  const aigne = new AIGNE({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: aigne.newContext(),
    publishTopic: "test_publish_topic",
  });

  const listener = mock();
  userAgent.subscribe("test_sub", listener);

  userAgent.publish("test_sub", createPublishMessage("hello"));
  expect(listener).toHaveBeenLastCalledWith(
    expect.objectContaining({
      message: createMessage("hello"),
    }),
  );

  userAgent.unsubscribe("test_sub", listener);
  userAgent.publish("test_sub", createPublishMessage("hello"));
  expect(listener).toHaveBeenCalledTimes(1);
});
