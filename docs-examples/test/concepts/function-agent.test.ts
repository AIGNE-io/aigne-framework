import { expect, test } from "bun:test";
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

test("Example FunctionAgent: basic", async () => {
  // #region example-agent-basic

  // #region example-agent-basic-create-agent
  const weather = FunctionAgent.from({
    name: "getWeather",
    description: "Get the current weather for a given location.",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for."),
    }),
    outputSchema: z.object({
      $message: z.string().describe("The message from the agent."),
      temperature: z.number().describe("The current temperature in Celsius."),
    }),
    process: async ({ city }) => {
      console.log(`Fetching weather for ${city}`);
      const temperature = 25; // You can replace this with actual weather fetching logic

      return {
        $message: "Hello, I'm AIGNE!",
        temperature,
      };
    },
  });
  // #endregion example-agent-basic-create-agent

  // #region example-agent-basic-invoke
  const result = await weather.invoke({ city: "New York" });
  console.log(result);
  // Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
  expect(result).toEqual({ $message: "Hello, I'm AIGNE!", temperature: 25 });
  // #endregion example-agent-basic-invoke

  // #endregion example-agent-basic
});

test("Example FunctionAgent: generator", async () => {
  // #region example-agent-generator

  // #region example-agent-generator-create-agent
  const weather = FunctionAgent.from({
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for."),
    }),
    outputSchema: z.object({
      $message: z.string().describe("The message from the agent."),
      temperature: z.number().describe("The current temperature in Celsius."),
    }),
    process: async function* ({ city }) {
      console.log(`Fetching weather for ${city}`);

      yield { delta: { text: { $message: "Hello" } } };
      yield { delta: { text: { $message: "," } } };
      yield { delta: { text: { $message: " I'm" } } };
      yield { delta: { text: { $message: " AIGNE" } } };
      yield { delta: { text: { $message: "!" } } };
      yield { delta: { json: { temperature: 25 } } };

      // Or you can return a partial result at the end
      return { temperature: 25 };
    },
  });
  // #endregion example-agent-generator-create-agent

  // #region example-agent-generator-invoke-non-streaming
  const result = await weather.invoke({ city: "New York" });
  console.log(result); // Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
  expect(result).toEqual({ $message: "Hello, I'm AIGNE!", temperature: 25 });
  // #endregion example-agent-generator-invoke-non-streaming

  // #endregion example-agent-generator
});

test("Example FunctionAgent: streaming", async () => {
  // #region example-agent-streaming

  // #region example-agent-streaming-create-agent
  const weather = FunctionAgent.from({
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for."),
    }),
    outputSchema: z.object({
      $message: z.string().describe("The message from the agent."),
      temperature: z.number().describe("The current temperature in Celsius."),
    }),
    process: async ({ city }) => {
      console.log(`Fetching weather for ${city}`);

      return new ReadableStream({
        start(controller) {
          controller.enqueue({ delta: { text: { $message: "Hello" } } });
          controller.enqueue({ delta: { text: { $message: "," } } });
          controller.enqueue({ delta: { text: { $message: " I'm" } } });
          controller.enqueue({ delta: { text: { $message: " AIGNE" } } });
          controller.enqueue({ delta: { text: { $message: "!" } } });
          controller.enqueue({ delta: { json: { temperature: 25 } } });
          controller.close();
        },
      });
    },
  });
  // #endregion example-agent-streaming-create-agent

  // #region example-agent-streaming-invoke
  const stream = await weather.invoke({ city: "New York" }, { streaming: true });
  let text = "";
  const json = {};
  for await (const chunk of stream) {
    if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
  console.log(text); // Output: Hello, I'm AIGNE!
  console.log(json); // Output: { temperature: 25 }
  expect(text).toEqual("Hello, I'm AIGNE!");
  expect(json).toEqual({ temperature: 25 });
  // #endregion example-agent-streaming-invoke

  // #region example-agent-streaming-invoke-non-streaming
  const result = await weather.invoke({ city: "New York" });
  console.log(result); // Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
  expect(result).toEqual({ $message: "Hello, I'm AIGNE!", temperature: 25 });
  // #endregion example-agent-streaming-invoke-non-streaming

  // #endregion example-agent-streaming
});

test("Example FunctionAgent: pure function", async () => {
  // #region example-agent-pure-function

  // #region example-agent-pure-function-create-agent
  const weather = FunctionAgent.from(async ({ city }) => {
    console.log(`Fetching weather for ${city}`);

    return {
      $message: "Hello, I'm AIGNE!",
      temperature: 25,
    };
  });
  // #endregion example-agent-pure-function-create-agent

  const result = await weather.invoke({ city: "New York" });
  console.log(result); // Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
  expect(result).toEqual({ $message: "Hello, I'm AIGNE!", temperature: 25 });

  // #endregion example-agent-pure-function
});
