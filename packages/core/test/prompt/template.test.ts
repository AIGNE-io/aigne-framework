import { expect, test } from "bun:test";
import assert from "node:assert";
import {
  AgentMessageTemplate,
  PromptTemplate,
  safeParseChatMessages,
  ToolMessageTemplate,
} from "@aigne/core";

test("PromptTemplate.format", async () => {
  const prompt = await PromptTemplate.from("Hello, {{name}}!").format({ name: "Alice" });
  expect(prompt).toBe("Hello, Alice!");
});

test("PromptTemplate.format with variable value is nil", async () => {
  const prompt = await PromptTemplate.from("Hello, {{name}}!").format({});
  expect(prompt).toBe("Hello, !");
});

test("PromptTemplate.format with json variable", async () => {
  const prompt = await PromptTemplate.from("Hello, {{name}}!").format({
    name: { username: "Alice" },
  });
  expect(prompt).toBe('Hello, {"username":"Alice"}!');
});

test("AgentMessageTemplate", async () => {
  const prompt = await AgentMessageTemplate.from("Hello, {{name}}!", undefined, "AgentA").format({
    name: "Alice",
  });
  expect(prompt).toMatchInlineSnapshot(`
    {
      "content": "Hello, {{name}}!",
      "name": "AgentA",
      "role": "agent",
      "toolCalls": undefined,
    }
  `);

  const toolCallsPrompt = await AgentMessageTemplate.from(
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
  expect(toolCallsPrompt).toMatchInlineSnapshot(`
    {
      "content": undefined,
      "name": "AgentA",
      "role": "agent",
      "toolCalls": [
        {
          "function": {
            "arguments": {
              "a": 1,
              "b": 2,
            },
            "name": "plus",
          },
          "id": "tool1",
          "type": "function",
        },
      ],
    }
  `);
});

test("ToolMessageTemplate", async () => {
  const prompt = await ToolMessageTemplate.from("Hello, {{name}}!", "tool1", "AgentA").format({
    name: "Alice",
  });
  expect(prompt).toMatchInlineSnapshot(`
    {
      "content": "Hello, {{name}}!",
      "name": "AgentA",
      "role": "tool",
      "toolCallId": "tool1",
    }
  `);

  const objectPrompt = await ToolMessageTemplate.from(
    { result: { content: "call tool success" } },
    "tool1",
    "AgentA",
  ).format();
  expect(objectPrompt).toMatchInlineSnapshot(`
    {
      "content": 
    "result:
      content: call tool success
    "
    ,
      "name": "AgentA",
      "role": "tool",
      "toolCallId": "tool1",
    }
  `);

  const bigintPrompt = await ToolMessageTemplate.from(
    { result: { content: 1234567890n } },
    "tool1",
    "AgentA",
  ).format();
  expect(bigintPrompt).toMatchInlineSnapshot(`
    {
      "content": 
    "result:
      content: 1234567890
    "
    ,
      "name": "AgentA",
      "role": "tool",
      "toolCallId": "tool1",
    }
  `);
});

test("safeParseChatMessages should correctly parse valid chat messages with roles and names", async () => {
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
  const msgs = safeParseChatMessages(messages);
  assert(msgs);

  const result = await Promise.all(msgs.map((m) => m.format()));
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

test("PromptTemplate should support yaml.stringify filter", async () => {
  const prompt = new PromptTemplate("Data in YAML:\n{{ data | yaml.stringify }}");
  const result = await prompt.format({ data: { key: "value" } });
  expect(result).toMatchInlineSnapshot(`
    "Data in YAML:
    key: value
    "
  `);
});

test("PromptTemplate should support json.stringify filter", async () => {
  const prompt = new PromptTemplate("Data in JSON:\n{{ data | json.stringify(null, 2) }}");
  const result = await prompt.format({ data: { key: "value" } });
  expect(result).toMatchInlineSnapshot(`
    "Data in JSON:
    {
      "key": "value"
    }"
  `);
});

test("PromptTemplate should support tson.stringify filter", async () => {
  const prompt = new PromptTemplate("Data in TSON:\n{{ data | tson.stringify }}");
  const result = await prompt.format({
    data: { key: "value", labels: ["foo", "bar"], nested: { name: "Bob", age: 30 } },
  });
  expect(result).toMatchInlineSnapshot(`
    "Data in TSON:
    {@key,labels,nested|value,[foo,bar],{@name,age|Bob,30}}"
  `);
});
