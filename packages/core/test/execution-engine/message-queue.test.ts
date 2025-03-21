import { expect, test } from "bun:test";
import { MessageQueue, createMessage } from "@aigne/core-next";

test("MessageQueue.subscribe should resolve a message", async () => {
  const messageQueue = new MessageQueue();

  const message = messageQueue.subscribe("test_topic");
  messageQueue.publish("test_topic", {
    role: "user",
    message: createMessage("hello"),
    source: "test_user",
  });
  expect(message).resolves.toEqual({
    role: "user",
    message: createMessage("hello"),
    source: "test_user",
  });
});

test("MessageQueue.subscribe should reject", async () => {
  const messageQueue = new MessageQueue();

  const message = messageQueue.subscribe("test_topic");
  messageQueue.error(new Error("test error"));
  expect(message).rejects.toEqual(expect.objectContaining({ message: "test error" }));
});
