import { expect, test } from "bun:test";
import { AgentMemory, ExecutionEngine, type Memory, createMessage } from "@aigne/core-next";

test("should add a new memory if it is not the same as the last one", () => {
  const agentMemory = new AgentMemory({});
  const memory: Memory = { role: "user", content: { text: "Hello" } };

  agentMemory.addMemory(memory);

  expect(agentMemory.memories).toHaveLength(1);
  expect(agentMemory.memories[0]).toEqual(memory);
});

test("should not add a new memory if it is the same as the last one", () => {
  const agentMemory = new AgentMemory({});
  const memory: Memory = { role: "user", content: { text: "Hello" } };

  agentMemory.addMemory(memory);
  agentMemory.addMemory(memory);

  expect(agentMemory.memories).toHaveLength(1);
});

test("should add multiple different memories", () => {
  const agentMemory = new AgentMemory({});
  const memory1: Memory = { role: "user", content: { text: "Hello" } };
  const memory2: Memory = { role: "agent", content: { text: "Hi there" } };

  agentMemory.addMemory(memory1);
  agentMemory.addMemory(memory2);

  expect(agentMemory.memories).toHaveLength(2);
  expect(agentMemory.memories[0]).toEqual(memory1);
  expect(agentMemory.memories[1]).toEqual(memory2);
});

test("should add memory after topic trigger", () => {
  const context = new ExecutionEngine({});

  const memory = new AgentMemory({
    subscribeTopic: "test_topic",
  });

  memory.attach(context);
  context.publish("test_topic", "hello");
  expect(memory.memories).toEqual([
    {
      role: "user",
      content: createMessage("hello"),
    },
  ]);

  // should not add memory if the memory is detached
  memory.detach();
  context.publish("test_topic", "world");
  expect(memory.memories).toEqual([
    {
      role: "user",
      content: createMessage("hello"),
    },
  ]);
});
