import { expect, spyOn, test } from "bun:test";
import { AIAgent, Agent, ChatModelOpenAI, ExecutionEngine, FunctionAgent } from "@aigne/core";
import { z } from "zod";

test("AIAgent.call", async () => {
  const model = new ChatModelOpenAI();
  const engine = new ExecutionEngine({ model });

  const agent = AIAgent.from({
    instructions: "You are a friendly chatbot",
  });

  spyOn(model, "call").mockReturnValueOnce(Promise.resolve({ text: "Hello, how can I help you?" }));

  const result = await engine.run("hello", agent);

  expect(result).toEqual({ text: "Hello, how can I help you?" });
});

test("AIAgent.call with structured output", async () => {
  const model = new ChatModelOpenAI();
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

  const result = await engine.run("hello, i'm Alice", agent);

  expect(result).toEqual({ username: "Alice", questionCategory: "greeting" });
});
