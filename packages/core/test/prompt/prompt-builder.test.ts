import { expect, test } from "bun:test";
import { FunctionAgent, PromptTemplate } from "@aigne/core";
import { ZodObject, z } from "zod";
import type { AgentInput } from "../../src/agents/agent";
import { AIAgent } from "../../src/agents/ai-agent";
import type { ChatModelInputMessage } from "../../src/models/chat";
import {
  PromptBuilder,
  USER_INPUT_MESSAGE_KEY,
  addMessagesToInput,
  userInput,
} from "../../src/prompt/prompt-builder";
import { DEFAULT_INSTRUCTIONS_TEMPLATE } from "../../src/prompt/templates/instructions";

test("userInput function should return correct object", () => {
  const message = "Hello";
  const result = userInput(message);
  expect(result).toEqual({ [USER_INPUT_MESSAGE_KEY]: message });
});

test("addMessagesToInput function should add messages correctly", () => {
  const result = addMessagesToInput({ [USER_INPUT_MESSAGE_KEY]: "Hello" }, [
    { role: "user", content: "How are you?" },
  ]);
  expect(result).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: "Hello" },
      { role: "user", content: "How are you?" },
    ],
  });

  const result1 = addMessagesToInput(
    { [USER_INPUT_MESSAGE_KEY]: [{ role: "user", content: "Hello" }] },
    [{ role: "agent", content: "How can I help you?" }],
  );
  expect(result1).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: "Hello" },
      { role: "agent", content: "How can I help you?" },
    ],
  });

  const result2 = addMessagesToInput({ [USER_INPUT_MESSAGE_KEY]: { name: "foo" } }, [
    { role: "agent", content: "How can I help you?" },
  ]);
  expect(result2).toEqual({
    [USER_INPUT_MESSAGE_KEY]: [
      { role: "user", content: '{"name":"foo"}' },
      { role: "agent", content: "How can I help you?" },
    ],
  });
});

test("PromptBuilder should build messages correctly", async () => {
  const agent = AIAgent.from({
    name: "TestAgent",
    instructions: "Test instructions",
  });

  const promptBuilder = new PromptBuilder();

  const prompt1 = await promptBuilder.build({ input: userInput("Hello"), agent });

  expect(prompt1.messages).toEqual([
    {
      role: "system",
      content: PromptTemplate.from(DEFAULT_INSTRUCTIONS_TEMPLATE).format({
        name: "TestAgent",
        instructions: "Test instructions",
      }),
    },
    {
      role: "user",
      content: "Hello",
    },
  ]);

  const prompt2 = await promptBuilder.build({ input: userInput({ name: "foo" }), agent });
  expect(prompt2.messages).toEqual([
    {
      role: "system",
      content: PromptTemplate.from(DEFAULT_INSTRUCTIONS_TEMPLATE).format({
        name: "TestAgent",
        instructions: "Test instructions",
      }),
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

  const promptBuilder = new PromptBuilder();

  const prompt = await promptBuilder.build({ input: {}, agent });

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

  const promptBuilder = new PromptBuilder();

  const prompt = await promptBuilder.build({ input: {}, agent });

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

test("PromptBuilder should build toolChoice correctly", async () => {
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

  const promptBuilder = new PromptBuilder();

  const prompt = await promptBuilder.build({ input: {}, agent });

  expect(prompt.toolChoice).toEqual("required");
});
