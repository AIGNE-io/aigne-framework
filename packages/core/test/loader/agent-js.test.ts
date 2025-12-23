import { expect, test } from "bun:test";
import { resolve } from "node:path";
import { loadAgentFromJsFile } from "@aigne/core/loader/agent-js.js";
import type { AgentSchema } from "@aigne/core/loader/agent-yaml.js";
import { pick } from "@aigne/core/utils/type-utils.js";
import { mockModule } from "../_mocks/mock-module.js";

test("loadAgentFromJs should error if agent.js file is invalid", async () => {
  const fn = () => {};
  fn.description = 123;

  await using _1 = await mockModule("@aigne/test-not-found-agent", () =>
    Promise.reject(new Error("no such file or directory")),
  );
  expect(loadAgentFromJsFile("@aigne/test-not-found-agent", {})).rejects.toThrow(
    "no such file or directory",
  );

  await using _3 = await mockModule("@aigne/not-valid-agent", () => ({ default: fn }));
  expect(loadAgentFromJsFile("@aigne/not-valid-agent", {})).rejects.toThrow(
    "Failed to parse agent",
  );
});

test("loadAgentFromJs should support construct agent from json data as yaml format", async () => {
  const agent = (await loadAgentFromJsFile(
    resolve("../test-agents/test-json-definition-agent.mjs"),
    {},
  )) as AgentSchema;

  expect(pick(agent as any, "type", "name", "instructions")).toMatchInlineSnapshot(`
    {
      "instructions": {
        "url": "./chat-prompt.md",
      },
      "name": "testJsonDefinitionAgent",
      "type": "ai",
    }
  `);
});
