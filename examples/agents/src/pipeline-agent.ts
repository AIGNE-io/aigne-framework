import "core-js";
import "reflect-metadata";

import { LocalFunctionAgent, PipelineAgent, Runtime } from "@aigne/core";

const context = new Runtime();

const agent = PipelineAgent.create({
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
      fromVariable: "step1",
      fromVariablePropPath: ["$text"],
    },
    result: {
      type: "number",
      required: true,
      fromVariable: "step2",
      fromVariablePropPath: ["length"],
    },
  },
  processes: {
    step1: {
      runnable: LocalFunctionAgent.create({
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
        function: async ({ question }) => {
          return { $text: `step1: ${question}` };
        },
      }),
      input: {
        question: {
          fromVariable: "question",
        },
      },
    },
    step2: {
      runnable: LocalFunctionAgent.create({
        context,
        inputs: {
          str: {
            type: "string",
            required: true,
          },
        },
        outputs: {
          length: {
            type: "number",
            required: true,
          },
        },
        function: async ({ str }) => {
          return { length: str.length };
        },
      }),
      input: {
        str: {
          fromVariable: "step1",
          fromVariablePropPath: ["$text"],
        },
      },
    },
  },
});

const result = await agent.run({ question: "hello" });

console.log(result);
