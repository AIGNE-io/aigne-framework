import { expect, test } from "bun:test";
import { DefaultMemoryStorage } from "@aigne/agent-library/default-memory/default-memory-storage";
import { AIGNE } from "@aigne/core";

test("DefaultMemoryStorage should search by fts", async () => {
  const context = new AIGNE().newContext();

  const storage = new DefaultMemoryStorage({
    enableFTS: true,
  });
  await storage.create({ content: "我喜欢红色" }, { context });
  await storage.create({ content: "我讨厌绿色" }, { context });

  const { result } = await storage.search({ search: "绿色", limit: 10 }, { context });
  expect(result).toMatchSnapshot([
    {
      id: expect.any(String),
      createdAt: expect.any(String),
    },
  ]);
});
