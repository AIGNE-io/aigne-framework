import "./utils/bun-polyfill";
import "core-js";
import "reflect-metadata";

import {
  FunctionAgent,
  LLMAgent,
  LLMDecisionAgent,
  OpenaiLLMModel,
  Runtime,
} from "@aigne/core";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("process.env.OPENAI_API_KEY is required");
}

const context = new Runtime({
  llmModel: new OpenaiLLMModel({
    model: "gpt-4o-mini",
    apiKey,
  }),
});

const currentTime = FunctionAgent.create({
  context,
  name: "currentTime",
  inputs: {},
  outputs: {
    $text: {
      type: "string",
      required: true,
    },
  },
  function: async () => {
    return {
      $text: `The current time is ${new Date().toLocaleTimeString()}`,
    };
  },
});

const llmAgent = LLMAgent.create({
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
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
});

const plusAgent = FunctionAgent.create({
  context,
  inputs: {
    a: {
      type: "number",
      required: true,
    },
    b: {
      type: "number",
      required: true,
    },
  },
  outputs: {
    result: {
      type: "number",
      required: true,
    },
  },
  function: async ({ a, b }) => {
    return { result: a + b };
  },
});

const decision = LLMDecisionAgent.create({
  context,
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
  cases: {
    chatBot: llmAgent.bind({
      description: "Chat with the chat bot",
    }),
    currentTime: currentTime.bind({
      description: "Get the current time",
    }),
    plus: plusAgent.bind({
      description: "Add two numbers",
      input: {
        a: { from: "ai" },
        b: { from: "ai" },
      },
    }),
  },
});

console.log(await decision.run({ question: "What time is it?" })); // Output: { $text: "The current time is 12:00:00 PM" }

console.log(await decision.run({ question: "Hello, I am Bob" })); // Output: { $text: "Hello Bob" }

console.log(await decision.run({ question: "1 + 2 = ?" })); // Output: { result: 3 }
