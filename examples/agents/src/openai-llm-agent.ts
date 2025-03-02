import "./utils/bun-polyfill";
import "core-js";
import "reflect-metadata";

import { AIAgent, OpenaiLLMModel, Runtime } from "@aigne/core";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("process.env.OPENAI_API_KEY is required");
}

const agent = AIAgent.create({
  context: new Runtime({
    llmModel: new OpenaiLLMModel({
      model: "gpt-4o-mini",
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
