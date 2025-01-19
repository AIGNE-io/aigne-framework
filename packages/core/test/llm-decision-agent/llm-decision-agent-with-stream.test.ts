import { expect, spyOn, test } from "bun:test";

import { FunctionAgent, LLMDecisionAgent, Runtime } from "../../src";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMDecisionAgent.run with streaming response", async () => {
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
          function: async function* ({ question }) {
            yield { $text: "ECHO: " };
            yield { $text: question };
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

  const result = (
    await agent.run({ question: "hello" }, { stream: true })
  ).getReader();

  expect(await result.read()).toEqual({
    value: { $text: "ECHO: " },
    done: false,
  });
  expect(await result.read()).toEqual({
    value: { $text: "hello" },
    done: false,
  });
  expect(await result.read()).toEqual({ value: undefined, done: true });
});
