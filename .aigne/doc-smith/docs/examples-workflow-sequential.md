# Workflow Sequential

This guide demonstrates how to build a step-by-step processing pipeline where tasks are executed in a guaranteed order. You will learn how to chain multiple agents together, with the output of one agent becoming the input for the next, creating a reliable and predictable workflow.

This example is ideal for processes that require a series of transformations or analyses, such as drafting content, refining it, and then formatting it for publication. For workflows that can benefit from simultaneous task execution, refer to the [Workflow Concurrency](./examples-workflow-concurrency.md) example.

## Overview

A sequential workflow processes tasks in a predefined order. Each step must complete before the next one begins, ensuring an orderly progression from input to final output. This pattern is fundamental for building complex, multi-stage agentic systems.

```d2
direction: down

Input: {
  label: "Input\n(Product Description)"
  shape: oval
}

Sequential-Workflow: {
  label: "Sequential Workflow (TeamAgent)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Concept-Extractor: {
    label: "1. Concept Extractor"
    shape: rectangle
  }

  Writer: {
    label: "2. Writer"
    shape: rectangle
  }

  Format-Proofread: {
    label: "3. Format & Proofread"
    shape: rectangle
  }
}

Output: {
  label: "Final Output\n(concept, draft, content)"
  shape: oval
}

Input -> Sequential-Workflow.Concept-Extractor
Sequential-Workflow.Concept-Extractor -> Sequential-Workflow.Writer: "output: concept"
Sequential-Workflow.Writer -> Sequential-Workflow.Format-Proofread: "output: draft"
Sequential-Workflow.Format-Proofread -> Output: "output: content"
```

## Quick Start

You can run this example directly without any local installation using `npx`.

### Prerequisites

- [Node.js](https://nodejs.org) (version 20.0 or higher)
- An API key from a supported model provider (e.g., [OpenAI](https://platform.openai.com/api-keys))

### Execute the Workflow

The example can be run in a default one-shot mode, an interactive chat mode, or by piping input directly.

1.  **One-Shot Mode**: Executes the workflow once with a predefined input.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential
    ```

2.  **Interactive Chat Mode**: Starts a session where you can provide continuous input.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential --chat
    ```

3.  **Pipeline Input**: Processes input piped from another command.

    ```sh icon=lucide:terminal
    echo "Create marketing content for our new AI-powered fitness app" | npx -y @aigne/example-workflow-sequential
    ```

### Connect to an AI Model

To execute the workflow, you must connect to an AI model. You will be prompted to choose a connection method upon the first run.

- **AIGNE Hub (Recommended)**: The easiest way to get started. New users receive complimentary tokens.
- **Self-Hosted AIGNE Hub**: Connect to your own instance of the AIGNE Hub.
- **Third-Party Provider**: Configure your environment with an API key from a provider like OpenAI.

To use OpenAI directly, set the following environment variable:

```sh icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## How It Works

The sequential workflow is constructed using a `TeamAgent` configured with `ProcessMode.sequential`. This ensures that the agents listed in the `skills` array are executed in the order they are defined.

### Code Implementation

The core logic involves defining three distinct `AIAgent` instances and orchestrating them within a sequential `TeamAgent`.

```typescript sequential-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Initialize the model
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Define the first agent in the sequence: Concept Extractor
const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Given a product description, identify:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",
});

// 3. Define the second agent: Writer
const writer = AIAgent.from({
  instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (around 150 words).

Product description:
{{product}}

Below is the info about the product:
{{concept}}`, // Uses output from the previous agent
  outputKey: "draft",
});

// 4. Define the final agent: Format and Proofread
const formatProof = AIAgent.from({
  instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, and ensure a consistent tone.
Output the final polished copy.

Product description:
{{product}}

Below is the info about the product:
{{concept}}

Draft copy:
{{draft}}`, // Uses outputs from previous agents
  outputKey: "content",
});

// 5. Configure the AIGNE instance and the TeamAgent
const aigne = new AIGNE({ model });

const teamAgent = TeamAgent.from({
  skills: [conceptExtractor, writer, formatProof],
  mode: ProcessMode.sequential, // Set the execution mode to sequential
});

// 6. Invoke the workflow
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
```

### Execution Analysis

1.  **Model Initialization**: An `OpenAIChatModel` is configured with the necessary API key.
2.  **Agent Definitions**:
    *   `conceptExtractor`: Takes the initial `product` description and generates a `concept` output.
    *   `writer`: Uses the original `product` description and the `concept` from the previous step to create a `draft`.
    *   `formatProof`: Takes all previous outputs (`product`, `concept`, `draft`) to produce the final `content`.
3.  **Team Configuration**: A `TeamAgent` is created with the three agents in the desired execution order. `ProcessMode.sequential` is specified to enforce this order.
4.  **Invocation**: The `aigne.invoke` method starts the workflow with an initial input object. The framework automatically manages the state, passing the accumulated outputs to each subsequent agent.
5.  **Output**: The final result is an object containing the outputs from all agents in the sequence.

```json Output Example
{
  "concept": "**Product Description: AIGNE - No-code Generative AI Apps Engine**\n\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to empower users to seamlessly create ...",
  "draft": "Unlock the power of creation with AIGNE, the revolutionary No-code Generative AI Apps Engine! Whether you're a small business looking to streamline operations, an entrepreneur ...",
  "content": "Unlock the power of creation with AIGNE, the revolutionary No-Code Generative AI Apps Engine! Whether you are a small business aiming to streamline operations, an entrepreneur ..."
}
```

## Command-Line Options

You can customize the execution with the following parameters:

| Parameter                 | Description                                                                                              | Default            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat`                  | Run in interactive chat mode.                                                                            | Disabled           |
| `--model <provider[:model]>` | Specify the AI model to use (e.g., `openai` or `openai:gpt-4o-mini`).                                     | `openai`           |
| `--temperature <value>`   | Set the temperature for model generation.                                                                | Provider default   |
| `--top-p <value>`         | Set the top-p sampling value.                                                                            | Provider default   |
| `--presence-penalty <value>`| Set the presence penalty value.                                                                          | Provider default   |
| `--frequency-penalty <value>`| Set the frequency penalty value.                                                                         | Provider default   |
| `--log-level <level>`     | Set the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`).                                         | `INFO`             |
| `--input, -i <input>`     | Specify the input directly via the command line.                                                         | None               |

### Usage Examples

```sh icon=lucide:terminal
# Run in chat mode with a specific model
npx @aigne/example-workflow-sequential --chat --model openai:gpt-4o-mini

# Set logging level to debug for detailed output
npx @aigne/example-workflow-sequential --log-level DEBUG
```

## Summary

This example has demonstrated the configuration and execution of a sequential workflow using the AIGNE Framework. By defining a series of agents and arranging them in a `TeamAgent` with `ProcessMode.sequential`, you can build robust, ordered pipelines for complex, multi-step tasks.

For further reading on agent collaboration, explore the following topics:

<x-cards data-columns="2">
  <x-card data-title="Team Agent" data-href="/developer-guide/agents/team-agent" data-icon="lucide:users">
    Learn more about orchestrating multiple agents in sequential, parallel, or self-correcting modes.
  </x-card>
  <x-card data-title="Workflow: Concurrency" data-href="/examples/workflow-concurrency" data-icon="lucide:git-fork">
    Discover how to run agents in parallel to optimize performance for tasks that can be executed simultaneously.
  </x-card>
</x-cards>