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
              "header": {
                "description": "Very short label (max 12 chars) used as key in answers. Examples: 'Auth method', 'Library', 'Approach'",
                "type": "string",
              },
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
              "header",
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
      questions: [{ header: "Name", question: "What is your name?" }],
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
      questions: [{ header: "Name", question: "What is your name?" }],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: { Name: "John Doe" },
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
          header: "Choice",
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
    answers: { Choice: "Option A" },
  });
  expect(mockPrompts.select).toHaveBeenCalledTimes(1);
  expect(mockPrompts.select.mock.calls[0]?.[0]).toMatchInlineSnapshot(`
    {
      "choices": [
        {
          "description": "First option",
          "name": "Option A",
          "value": "Option A",
        },
        {
          "description": "Second option",
          "name": "Option B",
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
          header: "Options",
          question: "Select multiple options",
          options: [{ label: "Option A" }, { label: "Option B" }, { label: "Option C" }],
          multipleSelect: true,
        },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: { Options: "Option A, Option C" },
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
          header: "Choice",
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
          "name": "Option A",
          "value": "Option A",
        },
        {
          "name": "None of the above / Enter my own response",
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
          header: "Choice",
          question: "Choose an option",
          options: [{ label: "Option A" }],
        },
      ],
      allowCustomAnswer: true,
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: { Choice: "My custom answer" },
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
          header: "Options",
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
    answers: { Options: "My custom answer" },
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
        { header: "Name", question: "What is your name?" },
        {
          header: "Color",
          question: "What is your favorite color?",
          options: [{ label: "Red" }, { label: "Blue" }, { label: "Green" }],
        },
        { header: "Age", question: "What is your age?" },
      ],
    },
    { prompts: mockPrompts as any },
  );

  expect(result).toEqual({
    answers: {
      Name: "John",
      Color: "Blue",
      Age: "Unknown",
    },
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
          header: "Choice",
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
          "name": "Option A",
          "value": "Option A",
        },
        {
          "description": "Has description",
          "name": "Option B",
          "value": "Option B",
        },
      ],
      "message": "Choose",
    }
  `);
});
