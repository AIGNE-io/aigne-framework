import { expect, test } from "bun:test";
import { AIGNE, MessageQueue } from "@aigne/core";

test("MessageQueue.subscribe should resolve a message", async () => {
  const context = new AIGNE().newContext();

  const messageQueue = new MessageQueue();

  const message = messageQueue.subscribe("test_topic");
  messageQueue.publish("test_topic", {
    role: "user",
    message: { message: "hello" },
    source: "test_user",
    context,
  });
  expect(message).resolves.toEqual({
    role: "user",
    message: { message: "hello" },
    source: "test_user",
    context,
  });
});

test("MessageQueue.subscribe should reject", async () => {
  const messageQueue = new MessageQueue();

  const message = messageQueue.subscribe("test_topic");
  messageQueue.error(new Error("test error"));
  expect(message).rejects.toEqual(expect.objectContaining({ message: "test error" }));
});
