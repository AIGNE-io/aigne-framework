import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AIAgent, AIGNE, type MemoryRecorderInput, stringToAgentResponseStream } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { v7 } from "uuid";
import { z } from "zod";
import { DefaultMemoryStorage } from "../../src/adapter/default-memory-storage/index.js";
import { DefaultMemory } from "../../src/adapter/memory.js";

test("should add a new memory", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory();
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory: MemoryRecorderInput["content"][number] = {
    input: { text: "Hello" },
  };

  await memoryAgent.record({ content: [memory] }, context);

  const { result: allMemories } = await storage.search({}, { context });

  expect(allMemories).toHaveLength(1);
  expect(allMemories[0]).toEqual(
    expect.objectContaining({
      content: memory,
    }),
  );
});

test("should add multiple different memories", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory({});
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory1: MemoryRecorderInput["content"][number] = {
    input: { text: "Hello" },
  };
  const memory2: MemoryRecorderInput["content"][number] = {
    output: { text: "Hi there" },
  };

  await memoryAgent.record({ content: [memory1] }, context);
  await memoryAgent.record({ content: [memory2] }, context);

  const { result: allMemories } = await storage.search(
    { orderBy: ["createdAt", "asc"] },
    { context },
  );

  expect(allMemories).toHaveLength(2);
  expect(allMemories[0]).toEqual(expect.objectContaining({ content: memory1 }));
  expect(allMemories[1]).toEqual(expect.objectContaining({ content: memory2 }));
});

test("DefaultMemory should add memory with correct sessionId", async () => {
  const context = new AIGNE().newContext({
    userContext: { userId: "test_user_id" },
  });

  const memoryAgent = new DefaultMemory({
    storage: {
      getSessionId: (context) => context.userContext.userId as string,
    },
  });
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory: MemoryRecorderInput["content"][number] = {
    input: { text: "Hello" },
  };

  await memoryAgent.record({ content: [memory] }, context);

  const { result: allMemories } = await storage.search({}, { context });

  expect(allMemories).toHaveLength(1);
  expect(allMemories[0]).toEqual(
    expect.objectContaining({
      sessionId: "test_user_id",
      content: memory,
    }),
  );
});

test("DefaultMemory should persist memories if path options is provided", async () => {
  const context = new AIGNE().newContext({
    userContext: { userId: "test_user_id" },
  });

  const path = join(tmpdir(), `${v7()}.db`);
  try {
    const memoryAgent = new DefaultMemory({
      storage: { url: `file:${path}` },
    });
    const storage = memoryAgent.storage;
    assert(storage instanceof DefaultMemoryStorage);

    const memory: MemoryRecorderInput["content"][number] = {
      input: { text: "Hello" },
    };

    await memoryAgent.record({ content: [memory] }, context);

    expect((await stat(path)).isFile()).toBe(true);
  } finally {
    await rm(path, { force: true, recursive: true });
  }
});

test("DefaultMemory should remember memories for AIAgent correctly", async () => {
  const model = new OpenAIChatModel();

  const memory = new DefaultMemory({
    inputKey: "message",
    outputKey: "message",
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    memory: [memory],
    inputSchema: z.object({
      language: z.string(),
    }),
    instructions: "You are a helpful assistant.\nPlease answer in {{language}}.",
    inputKey: "message",
    outputKey: "message",
  });

  const aigne = new AIGNE({ model, agents: [agent] });

  const modelProcess = spyOn(model, "process");

  modelProcess.mockReturnValueOnce(stringToAgentResponseStream("Great, the blue color is nice!"));
  await aigne.invoke(agent, { message: "I like blue color", language: "zh" });
  expect(modelProcess.mock.lastCall?.[0].messages).toMatchSnapshot();

  modelProcess.mockReturnValueOnce(stringToAgentResponseStream("Red is also a nice color!"));
  await aigne.invoke(agent, {
    message: "I also like red color",
    language: "zh",
  });
  expect(modelProcess.mock.lastCall?.[0].messages).toMatchSnapshot();

  const storage = memory.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const { result: allMemories } = await storage.search({}, { context: aigne.newContext() });
  expect(allMemories).toMatchSnapshot(
    new Array(allMemories.length).fill(0).map(() => ({
      createdAt: expect.any(String),
      id: expect.any(String),
      sessionId: null,
    })),
  );
});
