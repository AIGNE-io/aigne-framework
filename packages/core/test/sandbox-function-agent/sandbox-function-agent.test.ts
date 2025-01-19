import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { Runtime, SandboxFunctionAgent } from "../../src";
import { MockSandboxFunctionRunner } from "../mocks/sandbox-function-runner";

test("SandboxFunctionAgent.run", async () => {
  const userId = nanoid();

  const context = new Runtime({
    state: { userId },
    sandboxFunctionRunner: MockSandboxFunctionRunner,
  });

  const agent = SandboxFunctionAgent.create({
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
