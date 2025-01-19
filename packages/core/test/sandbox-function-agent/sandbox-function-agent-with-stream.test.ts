import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { Runtime, SandboxFunctionAgent } from "../../src";
import { MockSandboxFunctionRunner } from "../mocks/sandbox-function-runner";

test("SandboxFunctionAgent.run with streaming response (ReadableStream)", async () => {
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
return new ReadableStream({
  start(controller) {
    controller.enqueue({ $text: 'ECHO: ' });
    controller.enqueue({ $text: \`\${question} \` });
    controller.enqueue({ $text: $context.state.userId });
    controller.close();
  },
})
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
    value: { $text: userId },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});

test("SandboxFunctionAgent.run with streaming response (AsyncGenerator)", async () => {
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
yield { $text: 'ECHO: ' }
yield { $text: \`\${question} \` }
yield { $text: $context.state.userId }
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
    value: { $text: userId },
    done: false,
  });
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});
