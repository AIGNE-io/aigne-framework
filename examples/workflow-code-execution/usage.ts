#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { AIAgent, ChatModelOpenAI, ExecutionEngine, FunctionAgent } from "@aigne/core-next";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
});

const sandbox = FunctionAgent.from({
  name: "js-sandbox",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  fn: async (input: { code: string }) => {
    const { code } = input;
    // biome-ignore lint/security/noGlobalEval: <explanation>
    const result = eval(code);
    return { result };
  },
});

const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  tools: [sandbox],
});

const engine = new ExecutionEngine({ model });

const result = await engine.run("10! = ?", coder);
console.log(result);
// Output:
// {
//   text: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
