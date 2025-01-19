import { expect, spyOn, test } from "bun:test";

import { FunctionAgent, LLMDecisionAgent, Runtime } from "../../src";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMDecisionAgent.run", async () => {
  const llmModel = new MockLLMModel();

  const context = new Runtime({ llmModel });

  const agent = LLMDecisionAgent.create({
    context,
    messages: [{ role: "user", content: "this is user message" }],
    cases: {
      case1: {
        description: "Case 1",
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
          function: async ({ question }) => {
            return { $text: `ECHO: ${question}` };
          },
        }),
      },
      case2: {
        description: "Case 2",
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
      },
    },
  });

  spyOn(llmModel, "process").mockImplementationOnce(async function* () {
    yield {
      delta: { toolCalls: [{ type: "function", function: { name: "case1" } }] },
    };
  });

  expect(await agent.run({ question: "hello", str: "foo" })).toEqual({
    $text: "ECHO: hello",
  });

  spyOn(llmModel, "process").mockImplementationOnce(async function* () {
    yield {
      delta: { toolCalls: [{ type: "function", function: { name: "case2" } }] },
    };
  });

  expect(await agent.run({ question: "hello", str: "foo" })).toEqual({
    length: "foo".length,
  });
});
