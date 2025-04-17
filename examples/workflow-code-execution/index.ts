#!/usr/bin/env npx -y bun

import { runChatLoopInTerminal } from "@aigne/cli/utils/run-chat-loop.js";
import { AIAgent, ExecutionEngine, FunctionAgent } from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { z } from "zod";

const model = await loadModel();

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
  memory: true,
});

const engine = new ExecutionEngine({ model });

const user = engine.call(coder);

await runChatLoopInTerminal(user, {
  welcome:
    "Welcome to the code execution workflow! you can ask me anything can be resolved by running code.",
  defaultQuestion: "10! = ?",
});
