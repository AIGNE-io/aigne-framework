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
  function: async function* ({ question }) {
    yield { $text: "ECHO: " };

    yield { $text: question };
  },
});

// Run the agent
const result = await agent.run({ question: "hello" });

console.log("result:", result); // { $text: 'ECHO: hello' }

// Run the agent with streaming
const stream = await agent.run({ question: "hello" }, { stream: true });

for await (const message of stream) {
  console.log("chunk:", message);
}
// chunk: { $text: 'ECHO: ' }
// chunk: { $text: 'hello' }
