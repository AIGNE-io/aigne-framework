import { expect, spyOn, test } from "bun:test";
import { nanoid } from "nanoid";

import { FunctionAgent, type MemoryItemWithScore, Runtime } from "../../src";
import { MockMemory } from "../mocks/memory";

const memory: MemoryItemWithScore<string> = {
  id: "123",
  score: 0.5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  memory: "foo bar",
  metadata: {},
};

test("FunctionAgent.run with preloads and memories", async () => {
  const context = new Runtime();

  const history = new MockMemory(context);

  const search = spyOn(history, "search").mockImplementation(async () => {
    return { results: [memory] };
  });

  const weatherAgent = FunctionAgent.create({
    context,
    name: "time",
    inputs: {
      city: {
        type: "string",
        required: true,
      },
      date: {
        type: "string",
      },
    },
    outputs: {
      city: {
        type: "string",
        required: true,
      },
      temperature: {
        type: "number",
        required: true,
      },
    },
    function: async ({ city }) => {
      return { city, temperature: 20 };
    },
  });

  const agent = FunctionAgent.create({
    context,
    inputs: {
      question: {
        type: "string",
        required: true,
      },
    },
    preloads: {
      weather: (preload) =>
        preload(weatherAgent, {
          city: { from: "input", fromInput: "question" },
          date: { from: "input", fromInput: "question" },
        }),
    },
    memories: {
      history: {
        memory: history,
      },
    },
    function: async ({ question, weather, history }) => {
      return { $text: `ECHO: ${question}`, history, weather };
    },
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
      weather: {
        type: "object",
        required: true,
        properties: {
          city: {
            type: "string",
            required: true,
          },
          temperature: {
            type: "number",
            required: true,
          },
        },
      },
      history: {
        type: "array",
        required: true,
      },
    },
  });

  const result = await agent.run({ question: "Beijing" });
  expect(result).toEqual({
    $text: "ECHO: Beijing",
    history: [memory],
    weather: { city: "Beijing", temperature: 20 },
  });

  expect(search).toHaveBeenCalledWith(
    "question Beijing",
    expect.objectContaining({}),
  );
});

test("FunctionAgent.run with custom memory options", async () => {
  const userId = nanoid();
  const context = new Runtime({ state: { userId } });

  const history = new MockMemory(context);

  const search = spyOn(history, "search").mockImplementation(async () => {
    return { results: [memory] };
  });

  const agent = FunctionAgent.create({
    context,
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
