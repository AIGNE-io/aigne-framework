import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, ChatModel, ExecutionEngine, createMessage } from "@aigne/core";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { nanoid } from "nanoid";

test("loader should load agents correctly", async () => {
  const engine = await ExecutionEngine.load({
    path: join(import.meta.dirname, "./test-agent-library/chat"),
  });

  expect(engine.agents.length).toBe(1);

  const chat = engine.agents[0];
  expect(chat).toEqual(
    expect.objectContaining({
      name: "chat",
    }),
  );
  assert(chat, "chat agent should be defined");

  expect(chat.tools.length).toBe(1);
  expect(chat.tools[0]).toEqual(expect.objectContaining({ name: "calculate" }));

  expect(engine.model).toBeInstanceOf(ChatModel);
  assert(engine.model, "model should be defined");

  spyOn(engine.model, "call")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: nanoid(),
            type: "function",
            function: { name: "calculate", arguments: { a: 1, b: 2 } },
          },
        ],
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ text: "1 + 2 = 3" }));

  const result = await engine.call(chat, "1 + 2 = ?");
  expect(result).toEqual(expect.objectContaining(createMessage("1 + 2 = 3")));
});

test("loader should use override options", async () => {
  const model = new ClaudeChatModel({});
  const testAgent = AIAgent.from({ name: "test-agent" });
  const testTool = AIAgent.from({ name: "test-tool" });

  const engine = await ExecutionEngine.load({
    path: join(import.meta.dirname, "./test-agent-library/chat"),
    model,
    agents: [testAgent],
    tools: [testTool],
  });

  expect(engine.model).toBe(model);
  expect([...engine.agents]).toEqual([
    expect.objectContaining({
      name: "chat",
    }),
    testAgent,
  ]);
  expect([...engine.tools]).toEqual([expect.objectContaining({ name: "calculate" }), testTool]);
});

test("loader should error if agent file is not supported", async () => {
  const engine = ExecutionEngine.load({
    path: join(import.meta.dirname, "./test-agent-library/invalid-agent-file"),
  });

  expect(engine).rejects.toThrow("Unsupported agent file type");
});
