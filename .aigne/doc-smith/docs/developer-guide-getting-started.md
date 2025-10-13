# Getting Started

This guide provides everything you need to get the AIGNE Framework installed and running in just a few minutes. By the end, you will have built and run your first AI-powered agent.

## What is AIGNE Framework?

AIGNE Framework \[ˈei dʒən] is a functional AI application development framework designed to simplify and accelerate the process of building modern, AI-powered applications. It combines functional programming, powerful AI capabilities, and a modular design to help you create scalable and maintainable solutions.

**Key Features:**

*   **Modular Design**: A clear structure that improves development efficiency and simplifies maintenance.
*   **TypeScript Support**: Comprehensive type definitions for a better and safer development experience.
*   **Multiple AI Model Support**: Built-in support for major AI models like OpenAI, Gemini, and Claude, with easy extensibility.
*   **Flexible Workflow Patterns**: Simplifies complex operations with patterns for sequential, concurrent, routing, and handoff workflows.
*   **MCP Protocol Integration**: Seamlessly integrates with external systems through the Model Context Protocol.

## 1. Prerequisites

Before you begin, ensure you have Node.js installed on your system.

*   **Node.js**: Version 20.0 or higher.

You can verify your Node.js version by running the following command in your terminal:

```bash
node -v
```

## 2. Installation

You can install the core AIGNE package using your preferred package manager.

### Using npm

```bash
npm install @aigne/core
```

### Using yarn

```bash
yarn add @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/core
```

## 3. Your First AIGNE Application

Let's create a simple "Hello, World!" style application with a helpful assistant agent.

#### Step 1: Set Up Your Project File

Create a new file named `index.ts`.

#### Step 2: Add the Code

This example demonstrates the three core components of the AIGNE Framework: the **Model**, the **Agent**, and the **AIGNE Engine**.

*   **Model**: An instance of an AI model (e.g., `OpenAIChatModel`) that will power your agent.
*   **Agent**: A definition of your AI's personality and instructions (e.g., `AIAgent`).
*   **AIGNE Engine**: The main executor that runs the agent and handles communication.

Copy and paste the following code into your `index.ts` file:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

async function main() {
  // 1. Create an AI model instance
  // This connects to the AI provider (e.g., OpenAI).
  // Ensure you have your API key set as an environment variable.
  const model = new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
  });

  // 2. Create an AI agent
  // This defines the agent's identity and purpose.
  const agent = AIAgent.from({
    name: "Assistant",
    instructions: "You are a helpful assistant.",
  });

  // 3. Initialize the AIGNE engine
  // This is the main execution engine that brings everything together.
  const aigne = new AIGNE({ model });

  // 4. Start an interactive session with the agent
  const userAgent = aigne.invoke(agent);

  // 5. Send a message to the agent and get a response
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article?",
  );

  console.log(response);
}

main();
```

#### Step 3: Set Your API Key

Before running the script, you need to provide your OpenAI API key. You can do this by setting an environment variable in your terminal.

```bash
export OPENAI_API_KEY="your-api-key-here"
```

#### Step 4: Run the Application

Execute the file using a TypeScript runner like `ts-node`.

```bash
npx ts-node index.ts
```

You should see a helpful response from your assistant agent printed in the console!

## How It Works: A Quick Overview

The AIGNE Framework is designed to be modular and extensible. The `AIGNE` engine orchestrates interactions between the user, agents, and AI models.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Architecture Diagram" />
</picture>

## Next Steps

You've successfully built and run your first AIGNE application. Now you're ready to explore more advanced features.

*   **Dive into Core Concepts**: Get a deeper understanding of the [AIGNE Engine, Agents, and Models](./developer-guide-core-concepts.md).
*   **Explore Agent Types**: Learn about the different kinds of specialized agents you can build in the [Agent Types](./developer-guide-agents.md) section.
*   **Simplify Workflows**: Discover how to orchestrate complex, multi-agent tasks by reviewing patterns like [Sequential and Parallel](./developer-guide-agents-team-agent.md) execution.
*   **Browse the Full Documentation**: For in-depth guides and API references, visit the complete [AIGNE Framework Documentation](https://www.arcblock.io/docs/aigne-framework).