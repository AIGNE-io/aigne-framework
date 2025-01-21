import { expect, test } from "bun:test";
import { nanoid } from "nanoid";

import { FunctionAgent, Runtime, SandboxFunctionAgent } from "../../src";
import { MockSandboxFunctionRunner } from "../mocks/sandbox-function-runner";

test("SandboxFunctionAgent.run", async () => {
  const userId = nanoid();

  const context = new Runtime({
    state: { userId },
    sandboxFunctionRunner: MockSandboxFunctionRunner,
  });

  const weatherAgent = FunctionAgent.create({
    context,
    name: "time",
    inputs: {
      city: {
        type: "string",
        required: true,
      },
      date: {
        type: "string",
      },
    },
    outputs: {
      city: {
        type: "string",
        required: true,
      },
      temperature: {
        type: "number",
        required: true,
      },
    },
    function: async ({ city }) => {
      return { city, temperature: 20 };
    },
  });

  const agent = SandboxFunctionAgent.create({
    context,
    inputs: {
      city: {
        type: "string",
        required: true,
      },
    },
    preloads: {
      weather: (preload) =>
        preload(weatherAgent, {
          city: { from: "input", fromInput: "city" },
        }),
    },
    code: `\
return { $text: \`ECHO: \${city} \${$context.state.userId}\`, weather };
`,
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
      weather: {
        type: "object",
        required: true,
      },
    },
  });

  expect(await agent.run({ city: "Beijing" })).toEqual({
    $text: `ECHO: Beijing ${userId}`,
    weather: { city: "Beijing", temperature: 20 },
  });
});
