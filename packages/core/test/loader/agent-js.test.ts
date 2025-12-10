import { expect, test } from "bun:test";
import assert from "node:assert";
import { resolve } from "node:path";
import { loadAgentFromJsFile } from "@aigne/core/loader/agent-js.js";
import type { AgentSchema } from "@aigne/core/loader/agent-yaml.js";
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

  assert(agent.type === "ai");

  expect(agent.name).toMatchInlineSnapshot(`"testJsonDefinitionAgent"`);
  expect(agent.instructions?.map((i) => i.content)).toMatchInlineSnapshot(`
    [
      
    "You are a helper agent to answer everything about chat prompt in AIGNE.

    {% include "language_instruction.txt" %}
    "
    ,
    ]
  `);
});
