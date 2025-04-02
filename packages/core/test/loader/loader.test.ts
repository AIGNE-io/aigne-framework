import { expect, mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, ChatModel, ExecutionEngine, createMessage } from "@aigne/core";
import { loadAIGNEFile, loadAgent } from "@aigne/core/loader/index.js";
import { ClaudeChatModel } from "@aigne/core/models/claude-chat-model.js";
import { nanoid } from "nanoid";

test("ExecutionEngine.load should load agents correctly", async () => {
  const engine = await ExecutionEngine.load({
    path: join(import.meta.dirname, "../../test-agents"),
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
  expect(chat.tools[0]).toEqual(expect.objectContaining({ name: "evaluateJs" }));

  expect(engine.model).toBeInstanceOf(ChatModel);
  assert(engine.model, "model should be defined");

  spyOn(engine.model, "call")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: nanoid(),
            type: "function",
            function: { name: "evaluateJs", arguments: { code: "1 + 1" } },
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
    path: join(import.meta.dirname, "../../test-agents"),
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
  expect([...engine.tools]).toEqual([expect.objectContaining({ name: "evaluateJs" }), testTool]);
});

test("loader should error if agent file is not supported", async () => {
  const engine = loadAgent(join(import.meta.dirname, "./not-exist-agent-library/test.txt"));
  expect(engine).rejects.toThrow("Unsupported agent file type");
});

test("loadAIGNEFile should error if aigne.yaml file is invalid", async () => {
  const readFile = mock()
    .mockReturnValueOnce(Promise.reject(new Error("no such file or directory")))
    .mockReturnValueOnce(Promise.resolve("[this is not a valid yaml}"))
    .mockReturnValueOnce("chat_model: 123");

  expect(loadAIGNEFile("./not-exist-aigne.yaml", { readFile })).rejects.toThrow(
    "no such file or directory",
  );

  expect(loadAIGNEFile("./invalid-aigne.yaml", { readFile })).rejects.toThrow(
    "Failed to parse aigne.yaml",
  );

  expect(loadAIGNEFile("./invalid-content-aigne.yaml", { readFile })).rejects.toThrow(
    "Failed to validate aigne.yaml",
  );
});
