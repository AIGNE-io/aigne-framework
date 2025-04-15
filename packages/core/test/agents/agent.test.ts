import { expect, test } from "bun:test";
import { inspect } from "node:util";
import { AIAgent } from "@aigne/core";

test("Agent inspect should return it's name", async () => {
  expect(inspect(AIAgent.from({}))).toBe("AIAgent");

  expect(inspect(AIAgent.from({ name: "test_agent" }))).toBe("test_agent");
});
