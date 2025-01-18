import { expect, spyOn, test } from "bun:test";

import { FunctionAgent, type MemoryItemWithScore } from "../../src";
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

test("FunctionAgent.run with memory", async () => {
  const history = new MockMemory();

  spyOn(history, "search").mockImplementation(async () => {
    return { results: [memory] };
  });

  const agent = FunctionAgent.create({
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
        type: "array",
        required: true,
      },
    },
    memories: {
      history: {
        memory: history,
      },
    },
    code: `\
yield { $text: 'ECHO: ' }
yield { $text: \`\${question} \` }
yield { delta: { memories: history } };
`,
  });

  const reader = (
    await agent.run({ question: "hello" }, { stream: true })
  ).getReader();

  expect(await reader.read()).toEqual({
    value: { $text: "ECHO: " },
    done: false,
  });
  expect(await reader.read()).toEqual({
    value: { $text: "hello " },
    done: false,
  });
  expect(await reader.read()).toEqual({
    value: { delta: { memories: [memory] } },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});
