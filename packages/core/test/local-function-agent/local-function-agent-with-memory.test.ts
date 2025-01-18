import { expect, spyOn, test } from "bun:test";
import { nanoid } from "nanoid";

import { LocalFunctionAgent, type MemoryItemWithScore } from "../../src";
import { MockContext } from "../mocks/context";
import { MockMemory } from "../mocks/memory";

const memory: MemoryItemWithScore = {
  id: "123",
  score: 0.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  memory: "foo bar",
  metadata: {},
};

test("LocalFunctionAgent.run with memory", async () => {
  const history = new MockMemory();

  const search = spyOn(history, "search").mockImplementation(async () => {
    return { results: [memory] };
  });

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
      memories: {
        type: "object",
        required: true,
      },
    },
    memories: {
      history: {
        memory: history,
      },
    },
    function: async ({ question }, { memories }) => {
      return { $text: `ECHO: ${question}`, memories };
    },
  });

  const result = await agent.run({ question: "hello" });
  expect(result).toEqual({
    $text: "ECHO: hello",
    memories: { history: [memory] },
  });

  expect(search).toHaveBeenCalledWith(
    "question hello",
    expect.objectContaining({}),
  );
});

test("LocalFunctionAgent.run with custom memory options", async () => {
  const userId = nanoid();

  const history = new MockMemory();

  const search = spyOn(history, "search").mockImplementation(async () => {
    return { results: [memory] };
  });

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
    },
    memories: {
      history: {
        memory: history,
        query: {
          fromVariable: "question",
        },
        options: {
          k: 20,
        },
      },
    },
    function: async ({ question }) => {
      return { $text: `ECHO: ${question}` };
    },
  });

  const result = await agent.run({ question: "hello" });
  expect(result).toEqual({ $text: "ECHO: hello" });

  expect(search).toHaveBeenCalledWith(
    "hello",
    expect.objectContaining({ k: 20, userId }),
  );
});
