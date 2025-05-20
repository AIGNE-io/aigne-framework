import { expect, test } from "bun:test";
import {
  AgentMessageTemplate,
  PromptTemplate,
  ToolMessageTemplate,
  parseChatMessages,
} from "@aigne/core";

test("PromptTemplate.format", async () => {
  const prompt = PromptTemplate.from("Hello, {{name}}!").format({ name: "Alice" });
  expect(prompt).toBe("Hello, Alice!");
});

test("PromptTemplate.format with variable value is nil", async () => {
  const prompt = PromptTemplate.from("Hello, {{name}}!").format({});
  expect(prompt).toBe("Hello, !");
});

test("PromptTemplate.format with json variable", async () => {
  const prompt = PromptTemplate.from("Hello, {{name}}!").format({ name: { username: "Alice" } });
  expect(prompt).toBe('Hello, {"username":"Alice"}!');
});

test("AgentMessageTemplate", async () => {
  const prompt = AgentMessageTemplate.from("Hello, {{name}}!", undefined, "AgentA").format({
    name: "Alice",
  });
  expect(prompt).toEqual({
    role: "agent",
    content: "Hello, Alice!",
    toolCalls: undefined,
    name: "AgentA",
  });

  const toolCallsPrompt = AgentMessageTemplate.from(
    undefined,
    [
      {
        id: "tool1",
        type: "function",
        function: {
          name: "plus",
          arguments: { a: 1, b: 2 },
        },
      },
    ],
    "AgentA",
  ).format();
  expect(toolCallsPrompt).toEqual({
    role: "agent",
    content: undefined,
    toolCalls: [
      {
        id: "tool1",
        type: "function",
        function: {
          name: "plus",
          arguments: { a: 1, b: 2 },
        },
      },
    ],
    name: "AgentA",
  });
});

test("ToolMessageTemplate", async () => {
  const prompt = ToolMessageTemplate.from("Hello, {{name}}!", "tool1", "AgentA").format({
    name: "Alice",
  });
  expect(prompt).toEqual({
    role: "tool",
    toolCallId: "tool1",
    content: "Hello, Alice!",
    name: "AgentA",
  });

  const objectPrompt = ToolMessageTemplate.from(
    { result: { content: "call tool success" } },
    "tool1",
    "AgentA",
  ).format();
  expect(objectPrompt).toEqual({
    role: "tool",
    toolCallId: "tool1",
    content: JSON.stringify({ result: { content: "call tool success" } }),
    name: "AgentA",
  });

  const bigintPrompt = ToolMessageTemplate.from(
    { result: { content: 1234567890n } },
    "tool1",
    "AgentA",
  ).format();
  expect(bigintPrompt).toEqual({
    role: "tool",
    toolCallId: "tool1",
    content: JSON.stringify({ result: { content: "1234567890" } }),
    name: "AgentA",
  });
});

test("parseChatMessages", async () => {
  const messages = [
    { role: "system", content: "system message" },
    { role: "user", content: "user message", name: "UserA" },
    { role: "agent", content: "agent message", name: "AgentA" },
    {
      role: "agent",
      content: undefined,
      toolCalls: [
        {
          id: "tool1",
          type: "function",
          function: {
            name: "plus",
            arguments: { a: 1, b: 2 },
          },
        },
      ],
      name: "AgentA",
    },
    { role: "tool", content: "tool message", toolCallId: "tool1", name: "AgentA" },
    {
      role: "tool",
      content: {
        result: {
          content: "call tool success",
        },
      },
      toolCallId: "tool1",
      name: "AgentA",
    },
  ];
  const result = parseChatMessages(messages)?.map((m) => m.format());
  expect(result).toEqual([
    { role: "system", content: "system message" },
    { role: "user", content: "user message", name: "UserA" },
    { role: "agent", content: "agent message", name: "AgentA" },
    {
      role: "agent",
      content: undefined,
      toolCalls: [
        {
          id: "tool1",
          type: "function",
          function: {
            name: "plus",
            arguments: { a: 1, b: 2 },
          },
        },
      ],
      name: "AgentA",
    },
    { role: "tool", content: "tool message", toolCallId: "tool1", name: "AgentA" },
    {
      role: "tool",
      content: JSON.stringify({ result: { content: "call tool success" } }),
      toolCallId: "tool1",
      name: "AgentA",
    },
  ]);
});
