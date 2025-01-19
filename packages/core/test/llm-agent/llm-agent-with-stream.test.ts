import { expect, spyOn, test } from "bun:test";

import { LLMAgent, Runtime } from "../../src";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMAgent.run with streaming response", async () => {
  const llmModel = new MockLLMModel();

  const context = new Runtime({ llmModel });

  const agent = LLMAgent.create({
    context,
    inputs: {
      question: {
        type: "string",
        required: true,
      },
      language: {
        type: "string",
      },
    },
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
    },
    messages: [{ role: "user", content: "reply {{question}} in {{language}}" }],
  });

  spyOn(llmModel, "process").mockImplementation(async function* (input) {
    yield { $text: "ECHO: " };

    yield { $text: `${input.messages[0]?.content}` };
  });

  const reader = (
    await agent.run(
      { question: "hello", language: "Chinese" },
      { stream: true },
    )
  ).getReader();

  expect(await reader.read()).toEqual({
    value: { $text: "ECHO: " },
    done: false,
  });
  expect(await reader.read()).toEqual({
    value: { $text: "reply hello in Chinese" },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});
