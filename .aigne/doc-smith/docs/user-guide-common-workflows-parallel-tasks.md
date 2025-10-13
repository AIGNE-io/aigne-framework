# Workflow Reflection

The Reflection workflow pattern enables self-improvement and iterative refinement of agent outputs. In this pattern, an initial output is generated and then passed to a separate `reviewer` agent for evaluation. If the output doesn't meet the required standards, it's sent back with feedback for another iteration. This cycle continues until the output is approved or a maximum number of iterations is reached.

This pattern is particularly effective for scenarios requiring high-quality, validated outputs, such as:
- **Code Generation and Review**: A coder agent writes code, and a reviewer agent inspects it for correctness, efficiency, and safety.
- **Content Quality Control**: A writer agent generates content, and an editor agent checks it for style, grammar, and accuracy.
- **Self-Correcting Systems**: Agents can learn from feedback and iteratively improve their performance on a given task.

## How It Works

The reflection process follows a loop where one or more agents generate a solution, and a reviewer agent provides feedback. The initial agents then use this feedback to refine their next attempt.

# Workflow Reflection

The Reflection workflow pattern enables self-improvement and iterative refinement of agent outputs. In this pattern, an initial output is generated and then passed to a separate `reviewer` agent for evaluation. If the output doesn't meet the required standards, it's sent back with feedback for another iteration. This cycle continues until the output is approved or a maximum number of iterations is reached.

This pattern is particularly effective for scenarios requiring high-quality, validated outputs, such as:
- **Code Generation and Review**: A coder agent writes code, and a reviewer agent inspects it for correctness, efficiency, and safety.
- **Content Quality Control**: A writer agent generates content, and an editor agent checks it for style, grammar, and accuracy.
- **Self-Correcting Systems**: Agents can learn from feedback and iteratively improve their performance on a given task.

## How It Works

The reflection process follows a loop where one or more agents generate a solution, and a reviewer agent provides feedback. The initial agents then use this feedback to refine their next attempt.

```d2
direction: down

start: { 
  label: "Start"
  shape: oval 
}

generator: {
  label: "Generator Agent\nGenerates Initial Output"
  shape: rectangle
}

reviewer: {
  label: "Reviewer Agent\nEvaluates Output"
  shape: rectangle
}

decision: {
  label: "Output Meets\nStandards?"
  shape: diamond
}

end: {
  label: "End\n(Approved Output)"
  shape: oval
}

start -> generator
generator -> reviewer: "Submit for review"
reviewer -> decision
decision -> end: "Yes"
decision -> generator: "No (Provide Feedback)"
```

## Configuration

To enable the reflection pattern, you configure the `reflection` property within the `TeamAgentOptions`. This property takes a `ReflectionMode` object that defines the review and approval process.

**ReflectionMode Parameters**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="The agent responsible for reviewing the output and providing feedback."></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean | unknown>) | string" data-required="true" data-desc="A function or a field name in the reviewer's output that determines if the result is approved. If it's a function, it receives the reviewer's output and should return a truthy value for approval. If it's a string, the corresponding field in the output is checked for truthiness."></x-field>
  <x-field data-name="maxIterations" data-type="number" data-required="false" data-default="3" data-desc="The maximum number of review-feedback cycles before the process is terminated. This prevents infinite loops."></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-required="false" data-default="false" data-desc="If set to `true`, the workflow returns the last generated output when `maxIterations` is reached, even if it was not approved. If `false`, it throws an error."></x-field>
</x-field-group>

## Example: Code Generation and Review

This example demonstrates a reflection workflow where a `coder` agent writes a Python function, and a `reviewer` agent evaluates it. The process continues until the `reviewer` approves the code.

### 1. Define the Coder Agent

The `coder` agent is responsible for writing the initial code based on a user's request. It is designed to receive feedback from the reviewer to improve its solution in subsequent iterations.

```typescript
import { TeamAgent, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  name: "Coder",
  instructions: `
You are a proficient coder. You write Python code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.

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
  inputKey: "question",
});
```

### 2. Define the Reviewer Agent

The `reviewer` agent evaluates the code generated by the `coder`. It checks for correctness, efficiency, and safety, and provides structured feedback. Its output includes a boolean `approval` field that controls the reflection loop.

```typescript
const reviewer = AIAgent.from({
  name: "Reviewer",
  instructions: `
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("Set to true to APPROVE or false to REVISE"),
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
```

### 3. Create and Invoke the TeamAgent

A `TeamAgent` is configured to orchestrate the workflow. The `coder` is set as the primary agent (skill), and the `reviewer` is configured in the `reflection` property. The `isApproved` condition points to the `approval` field in the `reviewer`'s output.

```typescript
const reflectionTeam = TeamAgent.from({
  skills: [coder],
  reflection: {
    reviewer,
    isApproved: "approval",
    maxIterations: 3,
  },
});

async function run() {
  const result = await reflectionTeam.invoke(
    {
      question: "Write a function to find the sum of all even numbers in a list.",
    },
    { model }
  );
  
  console.log(JSON.stringify(result, null, 2));
}

run();
```

### Example Output

After one or more iterations, the `reviewer` agent approves the code, and the final output from the `coder` agent is returned.

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)"
}
```