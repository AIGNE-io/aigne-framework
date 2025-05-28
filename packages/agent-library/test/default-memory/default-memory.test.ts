import { expect, test } from "bun:test";
import assert from "node:assert";
import { rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DefaultMemoryStorage } from "@aigne/agent-library/default-memory/default-memory-storage/index.js";
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIGNE } from "@aigne/core";
import { v7 } from "uuid";

test("should add a new memory if it is not the same as the last one", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory();
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory = { role: "user", content: { text: "Hello" } };

  await memoryAgent.record({ content: [memory] }, context);

  const { result: allMemories } = await storage.search({}, { context });

  expect(allMemories).toHaveLength(1);
  expect(allMemories[0]).toEqual(
    expect.objectContaining({
      content: memory,
    }),
  );
});

test("should not add a new memory if it is the same as the last one", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory({});
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory = { role: "user", content: { text: "Hello" } };

  await memoryAgent.record({ content: [memory] }, context);
  await memoryAgent.record({ content: [memory] }, context);

  const { result: allMemories } = await storage.search({}, { context });

  expect(allMemories).toHaveLength(1);
});

test("should add multiple different memories", async () => {
  const context = new AIGNE().newContext();

  const memoryAgent = new DefaultMemory({});
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory1 = { role: "user", content: { text: "Hello" } };
  const memory2 = { role: "agent", content: { text: "Hi there" } };

  await memoryAgent.record({ content: [memory1] }, context);
  await memoryAgent.record({ content: [memory2] }, context);

  const { result: allMemories } = await storage.search({}, { context });

  expect(allMemories).toHaveLength(2);
  expect(allMemories[0]).toEqual(expect.objectContaining({ content: memory1 }));
  expect(allMemories[1]).toEqual(expect.objectContaining({ content: memory2 }));
});

test("DefaultMemory should add memory with correct sessionId", async () => {
  const context = new AIGNE().newContext({ userContext: { userId: "test_user_id" } });

  const memoryAgent = new DefaultMemory({
    storage: { getSessionId: (context) => context.userContext.userId as string },
  });
  const storage = memoryAgent.storage;
  assert(storage instanceof DefaultMemoryStorage);

  const memory = { role: "user", content: { text: "Hello" } };

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
  const context = new AIGNE().newContext({ userContext: { userId: "test_user_id" } });

  const path = join(tmpdir(), `${v7()}.db`);
  try {
    const memoryAgent = new DefaultMemory({
      storage: { url: `file:${path}` },
    });
    const storage = memoryAgent.storage;
    assert(storage instanceof DefaultMemoryStorage);

    const memory = { role: "user", content: { text: "Hello" } };

    await memoryAgent.record({ content: [memory] }, context);

    expect((await stat(path)).isFile()).toBe(true);
  } finally {
    await rm(path, { force: true, recursive: true });
  }
});
