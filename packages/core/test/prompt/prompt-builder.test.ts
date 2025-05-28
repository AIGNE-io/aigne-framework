import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AIAgent,
  AIAgentToolChoice,
  AIGNE,
  FunctionAgent,
  MESSAGE_KEY,
  PromptBuilder,
  createMessage,
} from "@aigne/core";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { MockMemory } from "../_mocks/mock-memory.js";

test("userInput function should return correct object", () => {
  const message = "Hello";
  const result = createMessage(message);
  expect(result).toEqual({ [MESSAGE_KEY]: message });
});

test("PromptBuilder should build messages correctly", async () => {
  const context = new AIGNE().newContext();

  const builder = PromptBuilder.from("Test instructions");

  const memory = new MockMemory({});
  await memory.record(
    {
      role: "agent",
      content: [createMessage("Hello, How can I help you?")],
      source: "TestAgent",
    },

    context,
  );

  const agent = AIAgent.from({
    memory,
  });

  const prompt1 = await builder.build({
    agent,
    input: createMessage("Hello"),
    context,
  });

  expect(prompt1.messages).toEqual([
    {
      role: "system",
      content: "Test instructions",
    },
    {
      role: "system",
      content: expect.stringContaining("Hello, How can I help you?"),
    },
    {
      role: "user",
      content: "Hello",
    },
  ]);

  const prompt2 = await builder.build({
    input: createMessage({ name: "foo" }),
    context,
  });
  expect(prompt2.messages).toEqual([
    {
      role: "system",
      content: "Test instructions",
    },
  ]);
});

test("PromptBuilder should build response format correctly", async () => {
  const context = new AIGNE().newContext();

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    outputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.responseFormat).toEqual({
    type: "json_schema",
    jsonSchema: {
      name: "output",
      schema: expect.objectContaining({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
        additionalProperties: false,
      }),
      strict: true,
    },
  });
});

test("PromptBuilder should build skills correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
    inputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill],
    toolChoice: skill,
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.tools).toEqual([
    {
      type: "function",
      function: {
        name: "TestSkill",
        description: "Test skill description",
        parameters: expect.objectContaining({
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
          additionalProperties: false,
        }),
      },
    },
  ]);

  expect(prompt.toolChoice).toEqual({
    type: "function",
    function: {
      name: skill.name,
      description: skill.description,
    },
  });
});

test("PromptBuilder should unique skills correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill, skill],
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.tools).toHaveLength(1);
});

test("PromptBuilder should build toolChoice with router mode correctly", async () => {
  const context = new AIGNE().newContext();

  const skill = FunctionAgent.from({
    name: "TestSkill",
    description: "Test skill description",
    process: () => ({}),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    skills: [skill],
    toolChoice: AIAgentToolChoice.router,
  });

  const prompt = await agent.instructions.build({ input: {}, agent, context });

  expect(prompt.toolChoice).toEqual("required");
});

test("PromptBuilder from string", async () => {
  const context = new AIGNE().newContext();

  const builder = PromptBuilder.from("Hello, {{agentName}}!");

  const prompt = await builder.build({ input: { agentName: "Alice" }, context });

  expect(prompt).toEqual({
    messages: [
      {
        role: "system",
        content: "Hello, Alice!",
      },
    ],
  });
});

test("PromptBuilder from MCP prompt result", async () => {
  const context = new AIGNE().newContext();

  const prompt: GetPromptResult = {
    description: "Test prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Hello",
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: "echo://Hello",
            text: "Resource echo: Hello",
            mimeType: "text/plain",
          },
        },
      },
      {
        role: "user",
        content: {
          type: "resource",
          resource: {
            uri: "test://image-resource",
            blob: Buffer.from("FAKE IMAGE FROM RESOURCE").toString("base64"),
            mimeType: "image/png",
          },
        },
      },
      {
        role: "user",
        content: {
          type: "image",
          mimeType: "image/png",
          data: Buffer.from("FAKE IMAGE").toString("base64"),
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "How can I help you?",
        },
      },
    ],
  };

  const promptBuilder = PromptBuilder.from(prompt);
  expect(await promptBuilder.build({ context })).toEqual(
    expect.objectContaining({
      messages: [
        {
          role: "user",
          content: "Hello",
        },
        {
          role: "user",
          content: "Resource echo: Hello",
        },
        {
          role: "user",
          content: [
            { type: "image_url", url: Buffer.from("FAKE IMAGE FROM RESOURCE").toString("base64") },
          ],
        },
        {
          role: "user",
          content: [{ type: "image_url", url: Buffer.from("FAKE IMAGE").toString("base64") }],
        },
        {
          role: "agent",
          content: "How can I help you?",
        },
      ],
    }),
  );
});

test("PromptBuilder from file", async () => {
  const context = new AIGNE().newContext();

  const path = join(import.meta.dirname, "test-prompt.txt");
  const content = await readFile(path, "utf-8");

  const builder = await PromptBuilder.from({ path });

  const prompt = await builder.build({ input: { agentName: "Alice" }, context });

  expect(prompt).toEqual({
    messages: [
      {
        role: "system",
        content: content.replace("{{agentName}}", "Alice"),
      },
    ],
  });
});
