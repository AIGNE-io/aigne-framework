import { expect, mock, test } from "bun:test";
import AskUserQuestionAgent from "@aigne/agent-library/ask-user-question/index.js";
import zodToJsonSchema from "zod-to-json-schema";

function createMockPrompts(responses: {
  select?: (message: string) => string;
  checkbox?: (message: string) => string[];
  input?: (message: string) => string;
}) {
  return {
    select: mock(async (opts: { message: string }) => responses.select?.(opts.message) ?? ""),
    checkbox: mock(async (opts: { message: string }) => responses.checkbox?.(opts.message) ?? []),
    input: mock(async (opts: { message: string }) => responses.input?.(opts.message) ?? ""),
  };
}

test("AskUserQuestionAgent.load should create agent with default name and description", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  expect(agent.name).toBe("askUserQuestion");
  expect(agent.description).toContain("Use this tool when you need to ask the user questions");
  expect(agent.description).toContain("Gather user preferences or requirements");
});

test("AskUserQuestionAgent.load should use custom name and description if provided", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {
      name: "customAskUser",
      description: "Custom description for asking user questions",
    },
  });

  expect(agent.name).toBe("customAskUser");
  expect(agent.description).toBe("Custom description for asking user questions");
});

test("AskUserQuestionAgent.schema should return empty object schema", () => {
  const schema = AskUserQuestionAgent.schema();
  expect(zodToJsonSchema(schema)).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {},
      "type": "object",
    }
  `);
});

test("AskUserQuestionAgent.inputSchema should match expected structure", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  expect(zodToJsonSchema(agent.inputSchema)).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": true,
      "properties": {
        "allowCustomAnswer": {
          "description": "Whether to allow the user to provide custom answers",
          "type": [
            "boolean",
            "null",
          ],
        },
        "questions": {
          "description": "List of questions to ask the user",
          "items": {
            "additionalProperties": false,
            "properties": {
              "multipleSelect": {
                "description": "Whether to allow multiple selections",
                "type": [
                  "boolean",
                  "null",
                ],
              },
              "options": {
                "anyOf": [
                  {
                    "items": {
                      "additionalProperties": false,
                      "properties": {
                        "description": {
                          "description": "Explanation of what this option means",
                          "type": [
                            "string",
                            "null",
                          ],
                        },
                        "label": {
                          "description": "The display text for this option (1-5 words)",
                          "type": "string",
                        },
                      },
                      "required": [
                        "label",
                      ],
                      "type": "object",
                    },
                    "type": "array",
                  },
                  {
                    "type": "null",
                  },
                ],
                "description": "List of options to present to the user",
              },
              "question": {
                "description": "The question to ask the user",
                "type": "string",
              },
            },
            "required": [
              "question",
            ],
            "type": "object",
          },
          "type": "array",
        },
      },
      "required": [
        "questions",
      ],
      "type": "object",
    }
  `);
});

test("AskUserQuestionAgent should throw error if prompts is not available", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  await expect(
    agent.invoke({
      questions: [{ question: "What is your name?" }],
    }),
  ).rejects.toThrow("Prompts is not available in AskUserQuestionAgent");
});

test("AskUserQuestionAgent should use input for questions without options", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    input: () => "John Doe",
  });

  const result = await agent.invoke(
    {
      questions: [{ question: "What is your name?" }],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [{ question: "What is your name?", answer: "John Doe" }],
  });
  expect(mockPrompts.input).toHaveBeenCalledTimes(1);
  expect(mockPrompts.input.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "message": "What is your name?",
    }
  `);
});

test("AskUserQuestionAgent should use select for single-select questions with options", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    select: () => "Option A",
  });

  const result = await agent.invoke(
    {
      questions: [
        {
          question: "Choose an option",
          options: [
            { label: "Option A", description: "First option" },
            { label: "Option B", description: "Second option" },
          ],
        },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [{ question: "Choose an option", answer: "Option A" }],
  });
  expect(mockPrompts.select).toHaveBeenCalledTimes(1);
  expect(mockPrompts.select.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "choices": [
        {
          "description": "First option",
          "short": "Option A",
          "value": "Option A",
        },
        {
          "description": "Second option",
          "short": "Option B",
          "value": "Option B",
        },
      ],
      "message": "Choose an option",
    }
  `);
});

test("AskUserQuestionAgent should use checkbox for multi-select questions", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    checkbox: () => ["Option A", "Option C"],
  });

  const result = await agent.invoke(
    {
      questions: [
        {
          question: "Select multiple options",
          options: [{ label: "Option A" }, { label: "Option B" }, { label: "Option C" }],
          multipleSelect: true,
        },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [{ question: "Select multiple options", answer: ["Option A", "Option C"] }],
  });
  expect(mockPrompts.checkbox).toHaveBeenCalledTimes(1);
});

test("AskUserQuestionAgent should add OTHER_OPTION when allowCustomAnswer is true", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    select: () => "Option A",
  });

  await agent.invoke(
    {
      questions: [
        {
          question: "Choose an option",
          options: [{ label: "Option A" }],
        },
      ],
      allowCustomAnswer: true,
    },
    { prompts: mockPrompts as any },
  );

  expect(mockPrompts.select.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "choices": [
        {
          "description": "Option A",
          "short": "Option A",
          "value": "Option A",
        },
        {
          "short": "None of the above / Enter my own response",
          "value": "OTHER_OPTION",
        },
      ],
      "message": "Choose an option",
    }
  `);
});

test("AskUserQuestionAgent should prompt for input when OTHER_OPTION is selected", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    select: () => "OTHER_OPTION",
    input: () => "My custom answer",
  });

  const result = await agent.invoke(
    {
      questions: [
        {
          question: "Choose an option",
          options: [{ label: "Option A" }],
        },
      ],
      allowCustomAnswer: true,
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [{ question: "Choose an option", answer: "My custom answer" }],
  });
  expect(mockPrompts.select).toHaveBeenCalledTimes(1);
  expect(mockPrompts.input).toHaveBeenCalledTimes(1);
  expect(mockPrompts.input.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "message": "Please provide your response for: Choose an option",
    }
  `);
});

test("AskUserQuestionAgent should prompt for input when OTHER_OPTION is in checkbox selection", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    checkbox: () => ["Option A", "OTHER_OPTION"],
    input: () => "My custom answer",
  });

  const result = await agent.invoke(
    {
      questions: [
        {
          question: "Select options",
          options: [{ label: "Option A" }, { label: "Option B" }],
          multipleSelect: true,
        },
      ],
      allowCustomAnswer: true,
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [{ question: "Select options", answer: "My custom answer" }],
  });
  expect(mockPrompts.checkbox).toHaveBeenCalledTimes(1);
  expect(mockPrompts.input).toHaveBeenCalledTimes(1);
});

test("AskUserQuestionAgent should handle multiple questions", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  let inputCallCount = 0;
  let selectCallCount = 0;

  const mockPrompts = createMockPrompts({
    input: (message) => {
      inputCallCount++;
      return message.includes("name") ? "John" : "Unknown";
    },
    select: () => {
      selectCallCount++;
      return "Blue";
    },
  });

  const result = await agent.invoke(
    {
      questions: [
        { question: "What is your name?" },
        {
          question: "What is your favorite color?",
          options: [{ label: "Red" }, { label: "Blue" }, { label: "Green" }],
        },
        { question: "What is your age?" },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: [
      { question: "What is your name?", answer: "John" },
      { question: "What is your favorite color?", answer: "Blue" },
      { question: "What is your age?", answer: "Unknown" },
    ],
  });
  expect(inputCallCount).toBe(2);
  expect(selectCallCount).toBe(1);
});

test("AskUserQuestionAgent should use label as description fallback", async () => {
  const agent = await AskUserQuestionAgent.load({
    filepath: "test.yaml",
    parsed: {},
  });

  const mockPrompts = createMockPrompts({
    select: () => "Option A",
  });

  await agent.invoke(
    {
      questions: [
        {
          question: "Choose",
          options: [
            { label: "Option A" }, // no description
            { label: "Option B", description: "Has description" },
          ],
        },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(mockPrompts.select.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "choices": [
        {
          "description": "Option A",
          "short": "Option A",
          "value": "Option A",
        },
        {
          "description": "Has description",
          "short": "Option B",
          "value": "Option B",
        },
      ],
      "message": "Choose",
    }
  `);
});
