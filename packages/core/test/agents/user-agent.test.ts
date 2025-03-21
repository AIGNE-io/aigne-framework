import { expect, test } from "bun:test";
import { ExecutionEngine, UserAgent, createMessage } from "@aigne/core-next";

test("UserAgent.stream", async () => {
  const context = new ExecutionEngine({});

  const userAgent = UserAgent.from({
    name: "user_agent",
    context,
    subscribeTopic: "test_topic",
  });

  const reader = userAgent.stream.getReader();
  userAgent.publish("test_topic", "hello");
  expect(reader.read()).resolves.toEqual({
    value: {
      topic: "test_topic",
      role: "user",
      message: createMessage("hello"),
      source: "user_agent",
    },
    done: false,
  });

  reader.cancel();
});
