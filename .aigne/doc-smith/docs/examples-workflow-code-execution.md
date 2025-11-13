# Workflow Code Execution

This document provides a technical walkthrough for building a secure, AI-driven workflow that dynamically generates and executes code. By the end, you will understand how to orchestrate a "Coder" agent that writes JavaScript to solve problems and a "Sandbox" agent that safely runs the code, enabling complex, automated problem-solving.

## Overview

In many advanced AI applications, it is necessary to solve problems that require computation or logic beyond the capabilities of a standard language model. This example implements a common and powerful pattern: using one AI agent to write code and another, isolated agent to execute it. This approach allows the system to perform complex calculations, data manipulation, and other programmatic tasks dynamically.

The workflow consists of two main agents:
*   **Coder Agent**: An `AIAgent` tasked with understanding a user's request and writing JavaScript code to fulfill it.
*   **Sandbox Agent**: A `FunctionAgent` that wraps a JavaScript evaluation environment. It receives code from the Coder, executes it, and returns the result. This isolates the code execution, preventing it from affecting the main application.

This separation of concerns ensures both safety and modularity. The diagram below illustrates the high-level data flow.

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "AI Workflow"
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

User -> Workflow.Coder-Agent: "1. Problem Request\n(e.g., 'Calculate 10!')"
Workflow.Coder-Agent -> Workflow.Sandbox-Agent: "2. Generate & Execute JS\n(e.g., 'evaluateJs({ code: ... })')"
Workflow.Sandbox-Agent -> Workflow.Coder-Agent: "3. Return Result\n(e.g., 3628800)"
Workflow.Coder-Agent -> User: "4. Final Answer\n(e.g., '10! is 3628800')"

```

The following sequence diagram details the interaction between the user and the agents for a sample request.

DIAGRAM_PLACEHOLDER

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js.
*   **OpenAI API Key**: Required for the Coder agent to interact with an AI model. You can obtain a key from the [OpenAI Platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly from the command line without a local installation using `npx`.

### Run the Example

Execute one of the following commands in your terminal:

*   **One-Shot Mode**: The agent processes a single input and exits.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution
    ```

*   **Interactive Chat Mode**: Start a continuous chat session with the agent.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution --chat
    ```

*   **Pipeline Mode**: Pipe input from another command.

    ```bash icon=lucide:terminal
    echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
    ```

### Connect to an AI Model

The first time you run the example, you will be prompted to connect to an AI model provider.

![Connect to a model provider](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/workflow-code-execution/run-example.png)

You have several options:

1.  **AIGNE Hub (Official)**: The easiest way to get started. It provides free credits for new users.

    ![Connect to official AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

2.  **AIGNE Hub (Self-Hosted)**: Connect to your own instance of AIGNE Hub.

    ![Connect to self-hosted AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **Third-Party Model Provider**: Configure a direct connection to a provider like OpenAI, DeepSeek, or Google Gemini. To do this, set the corresponding API key as an environment variable. For OpenAI, use:

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    After setting the environment variable, run the example again.

## Full Installation and Usage

For development or modification of the example, clone the repository and install the dependencies locally.

### 1. Clone the Repository

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example directory and install the necessary packages using `pnpm`.

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. Run the Example

Use the `pnpm start` command to run the workflow.

*   **One-Shot Mode**:

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **Interactive Chat Mode**:

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

*   **Pipeline Mode**:

    ```bash icon=lucide:terminal
    echo "Calculate 15!" | pnpm start
    ```

### Command-Line Options

The example supports several command-line arguments to customize its behavior.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `--chat` | Run in interactive chat mode. | Disabled |
| `--model <provider[:model]>` | Specify the AI model to use (e.g., `openai` or `openai:gpt-4o-mini`). | `openai` |
| `--temperature <value>` | Set the temperature for model generation. | Provider default |
| `--top-p <value>` | Set the top-p sampling value. | Provider default |
| `--presence-penalty <value>` | Set the presence penalty value. | Provider default |
| `--frequency-penalty <value>` | Set the frequency penalty value. | Provider default |
| `--log-level <level>` | Set the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`). | `INFO` |
| `--input`, `-i <input>` | Provide input directly as an argument. | None |

## Code Implementation

The following TypeScript code outlines the core logic for the code execution workflow. It defines the `sandbox` and `coder` agents and invokes them to solve a problem.

```typescript code-execution.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// Ensure the OpenAI API key is available in the environment variables.
const { OPENAI_API_KEY } = process.env;

// 1. Initialize the AI Model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Create the Sandbox Agent
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
    // biome-ignore lint/security/noGlobalEval: This is an intentional use for a sandboxed environment.
    const result = eval(code);
    return { result };
  },
});

// 3. Create the Coder Agent
// This AI agent is instructed to write and execute code using the sandbox skill.
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
const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
```

The expected output is a JSON object containing the final message from the agent:

```json
{
  "$message": "The value of \\(10!\\) (10 factorial) is 3,628,800."
}
```

## Debugging

You can monitor and analyze agent executions using the AIGNE observer tool. It provides a web-based interface to inspect traces, view detailed calls, and understand the agent's behavior at runtime.

First, start the observation server in a separate terminal:

```bash icon=lucide:terminal
aigne observe
```

After running your workflow, you can view the execution traces in the observer UI.

![AIGNE Observe Execution](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

The UI provides a list of recent executions for detailed inspection.

![AIGNE Observe List](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)
