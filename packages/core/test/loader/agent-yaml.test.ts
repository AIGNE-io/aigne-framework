import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, FunctionAgent } from "@aigne/core";
import { loadAgentFromYamlFile } from "@aigne/core/loader/agent-yaml.js";
import { loadAgent } from "@aigne/core/loader/index.js";
import { outputSchemaToResponseFormatSchema } from "@aigne/core/utils/json-schema.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

test("loadAgentFromYaml should load agent correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "../../test-agents/chat.yaml"));

  expect(agent).toBeInstanceOf(AIAgent);
  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");

  expect(agent).toEqual(
    expect.objectContaining({
      name: "chat",
      description: "Chat agent",
    }),
  );
  expect(agent.instructions.instructions).toBe(`\
You are a helpful assistant that can answer questions and provide information on a wide range of topics.
Your goal is to assist users in finding the information they need and to engage in friendly conversation.
`);

  expect(agent.skills.length).toBe(1);
  const tool = agent.skills[0];
  expect(tool).toBeInstanceOf(FunctionAgent);
  assert(tool instanceof FunctionAgent, "tool should be an instance of FunctionAgent");
  expect(tool).toEqual(
    expect.objectContaining({
      name: "evaluateJs",
      description: "This agent evaluates JavaScript code.",
    }),
  );
  expect(outputSchemaToResponseFormatSchema(tool.inputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "JavaScript code to evaluate",
        },
      },
      required: ["code"],
    }),
  );
  expect(outputSchemaToResponseFormatSchema(tool.outputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        result: {
          description: "Result of the evaluated code",
        },
      },
    }),
  );
});

test("loadAgentFromYaml should error if agent.yaml file is invalid", async () => {
  spyOn(nodejs.fs, "readFile")
    .mockReturnValueOnce(Promise.reject(new Error("no such file or directory")))
    .mockReturnValueOnce(Promise.resolve("[this is not a valid yaml}"))
    .mockReturnValueOnce(Promise.resolve("name: 123"));

  expect(loadAgentFromYamlFile("./not-exist-aigne.yaml")).rejects.toThrow(
    "no such file or directory",
  );

  expect(loadAgentFromYamlFile("./invalid-aigne.yaml")).rejects.toThrow(
    "Failed to parse agent definition",
  );

  expect(loadAgentFromYamlFile("./invalid-content-aigne.yaml")).rejects.toThrow(
    "Failed to validate agent definition",
  );
});

test("loadAgentFromYaml should load mcp agent correctly", async () => {
  spyOn(nodejs.fs, "readFile")
    .mockReturnValueOnce(
      Promise.resolve(`\
type: mcp
url: http://localhost:3000/sse
`),
    )
    .mockReturnValueOnce(
      Promise.resolve(`\
type: mcp
command: npx
args: ["-y", "@modelcontextprotocol/server-filesystem", "."]
`),
    );

  expect(await loadAgentFromYamlFile("./remote-mcp.yaml")).toEqual({
    type: "mcp",
    url: "http://localhost:3000/sse",
  });

  expect(await loadAgentFromYamlFile("./local-mcp.yaml")).toEqual({
    type: "mcp",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
  });
});
