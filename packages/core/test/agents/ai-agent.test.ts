import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AIAgent, AIGNE, MESSAGE_KEY, type Message, createMessage } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import {
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";
import { z } from "zod";
import { createToolCallResponse } from "../_utils/openai-like-utils.js";

test.each([true, false])("AIAgent.call with streaming %p", async (streaming) => {
  const model = new OpenAIChatModel();

  const context = new AIGNE({ model }).newContext();

  const agent = AIAgent.from<Message, { [MESSAGE_KEY]: string }>({});

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve(stringToAgentResponseStream("Here is a beautiful T-shirt")),
  );

  const result = await agent.call("write a long blog about arcblock", context, { streaming });

  if (streaming) {
    assert(result instanceof ReadableStream);
    expect(readableStreamToArray(result)).resolves.toMatchSnapshot();
  } else {
    expect(result).toMatchSnapshot();
  }
});

test("AIAgent.call with structured output", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

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

  const result = await aigne.call(agent, "hello, i'm Alice");

  expect(result).toEqual({ username: "Alice", questionCategory: "greeting" });
});

test("AIAgent should pass both arguments (model generated) and input (user provided) to the tool", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

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
      Promise.resolve({ toolCalls: [createToolCallResponse("plus", { a: 1, b: 1 })] }),
    )
    .mockReturnValueOnce(Promise.resolve({ json: { sum: 2 } }))
    .mockReturnValueOnce(Promise.resolve({ text: "The sum is 2" }));

  const result = await aigne.call(agent, "1 + 1 = ?");

  expect(plusCall).toHaveBeenCalledWith(
    { ...createMessage("1 + 1 = ?"), a: 1, b: 1 },
    expect.anything(),
    expect.anything(),
  );
  expect(result).toEqual(createMessage("The sum is 2"));
});

test.each([true, false])(
  "AIAgent with router toolChoice should return router result with streaming %p",
  async (streaming) => {
    const model = new OpenAIChatModel();
    const aigne = new AIGNE({ model });

    const sales = AIAgent.from({ name: "sales", inputSchema: z.object({ indent: z.string() }) });

    const agent = AIAgent.from({
      tools: [sales],
      toolChoice: "router",
    });

    const salesCall = spyOn(sales, "call");

    spyOn(model, "process")
      .mockReturnValueOnce(
        Promise.resolve({ toolCalls: [createToolCallResponse("sales", { indent: "T-shirt" })] }),
      )
      .mockReturnValueOnce(
        Promise.resolve(stringToAgentResponseStream("Here is a beautiful T-shirt")),
      );

    const result = await aigne.call(agent, "Hello, I want to buy a T-shirt", { streaming });

    if (streaming) {
      assert(result instanceof ReadableStream);
      expect(readableStreamToArray(result)).resolves.toMatchSnapshot();
    } else {
      expect(result).toMatchSnapshot();
    }

    expect(salesCall).toHaveBeenCalledWith(
      { ...createMessage("Hello, I want to buy a T-shirt"), indent: "T-shirt" },
      expect.anything(),
      expect.anything(),
    );
  },
);
