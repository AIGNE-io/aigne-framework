
# Workflow Router

This guide demonstrates how to build an intelligent workflow that automatically routes user requests to the most appropriate specialized agent. You will learn how to create a "triage" agent that acts as a smart dispatcher, analyzing incoming queries and forwarding them to other agents based on the query's content.

## Overview

In many applications, user requests can fall into different categories, such as product support, user feedback, or general questions. A router workflow provides an efficient way to handle this by using a primary agent to classify the request and delegate it to the correct downstream agent. This pattern ensures that users are connected to the right resource quickly and efficiently.

The workflow consists of a main `triage` agent and several specialized agents:

-   **Triage Agent**: The entry point. It analyzes the user's query and decides which specialized agent should handle it.
-   **Product Support Agent**: Handles questions related to product usage.
-   **Feedback Agent**: Manages user feedback and suggestions.
-   **Other Agent**: A general-purpose agent for queries that do not fit the other categories.

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "Workflow Router"
  shape: rectangle

  Triage-Agent: {
    label: "Triage Agent"
    shape: diamond
  }

  Specialized-Agents: {
    shape: rectangle
    grid-columns: 3

    Product-Support-Agent: {
      label: "Product Support Agent"
      shape: rectangle
    }

    Feedback-Agent: {
      label: "Feedback Agent"
      shape: rectangle
    }

    Other-Agent: {
      label: "Other Agent"
      shape: rectangle
    }
  }
}

User -> Workflow.Triage-Agent: "User Query"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Product-Support-Agent: "Routes to"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Feedback-Agent: "Routes to"
Workflow.Triage-Agent -> Workflow.Specialized-Agents.Other-Agent: "Routes to"
```

## Prerequisites

Before running this example, ensure you have the following installed and configured:

-   **Node.js**: Version 20.0 or higher.
-   **npm**: Included with Node.js.
-   **OpenAI API Key**: You'll need an API key from OpenAI to connect to their language models. You can get one from the [OpenAI Platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly without any local installation using `npx`.

### Run the Example

The example can be run in a one-shot mode, an interactive chat mode, or by piping input directly.

1.  **One-Shot Mode (Default)**
    This command executes the workflow with a default question and exits.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router
    ```

2.  **Interactive Chat Mode**
    Use the `--chat` flag to start an interactive session where you can ask multiple questions.

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-router --chat
    ```

3.  **Pipeline Input**
    You can pipe a question directly into the command.

    ```sh icon=lucide:terminal
    echo "How do I return a product?" | npx -y @aigne/example-workflow-router
    ```

### Connect to an AI Model

When you run the example for the first time, you will be prompted to connect to an AI model. You have several options:

1.  **AIGNE Hub (Official)**: The easiest way to get started. The browser will open, and you can follow the prompts to connect. New users receive a complimentary token grant.
2.  **AIGNE Hub (Self-Hosted)**: If you host your own AIGNE Hub instance, you can provide its URL to connect.
3.  **Third-Party Model Provider**: You can connect directly to a provider like OpenAI by setting an environment variable with your API key.

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY="your_openai_api_key_here"
    ```

    After setting the key, run the example command again.

## Implementation Deep Dive

The core of this workflow is the `triage` agent, which uses other agents as "skills" or "tools". By setting `toolChoice` to `"router"`, you instruct the `triage` agent to select exactly one of the available skills to handle the incoming request.

### Code Example

The following TypeScript code demonstrates how to define the specialized agents and the main routing agent.

```typescript router.ts icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. Initialize the Chat Model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Define Specialized Agents
const productSupport = AIAgent.from({
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

// 3. Define the Triage (Router) Agent
const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // This enables the router mode
});

// 4. Initialize AIGNE and Invoke the Workflow
const aigne = new AIGNE({ model });

// Example 1: Product Support Query
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);

// Example 2: Feedback Query
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);

// Example 3: General Query
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
```

### Expected Output

When you run the code, the `triage` agent will analyze each question and route it to the appropriate specialized agent. The final output will be an object where the key is the `outputKey` of the selected agent.

**Product Support Query:**
```json
{
  "product_support": "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?"
}
```

**Feedback Query:**
```json
{
  "feedback": "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app."
}
```

**General Query:**
```json
{
  "other": "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!"
}
```

## Running from Source (Optional)

If you prefer to run the example from a local clone of the repository, follow these steps.

1.  **Clone the Repository**

    ```sh icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **Install Dependencies**

    Navigate to the example directory and install dependencies using `pnpm`.

    ```sh icon=lucide:terminal
    cd aigne-framework/examples/workflow-router
    pnpm install
    ```

3.  **Run the Example**

    Use the `pnpm start` command to run the workflow. Command-line arguments must be passed after `--`.

    ```sh icon=lucide:terminal
    # Run in one-shot mode
    pnpm start

    # Run in interactive chat mode
    pnpm start -- --chat

    # Use pipeline input
    echo "How do I return a product?" | pnpm start
    ```

### Command-Line Options

You can customize the execution with the following parameters:

| Parameter                     | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--chat`                      | Run in interactive chat mode.                                                                           |
| `--model <provider[:model]>`  | AI model to use, e.g., `openai` or `openai:gpt-4o-mini`.                                                |
| `--temperature <value>`       | Temperature for model generation.                                                                       |
| `--top-p <value>`             | Top-p sampling value.                                                                                   |
| `--presence-penalty <value>`  | Presence penalty value.                                                                                 |
| `--frequency-penalty <value>` | Frequency penalty value.                                                                                |
| `--log-level <level>`         | Set logging level: `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE`.                                          |
| `--input`, `-i <input>`       | Specify input directly.                                                                                 |

## Summary

This example illustrates a powerful and common pattern for building complex AI workflows. By creating a router agent, you can effectively manage and delegate tasks to specialized agents, leading to more accurate and efficient applications.

To continue exploring, consider the following related examples:

<x-cards data-columns="2">
  <x-card data-title="Sequential Workflow" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    Learn how to build workflows where agents execute tasks in a specific, ordered sequence.
  </x-card>
  <x-card data-title="Handoff Workflow" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    Create seamless transitions between specialized agents to solve complex problems step-by-step.
  </x-card>
</x-cards>
