import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AIAgent,
  FunctionAgent,
  PromptBuilder,
  USER_INPUT_MESSAGE_KEY,
  addMessagesToInput,
  userInput,
} from "@aigne/core-next";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

test("userInput function should return correct object", () => {
  const message = "Hello";
  const result = userInput(message);
  expect(result).toEqual({ [USER_INPUT_MESSAGE_KEY]: message });
});

test("addMessagesToInput function should add messages correctly", () => {
  const input = addMessagesToInput({ [USER_INPUT_MESSAGE_KEY]: "Hello" }, [
    { role: "user", content: "How are you?" },
  ]);
  expect(input).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: "Hello" },
      { role: "user", content: "How are you?" },
    ],
  });

  const input1 = addMessagesToInput(
    { [USER_INPUT_MESSAGE_KEY]: [{ role: "user", content: "Hello" }] },
    [{ role: "agent", content: "How can I help you?" }],
  );
  expect(input1).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: "Hello" },
      { role: "agent", content: "How can I help you?" },
    ],
  });

  const input2 = addMessagesToInput({ [USER_INPUT_MESSAGE_KEY]: { name: "foo" } }, [
    { role: "agent", content: "How can I help you?" },
  ]);
  expect(input2).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: '{"name":"foo"}' },
      { role: "agent", content: "How can I help you?" },
    ],
  });
});

test("PromptBuilder should build messages correctly", async () => {
  const builder = PromptBuilder.from("Test instructions");

  const prompt1 = await builder.build({ input: userInput("Hello") });

  expect(prompt1.messages).toEqual([
    {
      role: "system",
      content: "Test instructions",
    },
    {
      role: "user",
      content: "Hello",
    },
  ]);

  const prompt2 = await builder.build({ input: userInput({ name: "foo" }) });
  expect(prompt2.messages).toEqual([
    {
      role: "system",
      content: "Test instructions",
    },
    {
      role: "user",
      content: '{"name":"foo"}',
    },
  ]);
});

test("PromptBuilder should build response format correctly", async () => {
  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    outputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const prompt = await agent.instructions.build({ input: {}, agent });

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

test("PromptBuilder should build tools correctly", async () => {
  const tool = FunctionAgent.from({
    name: "TestTool",
    description: "Test tool description",
    fn: () => ({}),
    inputSchema: z.object({
      name: z.string(),
      age: z.number().optional(),
    }),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    tools: [tool],
    toolChoice: tool,
  });

  const prompt = await agent.instructions.build({ input: {}, agent });

  expect(prompt.tools).toEqual([
    {
      type: "function",
      function: {
        name: "TestTool",
        description: "Test tool description",
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
      name: tool.name,
      description: tool.description,
    },
  });
});

test("PromptBuilder should build toolChoice with router mode correctly", async () => {
  const tool = FunctionAgent.from({
    name: "TestTool",
    description: "Test tool description",
    fn: () => ({}),
  });

  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
    tools: [tool],
    toolChoice: "router",
  });

  const prompt = await agent.instructions.build({ input: {}, agent });

  expect(prompt.toolChoice).toEqual("required");
});

test("PromptBuilder from string", async () => {
  const builder = PromptBuilder.from("Hello, {{agentName}}!");

  const prompt = await builder.build({ input: { agentName: "Alice" } });

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
  expect(await promptBuilder.build({})).toEqual(
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
  const path = join(import.meta.dirname, "test-prompt.txt");
  const content = await readFile(path, "utf-8");

  const builder = await PromptBuilder.from({ path });

  const prompt = await builder.build({ input: { agentName: "Alice" } });

  expect(prompt).toEqual({
    messages: [
      {
        role: "system",
        content: content.replace("{{agentName}}", "Alice"),
      },
    ],
  });
});
