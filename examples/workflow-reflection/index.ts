#!/usr/bin/env npx -y bun

import assert from "node:assert";
import { AIAgent, ExecutionEngine, UserAgent, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { runChatLoopInTerminal } from "@aigne/core/utils/run-chat-loop.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Respond using the following format:

Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) => (output.approval ? UserOutputTopic : "rewrite_request"),
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z.string().describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

const engine = new ExecutionEngine({ model, agents: [coder, reviewer] });

const userAgent = UserAgent.from({
  context: engine,
  publishTopic: UserInputTopic,
  subscribeTopic: UserOutputTopic,
});

await runChatLoopInTerminal(userAgent, {
  welcome: `Hello, I'm a coder with a reviewer. I can help you write code and get it reviewed.`,
  defaultQuestion: "Write a function to find the sum of all even numbers in a list.",
});
