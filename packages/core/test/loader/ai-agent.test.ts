import { expect, test } from "bun:test";
import assert from "node:assert";
import { join } from "node:path";
import { AIAgent, FunctionAgent } from "@aigne/core";
import { loadAgent } from "@aigne/core/loader";
import { outputSchemaToResponseFormatSchema } from "@aigne/core/utils/json-schema";

test("loadAgent should load agents correctly", async () => {
  const agent = await loadAgent(join(import.meta.dirname, "./test-agent-library/ai-agent.yaml"));

  expect(agent).toBeInstanceOf(AIAgent);
  assert(agent instanceof AIAgent, "agent should be an instance of AIAgent");

  expect(agent).toEqual(
    expect.objectContaining({
      name: "chat",
      description: "Chat agent",
      outputKey: "test_output",
    }),
  );
  expect(agent.instructions.instructions).toBe(`\
You are a helpful assistant that can answer questions and provide information on a wide range of topics.
Your goal is to assist users in finding the information they need and to engage in friendly conversation.
`);
  expect(outputSchemaToResponseFormatSchema(agent.inputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question or topic the user wants to discuss.",
        },
      },
      required: ["question"],
    }),
  );
  expect(outputSchemaToResponseFormatSchema(agent.outputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "The answer or information provided by the agent.",
        },
      },
      required: ["answer"],
    }),
  );

  expect(agent.tools.length).toBe(1);
  const tool = agent.tools[0];
  expect(tool).toBeInstanceOf(FunctionAgent);
  assert(tool instanceof FunctionAgent, "tool should be an instance of FunctionAgent");
  expect(tool).toEqual(
    expect.objectContaining({
      name: "plus",
      description: "This agent calculates the sum of two numbers.",
    }),
  );
  expect(outputSchemaToResponseFormatSchema(tool.inputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        a: {
          type: "number",
          description: "First number",
        },
        b: {
          type: "number",
          description: "Second number",
        },
      },
      required: ["a", "b"],
    }),
  );
  expect(outputSchemaToResponseFormatSchema(tool.outputSchema)).toEqual(
    expect.objectContaining({
      type: "object",
      properties: {
        sum: {
          type: "number",
          description: "Sum of the two numbers",
        },
      },
      required: ["sum"],
    }),
  );
});
