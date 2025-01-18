import "./utils/bun-polyfill";
import "core-js";
import "reflect-metadata";

import { GeminiLLMModel, LLMAgent, Runtime } from "@aigne/core";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("process.env.GEMINI_API_KEY is required");
}

const agent = LLMAgent.create({
  context: new Runtime({
    llmModel: new GeminiLLMModel({
      model: "gemini-1.5-pro",
      apiKey,
    }),
  }),
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

const result = await agent.run({ question: "hello" }, { stream: true });

for await (const message of result) {
  process.stdout.write(message.$text || "");
}
