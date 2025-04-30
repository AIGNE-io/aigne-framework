#!/usr/bin/env bunwrapper

import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { z } from "zod";

const model = await loadModel();

const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "Run JavaScript code in a sandboxed environment and return the result.",
  inputSchema: z.object({
    jsCode: z.string().describe("The code to run"),
  }),
  fn: async (input: { jsCode: string }) => {
    const { jsCode } = input;
    // biome-ignore lint/security/noGlobalEval: <explanation>
    const result = eval(jsCode);
    return { result };
  },
});

const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
  memory: true,
});

const aigne = new AIGNE({ model });

const user = aigne.invoke(coder);

await runChatLoopInTerminal(user, {
  welcome:
    "Welcome to the code execution workflow! you can ask me anything can be resolved by running code.",
  defaultQuestion: "10! = ?",
});
