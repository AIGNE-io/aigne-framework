import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { ChatModel, createMessage } from "@aigne/core";
import { load } from "@aigne/core/loader/index.js";
import { nanoid } from "nanoid";

test("loader should load agents correctly", async () => {
  const engine = await load({ path: join(import.meta.dirname, "./test-agent-library/chat") });

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

test("loader should error if agent file is not supported", async () => {
  const engine = load({
    path: join(import.meta.dirname, "./test-agent-library/invalid-agent-file"),
  });

  expect(engine).rejects.toThrow("Unsupported agent file type");
});
