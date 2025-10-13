I need to fix the dead links in the generated content. The user has pointed out several broken links related to examples. The initial `afs_list` on `/examples` returned an empty directory, which seems incorrect based on the provided `README.md` content that references multiple examples. I will now list the root directory to get a better understanding of the overall file structure and locate the correct paths for the examples.# Getting Started with AIGNE Framework

Welcome to the AIGNE Framework! This guide is designed for developers to get you from zero to a working application in under 30 minutes. We'll cover the essential steps to get started, core concepts, and provide a working example that you can build upon.

AIGNE \[ ˈei dʒən ] is a functional AI application development framework designed to simplify and accelerate the process of building modern, scalable, and powerful AI-driven solutions. It combines functional programming features with advanced AI capabilities in a modular design.

## Quick Start

Let's dive right in. This section will walk you through setting up your environment, installing the framework, and running your first AIGNE application.

### Environment Requirements

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 20.0 or higher.

### Installation

You can add AIGNE to your project using your preferred package manager:

#### npm

```bash
npm install @aigne/core
```

#### yarn

```bash
yarn add @aigne/core
```

#### pnpm

```bash
pnpm add @aigne/core
```

### Your First AIGNE Application

Here’s a simple example demonstrating a "handoff" workflow where one AI agent transfers control to another.

First, set up your environment variables. For instance, you'll need an OpenAI API key.

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Now, create a TypeScript file (e.g., `index.ts`) and add the following code:

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. Initialize the AI Model
const { OPENAI_API_KEY } = process.env;
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Define a handoff function and AI Agents
function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. If the user asks to talk to agent B, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Agent A can hand off to Agent B
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 3. Initialize the AIGNE execution environment
const aigne = new AIGNE({ model });

async function main() {
  // 4. Invoke the initial agent
  const userAgent = aigne.invoke(agentA);

  // 5. Interact with the agent
  console.log("Invoking Agent A to request a transfer...");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log(result1);
  // Expected Output:
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  console.log("\nSpeaking with Agent B...");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log(result2);
  // Expected Output:
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main();
```

This example illustrates how to create two distinct agents and transfer control between them based on user input, showcasing the framework's flexibility.

## Core Concepts

The AIGNE Framework is built on a few key concepts that work together to create powerful AI workflows.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne.png" alt="AIGNE Architecture Diagram" />
</picture>

*   **AI Agents**: These are the fundamental actors in the framework. An agent can be a specialized AI with specific instructions (like `AgentB` who only speaks in haikus) or a simple function. They are designed to be modular and reusable.

*   **AI Models**: AIGNE supports various AI models (like OpenAI, Gemini, Claude) out of the box. You can easily swap models or extend the framework to include custom ones.

*   **AIGNE**: This is the main execution engine that orchestrates the agents and workflows. It manages the state and communication between different components.

*   **Workflow Patterns**: AIGNE provides several built-in patterns to structure complex interactions between agents, such as running them in sequence, in parallel, or routing tasks based on input.

## Key Features

*   **Modular Design**: A clear modular structure allows you to organize code efficiently and simplify maintenance.
*   **TypeScript Support**: Comprehensive type definitions ensure type safety and a superior developer experience.
*   **Multiple AI Model Support**: Built-in support for OpenAI, Gemini, Claude, Nova, and other mainstream AI models.
*   **Flexible Workflow Patterns**: Easily implement sequential, concurrent, routing, and handoff workflows to meet complex application requirements.
*   **MCP Protocol Integration**: Seamlessly integrate with external systems and services through the Model Context Protocol (MCP).
*   **Code Execution**: Execute dynamically generated code in a secure sandbox for powerful automation.
*   **Blocklet Ecosystem Integration**: Deep integration with ArcBlock's Blocklet ecosystem provides a one-stop solution for development and deployment.

## Next Steps

You've now installed the AIGNE Framework and run your first application. Here’s what you can do next:

*   **Explore More Examples**: Dive into the various workflow patterns and MCP integrations by exploring the example projects in the framework's repository.
*   **Read the Documentation**: For a deeper dive into the APIs and concepts, check out the full [AIGNE Framework Documentation](https://www.arcblock.io/docs/aigne-framework).
*   **Join the Community**: Have questions or want to share your work? Join our [Technical Forum](https://community.arcblock.io/discussions/boards/aigne).