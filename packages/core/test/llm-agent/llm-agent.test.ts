import { expect, spyOn, test } from "bun:test";

import { FunctionAgent, LLMAgent, Runtime } from "../../src";
import { MockLLMModel } from "../mocks/llm-model";

test("LLMAgent.run", async () => {
  const llmModel = new MockLLMModel();

  const context = new Runtime({ llmModel });

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

  const agent = LLMAgent.create({
    context,
    inputs: {
      city: {
        type: "string",
        required: true,
      },
      language: {
        type: "string",
      },
    },
    preloads: {
      weather: (preload) =>
        preload(weatherAgent, {
          city: { from: "input", fromInput: "city" },
        }),
    },
    // TODO: add memories case
    messages: [
      {
        role: "system",
        content:
          "the weather in {{city}} is {{weather.temperature}} degrees\nyou have to reply in {{language}}",
      },
      { role: "user", content: "what is the weather in {{city}}" },
    ],
    outputs: {
      $text: {
        type: "string",
        required: true,
      },
    },
  });

  const process = spyOn(llmModel, "process").mockImplementation(
    async function* (input) {
      yield { $text: "the weather in Beijing is 20 degrees" };
    },
  );

  expect(await agent.run({ city: "Beijing", language: "English" })).toEqual({
    $text: "the weather in Beijing is 20 degrees",
  });

  expect(process.mock.calls[0]?.[0]).toEqual(
    expect.objectContaining({
      messages: [
        {
          role: "system",
          content:
            "the weather in Beijing is 20 degrees\nyou have to reply in English",
        },
        { role: "user", content: "what is the weather in Beijing" },
      ],
    }),
  );
});
