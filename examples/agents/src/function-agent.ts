import "core-js";
import "reflect-metadata";

import { FunctionAgent, Runtime } from "@aigne/core";

const agent = FunctionAgent.create({
  context: new Runtime(),
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
  function: async ({ question }) => {
    return { $text: `ECHO: ${question}`, question };
  },
});

const result = await agent.run({ question: "hello" });
console.log(result);
