import { expect, spyOn, test } from "bun:test";
import { AIAgent, ExecutionEngine, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

test("AIAgent.call", async () => {
  const model = new OpenAIChatModel();
  const engine = new ExecutionEngine({ model });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
  });

  spyOn(model, "call").mockReturnValueOnce(Promise.resolve({ text: "Hello, how can I help you?" }));

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

  spyOn(model, "call").mockReturnValueOnce(
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

  spyOn(model, "call")
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

  spyOn(model, "call")
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
  );
  expect(result).toEqual({ sum: 2 });
});
