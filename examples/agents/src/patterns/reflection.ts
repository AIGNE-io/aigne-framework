import {
  AIAgent,
  ChatModelOpenAI,
  ExecutionEngine,
  UserInputTopic,
  UserOutputTopic,
} from "@aigne/core";
import { z } from "zod";
import { DEFAULT_CHAT_MODEL, OPENAI_API_KEY } from "../env";

// Initialize the OpenAI chat model with API key and model name
const model = new ChatModelOpenAI({
  apiKey: OPENAI_API_KEY,
  model: DEFAULT_CHAT_MODEL,
});

// Define the coder agent that writes code based on user input
const coder = AIAgent.from({
  // Subscribe to user input and rewrite requests
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  // TODO:
  // 1. PromptBuilder.fromFile
  // 2. PromptBuilder.fromString
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
  // Define the expected output schema for the coder
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

// Define the reviewer agent that reviews code written by the coder
const reviewer = AIAgent.from({
  // Subscribe to review requests and publish to either user output or request rewrites
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
  // Define the expected output schema for the reviewer
  outputSchema: z.object({
    // Determine if code should be approved or revised
    approval: z.boolean().describe("APPROVE or REVISE"),
    // Detailed feedback object with different aspects of review
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z.string().describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

// Create an execution engine that coordinates the agents
const engine = new ExecutionEngine({
  model,
  agents: [coder, reviewer],
});

// Run the engine with a sample coding task
const result = await engine.run({
  question: "Write a function to find the sum of all even numbers in a list.",
});

// Output the final result
console.log(result);
