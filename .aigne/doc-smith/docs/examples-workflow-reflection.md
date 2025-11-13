# Workflow Reflection

Ever wonder how to make an AI workflow that corrects its own mistakes? This guide demonstrates how to build a self-improving system where one AI agent generates content and another reviews and refines it, creating a feedback loop for continuous improvement. You'll learn to set up a "Coder" and "Reviewer" agent team that collaborates to produce a polished final output.

## Overview

The Workflow Reflection pattern involves a multi-agent system designed for iterative refinement. In this example, we create a workflow with two distinct agents:

*   **Coder Agent**: Responsible for generating the initial solution (e.g., writing a piece of code) based on a user's request.
*   **Reviewer Agent**: Evaluates the Coder's output against specific criteria (e.g., correctness, efficiency, safety).

The workflow follows a structured loop:

1.  A user provides an initial idea or problem.
2.  The `Coder` agent receives the idea and generates a solution.
3.  The `Reviewer` agent examines the solution.
4.  If the solution is approved, it is sent to the final output.
5.  If the solution is rejected, the `Reviewer` provides feedback, and the request is sent back to the `Coder` for revision.

This cyclical process continues until the `Reviewer` approves the output, ensuring a high-quality result.

```d2
direction: down

User: {
  shape: c4-person
}

Coder-Agent: {
  label: "Coder Agent"
  shape: rectangle
}

Reviewer-Agent: {
  label: "Reviewer Agent"
  shape: rectangle
}

Decision: {
  label: "Approved?"
  shape: diamond
}

Final-Output: {
  label: "Final Output"
  shape: rectangle
}

User -> Coder-Agent: "1. Provide idea"
Coder-Agent -> Reviewer-Agent: "2. Generate solution"
Reviewer-Agent -> Decision: "3. Examine solution"
Decision -> Final-Output: "4. Yes"
Decision -> Coder-Agent: "5. No, provide feedback"
```

## Quick Start

You can run this example directly without any local installation using `npx`.

### Run the Example

Execute the following commands in your terminal.

*   **One-Shot Mode**: The agent processes a single input and terminates.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection
    ```

*   **Interactive Chat Mode**: Start a continuous chat session with the agent team.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection --chat
    ```

*   **Pipeline Mode**: Pipe input directly from another command.

    ```bash icon=lucide:terminal
    echo "Write a function to validate email addresses" | npx -y @aigne/example-workflow-reflection
    ```

### Connect to an AI Model

The AIGNE Framework requires a connection to a Large Language Model (LLM) to function. You can connect through the AIGNE Hub for a managed experience or configure a third-party provider directly.

For instance, to use OpenAI, set the `OPENAI_API_KEY` environment variable:

```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

After configuring the API key, run the example again. For a detailed guide on configuring different model providers, refer to the [Model Configuration](./models-configuration.md) documentation.

## Running from Source

For developers who wish to inspect or modify the code, follow these steps to run the example from the source repository.

### 1. Clone the Repository

First, clone the AIGNE Framework repository to your local machine.

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and install the required dependencies using `pnpm`.

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-reflection
pnpm install
```

### 3. Run the Example

Execute the start script to run the workflow.

*   **One-Shot Mode (Default)**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **Interactive Chat Mode**

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

## Code Implementation

The core of this example is a TypeScript file that defines and orchestrates the `Coder` and `Reviewer` agents. Let's examine the key components.

```typescript reflection-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

// 1. Initialize the AI Model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Define the Coder Agent
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

// 3. Define the Reviewer Agent
const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
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
  includeInputInOutput: true,
});

// 4. Initialize and Run the AIGNE instance
const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  "Write a function to find the sum of all even numbers in a list.",
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
```

### Explanation

1.  **Initialize the Model**: An `OpenAIChatModel` instance is created to serve as the underlying LLM for both agents.
2.  **Define the Coder Agent**:
    *   `subscribeTopic`: Listens for initial user input (`UserInputTopic`) and for revision requests from the reviewer (`rewrite_request`).
    *   `publishTopic`: Sends its generated code to the `review_request` topic for the reviewer to pick up.
    *   `instructions`: A detailed prompt that defines its role, output format, and how to handle feedback.
    *   `outputSchema`: Uses a Zod schema to enforce that the output must contain a `code` string.
3.  **Define the Reviewer Agent**:
    *   `subscribeTopic`: Listens for code submissions on the `review_request` topic.
    *   `publishTopic`: A function that dynamically routes the output. If `approval` is `true`, the result is sent to the final `UserOutputTopic`. Otherwise, it's sent back to the `rewrite_request` topic for the coder to revise.
    *   `instructions`: A prompt that guides the reviewer on how to evaluate the code.
    *   `outputSchema`: A Zod schema that requires a boolean `approval` field and a structured `feedback` object.
4.  **Run the Workflow**:
    *   An `AIGNE` instance is created with the model and the two agents.
    *   `aigne.publish()` sends the initial problem statement to the `UserInputTopic`, kicking off the workflow.
    *   `aigne.subscribe()` waits for a message on the `UserOutputTopic`, which will only occur once the reviewer approves the code.

### Example Output

When the script is executed, the final approved output will be logged to the console:

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
  "approval": true,
  "feedback": {
    "correctness": "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
    "efficiency": "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
    "safety": "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
    "suggested_changes": "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers."
  }
}
```

## Command-Line Options

You can customize the execution with the following command-line flags:

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `--chat` | Run in interactive chat mode. | Disabled |
| `--model <provider[:model]>` | AI model to use, e.g., 'openai' or 'openai:gpt-4o-mini'. | `openai` |
| `--temperature <value>` | Temperature for model generation. | Provider default |
| `--top-p <value>` | Top-p sampling value for model generation. | Provider default |
| `--presence-penalty <value>` | Presence penalty value for model generation. | Provider default |
| `--frequency-penalty <value>` | Frequency penalty value for model generation. | Provider default |
| `--log-level <level>` | Set logging level (ERROR, WARN, INFO, DEBUG, TRACE). | `INFO` |
| `--input`, `-i <input>` | Specify input directly via the command line. | None |

#### Example Usage

```bash Set log level to DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## Summary

This example illustrates the power of workflow reflection in building robust, self-correcting AI systems. By separating the roles of generation and evaluation into distinct agents, you can create a feedback loop that significantly improves the quality and reliability of the final output.

To explore other advanced workflow patterns, see the following examples:

<x-cards data-columns="2">
  <x-card data-title="Workflow Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  Coordinate multiple agents working together in sophisticated processing pipelines.
  </x-card>
  <x-card data-title="Workflow Router" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  Implement intelligent routing logic to direct requests to appropriate handlers.
  </x-card>
</x-cards>