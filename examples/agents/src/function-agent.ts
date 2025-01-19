import "core-js";
import "reflect-metadata";

import { FunctionAgent, Runtime } from "@aigne/core";

const agent = FunctionAgent.create({
  name: "plus",
  context: new Runtime(),
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
    sum: {
      type: "number",
      required: true,
    },
  },
  function: async ({ a, b }) => {
    return { sum: a + b };
  },
});

const result = await agent.run({ a: 1, b: 2 });

console.log(result); // { sum: 3 }
