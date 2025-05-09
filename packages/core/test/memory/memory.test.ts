import { expect, test } from "bun:test";
import { MemoryAgent } from "@aigne/core/memory/memory.js";

test("should add a new memory if it is not the same as the last one", async () => {
  const memoryAgent = new MemoryAgent({});

  expect(memoryAgent.isCallable).toBe(false);
  expect(memoryAgent.invoke("hello")).rejects.toThrow("not implemented");
});
