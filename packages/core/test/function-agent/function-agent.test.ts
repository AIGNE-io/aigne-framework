import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { FunctionAgent, Runtime } from "../../src";

test("FunctionAgent.run", async () => {
  const agent = FunctionAgent.create({
    context: new Runtime(),
    inputs: {
      question: {
        type: "string",
        required: true,
      },
    },
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
    },
    function: async ({ question }) => {
      return { $text: `ECHO: ${question}` };
    },
  });

  const result = await agent.run({ question: "hello" });
  expect(result).toEqual({ $text: "ECHO: hello" });
});

test("FunctionAgent.run with userId", async () => {
  const userId = nanoid();

  const agent = FunctionAgent.create({
    context: new Runtime({ state: { userId } }),
    inputs: {
      question: {
        type: "string",
        required: true,
      },
    },
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
      userId: {
        type: "string",
      },
    },
    function: async ({ question }, { context }) => {
      return { $text: `ECHO: ${question}`, userId: context.state.userId };
    },
  });

  const result = await agent.run({ question: "hello" });
  expect(result).toEqual({ $text: "ECHO: hello", userId });
});

test("FunctionAgent.run with AsyncGenerator result", async () => {
  const agent = FunctionAgent.create({
    context: new Runtime(),
    inputs: {
      question: {
        type: "string",
        required: true,
      },
    },
    outputs: {
      userId: {
        type: "string",
      },
      $text: {
        type: "string",
        required: true,
      },
    },
    function: async function* ({ question }) {
      yield { $text: `ECHO: ${question}` };
    },
  });

  const result = await agent.run({ question: "hello" });
  expect(result).toEqual({ $text: "ECHO: hello" });
});
