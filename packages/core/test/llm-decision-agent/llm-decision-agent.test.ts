import { expect, spyOn, test } from "bun:test";

import {
  FunctionAgent,
  LLMDecisionAgent,
  type LLMModelInputs,
  Runtime,
} from "../../src";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMDecisionAgent.run", async () => {
  const llmModel = new MockLLMModel();

  const context = new Runtime({ llmModel });

  const echoAgent = FunctionAgent.create({
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
  });

  const strLengthAgent = FunctionAgent.create({
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
  });

  const chatAgent = FunctionAgent.create({
    context,
    inputs: {
      username: {
        type: "string",
        required: true,
        description: "Username from user's question",
      },
    },
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
    },
    function: async ({ username }) => {
      return { $text: `Hello ${username}` };
    },
  });

  const agent = LLMDecisionAgent.create({
    context,
    messages: [{ role: "user", content: "this is user message" }],
    cases: {
      case1: echoAgent.bind({
        description: "Case 1",
      }),
      case2: strLengthAgent.bind({
        description: "Case 2",
      }),
      case3: chatAgent.bind({
        description: "Case 3",
        input: {
          username: { from: "ai" },
        },
      }),
    },
  });

  const expectedProcessInput: LLMModelInputs = expect.objectContaining({
    tools: [
      {
        type: "function",
        function: {
          name: "case1",
          description: "Case 1",
          parameters: {},
        },
      },
      {
        type: "function",
        function: {
          name: "case2",
          description: "Case 2",
          parameters: {},
        },
      },
      {
        type: "function",
        function: {
          name: "case3",
          description: "Case 3",
          parameters: expect.objectContaining({
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "Username from user's question",
              },
            },
            required: ["username"],
          }),
        },
      },
    ],
    toolChoice: "required",
  });

  // choose case1
  const process1 = spyOn(llmModel, "process").mockImplementationOnce(
    async function* () {
      yield {
        delta: {
          toolCalls: [{ type: "function", function: { name: "case1" } }],
        },
      };
    },
  );
  expect(await agent.run({ question: "hello", str: "foo" })).toEqual({
    $text: "ECHO: hello",
  });
  expect(process1.mock.calls.at(0)?.[0]).toEqual(expectedProcessInput);

  // choose case2
  const process2 = spyOn(llmModel, "process").mockImplementationOnce(
    async function* () {
      yield {
        delta: {
          toolCalls: [{ type: "function", function: { name: "case2" } }],
        },
      };
    },
  );
  expect(await agent.run({ question: "hello", str: "foo" })).toEqual({
    length: "foo".length,
  });
  expect(process2.mock.calls.at(0)?.[0]).toEqual(expectedProcessInput);

  // choose case3 with auto generated parameters from LLM
  const process3 = spyOn(llmModel, "process").mockImplementationOnce(
    async function* () {
      yield {
        delta: {
          toolCalls: [
            {
              type: "function",
              function: {
                name: "case3",
                arguments: JSON.stringify({ username: "Bob" }),
              },
            },
          ],
        },
      };
    },
  );
  expect(await agent.run({ question: "hello", str: "foo" })).toEqual({
    $text: "Hello Bob",
  });
  expect(process3.mock.calls.at(0)?.[0]).toEqual(expectedProcessInput);
});
