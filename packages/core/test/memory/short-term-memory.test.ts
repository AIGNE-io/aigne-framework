import { expect, test } from "bun:test";
import { ExecutionEngine, createMessage, createPublishMessage } from "@aigne/core";
import type { Memory } from "@aigne/core/memory/memory";
import { ShortTermMemory } from "@aigne/core/memory/short-term-memory.js";

test("should add a new memory if it is not the same as the last one", async () => {
  const context = new ExecutionEngine().newContext();

  const agentMemory = new ShortTermMemory({});
  const memory: Memory = { role: "user", content: { text: "Hello" } };

  await agentMemory.record({ messages: [memory] }, context);

  expect(agentMemory.memories).toHaveLength(1);
  expect(agentMemory.memories[0]).toEqual(memory);
});

test("should not add a new memory if it is the same as the last one", async () => {
  const context = new ExecutionEngine().newContext();

  const agentMemory = new ShortTermMemory({});
  const memory: Memory = { role: "user", content: { text: "Hello" } };

  await agentMemory.record(memory, context);
  await agentMemory.record(memory, context);

  expect(agentMemory.memories).toHaveLength(1);
});

test("should add multiple different memories", async () => {
  const context = new ExecutionEngine().newContext();

  const agentMemory = new ShortTermMemory({});
  const memory1: Memory = { role: "user", content: { text: "Hello" } };
  const memory2: Memory = { role: "agent", content: { text: "Hi there" } };

  await agentMemory.record(memory1, context);
  await agentMemory.record(memory2, context);

  expect(agentMemory.memories).toHaveLength(2);
  expect(agentMemory.memories[0]).toEqual(memory1);
  expect(agentMemory.memories[1]).toEqual(memory2);
});

test("should add memory after topic trigger", () => {
  const context = new ExecutionEngine({}).newContext();

  const memory = new ShortTermMemory({
    subscribeTopic: "test_topic",
  });

  memory.attach(context);
  context.publish("test_topic", createPublishMessage("hello"));
  expect(memory.memories).toEqual([
    {
      role: "user",
      content: createMessage("hello"),
    },
  ]);

  // should not add memory if the memory is detached
  memory.detach();
  context.publish("test_topic", createPublishMessage("world"));
  expect(memory.memories).toEqual([
    {
      role: "user",
      content: createMessage("hello"),
    },
  ]);
});
