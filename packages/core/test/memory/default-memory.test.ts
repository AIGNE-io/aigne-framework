import { expect, test } from "bun:test";
import { AIGNE, createMessage } from "@aigne/core";
import { DefaultMemory } from "@aigne/core/memory/default-memory.js";

test("should add a new memory if it is not the same as the last one", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory();
  const memory = { role: "user", content: { text: "Hello" } };

  await memoryAgent.record({ content: [memory] }, context);

  expect(memoryAgent.storage).toHaveLength(1);
  expect(memoryAgent.storage[0]).toEqual(
    expect.objectContaining({
      content: memory,
    }),
  );
});

test("should not add a new memory if it is the same as the last one", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory({});
  const memory = { role: "user", content: { text: "Hello" } };

  await memoryAgent.record({ content: [memory] }, context);
  await memoryAgent.record({ content: [memory] }, context);

  expect(memoryAgent.storage).toHaveLength(1);
});

test("should add multiple different memories", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory({});
  const memory1 = { role: "user", content: { text: "Hello" } };
  const memory2 = { role: "agent", content: { text: "Hi there" } };

  await memoryAgent.record({ content: [memory1] }, context);
  await memoryAgent.record({ content: [memory2] }, context);

  expect(memoryAgent.storage).toHaveLength(2);
  expect(memoryAgent.storage[0]).toEqual(expect.objectContaining({ content: memory1 }));
  expect(memoryAgent.storage[1]).toEqual(expect.objectContaining({ content: memory2 }));
});

test("should add memory after topic trigger", async () => {
  const context = new AIGNE({}).newContext();

  const memory = new DefaultMemory({
    subscribeTopic: "test_topic",
  });

  memory.attach(context);

  const sub = context.subscribe("test_topic");

  context.publish("test_topic", "hello");

  await sub;

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(memory.storage).toEqual([
    expect.objectContaining({
      content: {
        role: "user",
        content: createMessage("hello"),
      },
    }),
  ]);
});
