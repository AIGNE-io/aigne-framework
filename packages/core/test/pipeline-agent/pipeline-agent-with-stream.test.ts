import { expect, test } from "bun:test";

import { FunctionAgent, PipelineAgent, Runtime } from "../../src";

test("PipelineAgent.run with streaming response", async () => {
  const context = new Runtime({});

  const agent = PipelineAgent.create({
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
        fromVariable: "case1",
        fromVariablePropPath: ["$text"],
      },
      result: {
        type: "number",
        required: true,
        fromVariable: "case2",
        fromVariablePropPath: ["length"],
      },
    },
    processes: {
      case1: {
        runnable: FunctionAgent.create({
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
          function: async function* ({ question }) {
            yield { $text: "case1: " };

            yield { $text: question };
          },
        }),
        input: {
          question: {
            fromVariable: "question",
          },
        },
      },
      case2: {
        runnable: FunctionAgent.create({
          context,
          inputs: {
            str: {
              type: "string",
              required: true,
            },
          },
          outputs: {
            length: {
              type: "number",
              required: true,
            },
          },
          function: async ({ str }) => {
            return { length: str.length };
          },
        }),
        input: {
          str: {
            fromVariable: "case1",
            fromVariablePropPath: ["$text"],
          },
        },
      },
    },
  });

  const question = "hello";
  const reader = (await agent.run({ question }, { stream: true })).getReader();

  expect(await reader.read()).toEqual({
    value: { $text: "case1: " },
    done: false,
  });
  expect(await reader.read()).toEqual({
    value: { $text: question },
    done: false,
  });
  expect(await reader.read()).toEqual({
    value: { delta: { result: `case1: ${question}`.length } },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});
