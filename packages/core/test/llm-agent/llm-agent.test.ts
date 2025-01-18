import { expect, spyOn, test } from "bun:test";

import { LLMAgent } from "../../src";
import { MockContext } from "../mocks/context";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMAgent.run", async () => {
  const llmModel = new MockLLMModel();

  const context = new MockContext({ llmModel });

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
    yield { $text: `ECHO: ${input.messages[0]?.content}` };
  });

  expect(await agent.run({ question: "hello" })).toEqual({
    $text: "ECHO: reply hello in ",
  });

  expect(await agent.run({ question: "hello", language: "Chinese" })).toEqual({
    $text: "ECHO: reply hello in Chinese",
  });
});
