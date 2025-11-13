# Workflow Concurrency

Are you looking to speed up your AI workflows? This guide demonstrates how to build a concurrent workflow with the AIGNE Framework, enabling you to process multiple tasks in parallel. You will learn to configure a `TeamAgent` to execute different analyses simultaneously and efficiently merge the results.

## Overview

In many real-world scenarios, a complex problem can be deconstructed into smaller, independent sub-tasks. Instead of processing these tasks sequentially, they can be executed concurrently to save time. This example demonstrates a common concurrency pattern where a single input—a product description—is analyzed from multiple perspectives by different agents. Their individual outputs are then aggregated into a final, comprehensive result.

The workflow is structured as follows:

```d2
direction: down

Input: {
  label: "Input\n(Product Description)"
  shape: oval
}

TeamAgent: {
  label: "Parallel Processing (TeamAgent)"
  shape: rectangle

  Feature-Extractor: {
    label: "Feature Extractor"
    shape: rectangle
  }

  Audience-Analyzer: {
    label: "Audience Analyzer"
    shape: rectangle
  }
}

Aggregation: {
  label: "Aggregation"
  shape: diamond
}

Output: {
  label: "Output\n({ features, audience })"
  shape: oval
}

Input -> TeamAgent.Feature-Extractor
Input -> TeamAgent.Audience-Analyzer
TeamAgent.Feature-Extractor -> Aggregation: "features"
TeamAgent.Audience-Analyzer -> Aggregation: "audience"
Aggregation -> Output
```

-   **Input**: A product description is provided to the workflow.
-   **Parallel Processing**:
    -   A `Feature Extractor` agent analyzes the description to identify key product features.
    -   An `Audience Analyzer` agent simultaneously analyzes the same description to determine the target audience.
-   **Aggregation**: The outputs from both agents (`features` and `audience`) are collected.
-   **Output**: A single, structured object containing both the extracted features and the audience analysis is returned.

This example supports both a one-shot execution mode for single inputs and an interactive chat mode for conversational analysis.

## Prerequisites

Before running the example, ensure your system meets the following requirements:

-   [Node.js](https://nodejs.org) (version 20.0 or higher).
-   An [OpenAI API key](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly from the command line without cloning the repository using `npx`.

### Run the Example

Execute one of the following commands in your terminal.

To run in the default one-shot mode:
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency
```

To run in an interactive chat session:
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency --chat
```

To provide input via a pipeline:
```bash npx command icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
```

### Connect to an AI Model

The first time you run the example, you will be prompted to connect to an AI model provider.

![Connect to a model provider](/media/examples/workflow-concurrency/run-example.png)

You have several options for connecting:

1.  **AIGNE Hub (Official)**: The recommended option for new users. It provides free tokens to get started.
2.  **AIGNE Hub (Self-Hosted)**: For users running their own instance of the AIGNE Hub.
3.  **Third-Party Model Provider**: You can connect directly to a provider like OpenAI by setting the required API key as an environment variable.

For example, to use OpenAI directly:
```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```
After configuring the environment variable, run the `npx` command again.

## Installation and Local Setup

For development purposes, you can clone the repository and run the example from the source code.

### 1. Clone the Repository

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example directory and install the necessary packages using `pnpm`.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. Run the Example Locally

Use the `pnpm start` command to execute the script.

To run in one-shot mode:
```bash Run in one-shot mode icon=lucide:terminal
pnpm start
```

To run in interactive chat mode, add the `--chat` flag. Note that arguments passed to `pnpm start` must be preceded by `--`.
```bash Run in chat mode icon=lucide:terminal
pnpm start -- --chat
```

To use pipeline input:
```bash Run with pipeline input icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
```

## Code Implementation

The core logic is implemented using a `TeamAgent` configured for parallel execution. Two `AIAgent` instances are defined as skills within the team: one for feature extraction and another for audience analysis.

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// Initialize the OpenAI model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// Define the first agent to extract product features
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.\n\nProduct description:\n{{product}}`,
  outputKey: "features",
});

// Define the second agent to analyze the target audience
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.\n\nProduct description:\n{{product}}`,
  outputKey: "audience",
});

// Initialize the AIGNE instance
const aigne = new AIGNE({ model });

// Create a TeamAgent to manage the parallel workflow
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel, // Set the execution mode to parallel
});

// Invoke the team with a product description
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/* Expected Output:
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

### Key Concepts

-   **`AIAgent`**: Represents an individual AI-powered worker with specific instructions. Here, `featureExtractor` and `audienceAnalyzer` are `AIAgent` instances.
-   **`TeamAgent`**: An agent that orchestrates other agents (skills). It can run them sequentially or in parallel.
-   **`ProcessMode.parallel`**: This configuration on the `TeamAgent` instructs it to execute all its skills simultaneously. The `TeamAgent` waits for all parallel tasks to complete before aggregating their outputs.
-   **`outputKey`**: This property in each `AIAgent` defines the key under which its result will be stored in the final output object.

## Command-Line Options

The example script accepts several command-line arguments to customize its behavior.

| Parameter                 | Description                                                                                              | Default            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat`                  | Runs the agent in an interactive chat mode instead of a single execution.                                | Disabled           |
| `--model <provider[:model]>` | Specifies the AI model to use, e.g., `openai` or `openai:gpt-4o-mini`.                                   | `openai`           |
| `--temperature <value>`   | Sets the temperature for model generation to control creativity.                                         | Provider default   |
| `--top-p <value>`         | Sets the top-p (nucleus sampling) value.                                                                 | Provider default   |
| `--presence-penalty <value>` | Sets the presence penalty value to discourage repeating tokens.                                          | Provider default   |
| `--frequency-penalty <value>` | Sets the frequency penalty value to discourage repeating frequent tokens.                                | Provider default   |
| `--log-level <level>`     | Sets the logging verbosity. Accepted values are `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`.                   | `INFO`             |
| `--input`, `-i <input>`   | Provides the input directly as an argument.                                                              | None               |

#### Usage Example

To run in chat mode with a specific model and log level:
```bash Command example icon=lucide:terminal
pnpm start -- --chat --model openai:gpt-4o-mini --log-level DEBUG
```

## Debugging

You can monitor and analyze agent executions using the AIGNE observation server. This tool provides a web-based interface to inspect traces, view detailed information about each step, and understand the agent's runtime behavior.

First, start the observation server in a separate terminal window:
```bash Start observer icon=lucide:terminal
aigne observe
```

![Start observation server](/media/examples/images/aigne-observe-execute.png)

After running the example, you can open the web interface (typically at `http://localhost:3333`) to see a list of recent executions and drill down into the details of the concurrent workflow.

![View execution list](/media/examples/images/aigne-observe-list.png)