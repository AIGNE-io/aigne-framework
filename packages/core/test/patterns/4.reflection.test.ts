import { expect, test } from "bun:test";
import { z } from "zod";
import { AIAgent, ChatModelOpenAI, ExecutionEngine } from "../../src";
import {
  UserInput,
  UserOutput,
} from "../../src/execution-engine/message-queue";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

test("Patterns - Concurrency", async () => {
  const model = new ChatModelOpenAI({
    apiKey: OPENAI_API_KEY,
    model: DEFAULT_CHAT_MODEL,
  });

  const coder = AIAgent.from({
    subscribeTopic: [UserInput, "rewrite_request"],
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
`,
    outputSchema: z.object({
      code: z.string().describe("Your code"),
    }),
  });

  const reviewer = AIAgent.from({
    subscribeTopic: "review_request",
    publishTopic: "review_result",
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
        suggested_changes: z
          .string()
          .describe("Your comments on suggested changes"),
      }),
    }),
  });

  const engine = new ExecutionEngine({
    model,
    agents: [coder, reviewer],
  });

  const result = await engine.runLoop(
    {
      question:
        "Write a function to find the sum of all even numbers in a list.",
    },
    {
      subscribe: {
        review_result: (output) => {
          if (output.approval) {
            engine.publish(UserOutput, output);
          } else {
            engine.publish("rewrite_request", output);
          }
        },
      },
    },
  );

  expect(result).toEqual({
    code: expect.stringContaining(""),
  });
});
