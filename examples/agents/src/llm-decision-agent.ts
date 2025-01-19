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

const decision = LLMDecisionAgent.create({
  context,
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
  cases: {
    chatBot: {
      description: "Chat with the chat bot",
      runnable: llmAgent,
    },
    currentTime: {
      description: "Get the current time",
      runnable: currentTime,
    },
  },
});

console.log(await decision.run({ question: "What time is it?" }));

console.log(await decision.run({ question: "Hello, I am Bob" }));
