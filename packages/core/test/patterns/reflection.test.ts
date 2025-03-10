import { expect, spyOn, test } from "bun:test";
import {
  AIAgent,
  ChatModelOpenAI,
  type ChatModelOutput,
  ExecutionEngine,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core";
import { z } from "zod";

test("Patterns - Reflection", async () => {
  const model = new ChatModelOpenAI();

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

  const mockModelResults: ChatModelOutput[] = [
    {
      json: {
        code: "def sum_even(lst):\n    return sum(x for x in lst if x % 3 == 0)",
      },
    },
    {
      json: {
        approval: false,
        feedback: {
          correctness: "Incorrect",
          efficiency: "Optimized",
          safety: "Safe",
          suggested_changes: "None",
        },
      },
    },
    {
      json: {
        code: "def sum_even(lst):\n    return sum(x for x in lst if x % 2 == 0)",
      },
    },
    {
      json: {
        approval: true,
        feedback: {
          correctness: "Correct",
          efficiency: "Optimized",
          safety: "Safe",
          suggested_changes: "None",
        },
      },
    },
  ] as const;

  let modelCallCount = 0;
  const modelProcess = spyOn(model, "process").mockImplementation(
    async () => mockModelResults[modelCallCount++] ?? {},
  );

  const engine = new ExecutionEngine({
    model,
    agents: [coder, reviewer],
  });

  const runLoop = spyOn(engine as any, "publishUserInputTopic");

  const result = await engine.run({
    question: "Write a function to find the sum of all even numbers in a list.",
  });

  expect(runLoop).toHaveBeenCalledTimes(1);

  expect(modelProcess).toHaveBeenCalledTimes(mockModelResults.length);

  expect(result).toEqual({
    ...mockModelResults[3]!.json,
    ...mockModelResults[2]!.json,
  });
});
