#!/usr/bin/env bunwrapper

import { runWithAIGNE } from "@aigne/cli/utils/run-with-aigne.js";
import { AIAgent, UserAgent, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { z } from "zod";

const coder = AIAgent.from({
  name: "coder",
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
  name: "reviewer",
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

await runWithAIGNE(
  (aigne) => {
    aigne.addAgent(coder, reviewer);

    const userAgent = UserAgent.from({
      context: aigne.newContext(),
      publishTopic: UserInputTopic,
      subscribeTopic: UserOutputTopic,
    });

    return userAgent;
  },
  {
    chatLoopOptions: {
      welcome: `Hello, I'm a coder with a reviewer. I can help you write code and get it reviewed.`,
      defaultQuestion: "Write a function to find the sum of all even numbers in a list.",
    },
  },
);
