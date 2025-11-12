import { expect, test } from "bun:test";
import { loadAgentFromJsFile } from "@aigne/core/loader/agent-js.js";
import { mockModule } from "../_mocks/mock-module.js";

test("loadAgentFromJs should error if agent.js file is invalid", async () => {
  const fn = () => {};
  fn.description = 123;

  await using _1 = await mockModule("@aigne/test-not-found-agent", () =>
    Promise.reject(new Error("no such file or directory")),
  );
  expect(loadAgentFromJsFile("@aigne/test-not-found-agent")).rejects.toThrow(
    "no such file or directory",
  );

  await using _3 = await mockModule("@aigne/not-valid-agent", () => ({ default: fn }));
  expect(loadAgentFromJsFile("@aigne/not-valid-agent")).rejects.toThrow("Failed to parse agent");
});

test("loadAgentFromJs should support construct agent from json data as yaml format", async () => {
  const agent = await loadAgentFromJsFile("../../test-agents/test-json-definition-agent.mjs");
  expect(agent.name).toBe("testJsonDefinitionAgent");
});
