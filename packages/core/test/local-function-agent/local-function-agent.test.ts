import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { LocalFunctionAgent } from "../../src";
import { MockContext } from "../mocks/context";

test("LocalFunctionAgent.run", async () => {
  const agent = LocalFunctionAgent.create({
    context: new MockContext(),
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

test("LocalFunctionAgent.run with userId", async () => {
  const userId = nanoid();

  const agent = LocalFunctionAgent.create({
    context: new MockContext({ state: { userId } }),
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

test("LocalFunctionAgent.run with AsyncGenerator result", async () => {
  const agent = LocalFunctionAgent.create({
    context: new MockContext(),
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
