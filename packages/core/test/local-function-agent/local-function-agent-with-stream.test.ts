import { expect, test } from "bun:test";

import { LocalFunctionAgent } from "../../src";
import { MockContext } from "../mocks/context";

test("LocalFunctionAgent.run with streaming response", async () => {
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
    function: async function* ({ question }) {
      yield { $text: "ECHO " };
      yield { $text: question };
    },
  });

  const result = (
    await agent.run({ question: "hello" }, { stream: true })
  ).getReader();
  expect(await result.read()).toEqual({
    value: { $text: "ECHO " },
    done: false,
  });
  expect(await result.read()).toEqual({
    value: { $text: "hello" },
    done: false,
  });
  expect(await result.read()).toEqual({ value: undefined, done: true });
});
