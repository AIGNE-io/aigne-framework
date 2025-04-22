import { expect, spyOn, test } from "bun:test";
import { AIAgent, ExecutionEngine, MESSAGE_KEY, type Message, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { arrayToAgentResponseStream } from "@aigne/core/utils/stream-utils";
import { z } from "zod";

test("AIAgent.call", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({ text: "Hello, how can I help you?" }),
  );

  const result = await engine.call(agent, "hello");

  expect(result).toEqual(createMessage("Hello, how can I help you?"));
});

test("AIAgent.call with structured output", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
    outputSchema: z.object({
      username: z.string(),
      questionCategory: z.string(),
    }),
  });

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        username: "Alice",
        questionCategory: "greeting",
      },
    }),
  );

  const result = await engine.call(agent, "hello, i'm Alice");

  expect(result).toEqual({ username: "Alice", questionCategory: "greeting" });
});

test("AIAgent should pass both arguments (model generated) and input (user provided) to the tool", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const plus = AIAgent.from({
    name: "plus",
    instructions: "You are a calculator",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      sum: z.number(),
    }),
  });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
    tools: [plus],
  });

  const plusCall = spyOn(plus, "call");

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: "plus",
            type: "function",
            function: {
              name: "plus",
              arguments: { a: 1, b: 1 },
            },
          },
        ],
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve({
        json: {
          sum: 2,
        },
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve({
        text: "The sum is 2",
      }),
    );

  const result = await engine.call(agent, "1 + 1 = ?");

  expect(plusCall).toHaveBeenCalledWith(
    { ...createMessage("1 + 1 = ?"), a: 1, b: 1 },
    expect.anything(),
    expect.anything(),
  );
  expect(result).toEqual(createMessage("The sum is 2"));
});

test("AIAgent with router toolChoice mode should return tool result", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const plus = AIAgent.from({
    name: "plus",
    instructions: "You are a calculator",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    outputSchema: z.object({
      sum: z.number(),
    }),
  });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
    tools: [plus],
    toolChoice: "router",
  });

  const plusCall = spyOn(plus, "call");

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve({
        toolCalls: [
          {
            id: "plus",
            type: "function",
            function: {
              name: "plus",
              arguments: { a: 1, b: 1 },
            },
          },
        ],
      }),
    )
    .mockReturnValueOnce(Promise.resolve({ json: { sum: 2 } }));

  const result = await engine.call(agent, "1 + 1 = ?");

  expect(plusCall).toHaveBeenCalledWith(
    { ...createMessage("1 + 1 = ?"), a: 1, b: 1 },
    expect.anything(),
    expect.anything(),
  );
  expect(result).toEqual({ sum: 2 });
});

test("AIAgent.call with streaming output", async () => {
  const model = new OpenAIChatModel();

  const context = new ExecutionEngine({ model }).newContext();

  const agent = AIAgent.from<Message, { [MESSAGE_KEY]: string }>({});

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(
      arrayToAgentResponseStream([
        { delta: { text: { text: "Here " } } },
        { delta: { text: { text: "is " } } },
      ]),
    ),
  );

  const result = await agent.call("write a long blog about arcblock", context, { streaming: true });

  const reader = result.getReader();

  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { text: createMessage("Here ") } },
  });
  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { text: createMessage("is ") } },
  });
  expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
});
