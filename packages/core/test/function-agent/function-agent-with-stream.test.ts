import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { FunctionAgent } from "../../src";
import { MockContext } from "../mocks/context";

test("FunctionAgent.run with streaming response (ReadableStream)", async () => {
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

test("FunctionAgent.run with streaming response (AsyncGenerator)", async () => {
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
