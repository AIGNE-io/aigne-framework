import { expect, mock, spyOn, test } from "bun:test";
import {
  AIAgent,
  ExecutionEngine,
  UserAgent,
  createMessage,
  createPublishMessage,
} from "@aigne/core";
import { arrayToAgentProcessAsyncGenerator } from "@aigne/core/utils/stream-utils.js";

test("UserAgent.stream", async () => {
  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: engine.newContext(),
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

test("UserAgent.call should call process correctly", async () => {
  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: engine.newContext(),
    process: (input) => input,
  });

  const result = await engine.call(userAgent, "hello");
  expect(result).toEqual(createMessage("hello"));
});

test("UserAgent.call should call activeAgent correctly", async () => {
  const engine = new ExecutionEngine({});

  const testAgent = AIAgent.from({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: engine.newContext(),
    activeAgent: testAgent,
  });

  const testAgentCall = spyOn(testAgent, "process").mockReturnValueOnce(
    arrayToAgentProcessAsyncGenerator([{ delta: { json: createMessage("world") } }]),
  );

  const result = await engine.call(userAgent, "hello");
  expect(result).toEqual(createMessage("world"));
  expect(testAgentCall).toHaveBeenLastCalledWith(
    createMessage("hello"),
    expect.anything(),
    expect.anything(),
  );
});

test("UserAgent.call should publish topic correctly", async () => {
  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: engine.newContext(),
    publishTopic: "test_publish_topic",
  });

  const sub = engine.subscribe("test_publish_topic");

  await engine.call(userAgent, "hello");

  expect(sub).resolves.toEqual(
    expect.objectContaining({
      message: createMessage("hello"),
    }),
  );
});

test("UserAgent pub/sub should work correctly", async () => {
  const engine = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context: engine.newContext(),
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
