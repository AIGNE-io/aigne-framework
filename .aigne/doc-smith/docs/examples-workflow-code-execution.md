# Workflow Code Execution

Executing dynamically generated code from an AI model presents significant security and reliability challenges. This guide provides a structured, step-by-step process for building a secure code execution workflow using the AIGNE Framework. You will learn how to orchestrate a `Coder` agent, which generates code, and a `Sandbox` agent, which executes it in an isolated environment.

## Overview

The code execution workflow is designed to safely handle tasks that require dynamic code generation and execution. It employs a two-agent system:

1.  **Coder Agent**: An AI-driven agent responsible for interpreting a user's request and writing the necessary JavaScript code to solve it.
2.  **Sandbox Agent**: A `FunctionAgent` that takes the generated code and executes it in a controlled environment, returning the result.

This separation of concerns ensures that the AI's code generation is isolated from direct execution, providing a layer of security.

### Logical Flow

The following diagram illustrates the high-level interaction between the agents. The `Coder` agent receives an input, generates code, passes it to the `Sandbox` for execution, and then formats the final output.

```d2
direction: down

User-Input: {
  label: "User Input\n(e.g., 'Calculate 15!')"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  Coder-Agent: {
    label: "Coder Agent\n(AIAgent)"
    shape: rectangle
  }

  Sandbox-Agent: {
    label: "Sandbox Agent\n(FunctionAgent)"
    shape: rectangle
  }
}

Final-Output: {
  label: "Final Output"
  shape: rectangle
}

User-Input -> AIGNE-Framework.Coder-Agent: "1. Receives prompt"
AIGNE-Framework.Coder-Agent -> AIGNE-Framework.Sandbox-Agent: "2. Generates JS code & passes for execution"
AIGNE-Framework.Sandbox-Agent -> AIGNE-Framework.Coder-Agent: "3. Executes code & returns result"
AIGNE-Framework.Coder-Agent -> Final-Output: "4. Formats final response"

```

### Sequence of Interaction

This sequence diagram details the turn-by-turn communication between the user and the agents for a specific task, such as calculating a factorial.

DIAGRAM_PLACEHOLDER

## Quick Start

You can run this example directly without any local installation using `npx`.

### Run the Example

The example supports a one-shot execution mode for single tasks and an interactive chat mode for conversational workflows.

#### One-Shot Mode

This is the default mode. The agent processes a single input and exits.

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution
```

You can also provide input directly via standard input pipeline.

```bash icon=lucide:terminal
echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
```

#### Interactive Chat Mode

Use the `--chat` flag to start a persistent session where you can have a conversation with the agent.

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution --chat
```

### Connect to an AI Model

The first time you run the example, it will prompt you to connect to a Large Language Model (LLM) since one is required for the `Coder` agent to function.

DIAGRAM_PLACEHOLDER

You have several options to proceed.

#### Option 1: AIGNE Hub (Recommended)

This is the easiest way to get started. The official AIGNE Hub provides free credits for new users.

1.  Select the first option: `Connect to the Arcblock official AIGNE Hub`.
2.  Your web browser will open an authorization page.
3.  Follow the prompts to approve the connection.

DIAGRAM_PLACEHOLDER

#### Option 2: Self-Hosted AIGNE Hub

If you have your own instance of AIGNE Hub, you can connect to it.

1.  Select the second option: `Connect to a self-hosted AIGNE Hub`.
2.  You will be prompted to enter the URL of your AIGNE Hub instance.

DIAGRAM_PLACEHOLDER

#### Option 3: Third-Party Model Providers

You can connect directly to a third-party model provider like OpenAI, Anthropic, or Google Gemini by setting the appropriate environment variables. For example, to use OpenAI, set your API key:

```bash icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

After setting the environment variable, run the example command again. For a list of all supported providers and their required environment variables, refer to the example `.env.local.example` file.

### Debugging with AIGNE Observe

The AIGNE Framework includes a powerful observability tool for debugging and analyzing agent behavior.

1.  **Start the Server**: In your terminal, run the `aigne observe` command. This launches a local web server.

    ```bash icon=lucide:terminal
    aigne observe
    ```

    DIAGRAM_PLACEHOLDER

2.  **View Traces**: Open your web browser and navigate to the local URL provided (e.g., `http://localhost:7893`). The interface displays a list of recent agent executions, allowing you to inspect inputs, outputs, tool calls, and performance metrics for each trace.

    DIAGRAM_PLACEHOLDER

## Local Installation and Usage

For development purposes, you can clone the repository and run the example locally.

### Prerequisites

-   [Node.js](https://nodejs.org) (version 20.0 or higher)
-   [pnpm](https://pnpm.io) for package management

### 1. Clone the Repository

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example directory and install the required packages.

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. Run the Example

Use the `pnpm start` command to execute the workflow.

```bash icon=lucide:terminal
# Run in one-shot mode (default)
pnpm start

# Run in interactive chat mode
pnpm start -- --chat

# Use pipeline input
echo "Calculate 15!" | pnpm start
```

### Command-Line Options

The script accepts several command-line arguments to customize its behavior.

| Parameter                   | Description                                                                                              | Default          |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat`                    | Run in interactive chat mode.                                                                            | Disabled         |
| `--model <provider[:model]>` | Specify the AI model to use, e.g., `openai` or `openai:gpt-4o-mini`.                                     | `openai`         |
| `--temperature <value>`     | Set the temperature for model generation.                                                                | Provider default |
| `--top-p <value>`           | Set the top-p sampling value.                                                                            | Provider default |
| `--presence-penalty <value>`| Set the presence penalty value.                                                                          | Provider default |
| `--frequency-penalty <value>`| Set the frequency penalty value.                                                                         | Provider default |
| `--log-level <level>`       | Set the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`).                                         | `INFO`           |
| `--input`, `-i <input>`     | Provide input directly as an argument.                                                                   | None             |

#### Usage Example

This command runs the workflow in interactive mode with the `DEBUG` log level.

```bash icon=lucide:terminal
pnpm start -- --chat --log-level DEBUG
```

## Code Implementation

The following TypeScript code demonstrates how to construct the code execution workflow. It defines the `sandbox` and `coder` agents and invokes them using the AIGNE instance.

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// Retrieve the OpenAI API key from environment variables.
const { OPENAI_API_KEY } = process.env;

// 1. Initialize the Chat Model
// This model will power the AI agent.
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Define the Sandbox Agent
// This agent safely executes JavaScript code using a FunctionAgent.
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // The use of eval is isolated within this sandboxed agent.
    // biome-ignore lint/security/noGlobalEval: <This is a controlled sandbox environment for the example>
    const result = eval(code);
    return { result };
  },
});

// 3. Define the Coder Agent
// This AI agent is instructed to write code and use the sandbox skill.
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

// 4. Initialize the AIGNE Framework
const aigne = new AIGNE({ model });

// 5. Invoke the Workflow
// The AIGNE instance runs the coder agent with the user's prompt.
const result = await aigne.invoke(coder, "10! = ?");

console.log(result);
// Expected Output:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

## Summary

This guide has demonstrated how to build and run a secure code execution workflow using the AIGNE Framework. By separating the concerns of code generation and execution into distinct `AIAgent` and `FunctionAgent` roles, you can safely leverage the power of LLMs for tasks that require dynamic code.

For more advanced workflow patterns, explore the following examples:
<x-cards data-columns="2">
  <x-card data-title="Sequential Workflow" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right-circle">Build step-by-step processing pipelines with guaranteed execution order.</x-card>
  <x-card data-title="Workflow Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">Coordinate multiple agents working together in sophisticated processing pipelines.</x-card>
</x-cards>