import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { FunctionAgent } from "../../src";
import { MockContext } from "../mocks/context";

test("FunctionAgent.run", async () => {
  const userId = nanoid();

  const context = new MockContext({
    state: { userId },
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
    code: `\
return { $text: \`ECHO: \${question} \${$context.state.userId}\` };
`,
  });

  expect(await agent.run({ question: "hello" })).toEqual({
    $text: `ECHO: hello ${userId}`,
  });
});
