# Overview

`@aigne/core` is the foundational component of the AIGNE Framework, providing the essential modules and tools needed to build AI-driven applications. This package implements the core functionalities of the framework, including agent systems, the AIGNE environment, model integrations, and support for various workflow patterns. It serves as the functional core for creating sophisticated agentic AI.

The framework is designed to be modular and extensible, allowing developers to build complex AI-powered workflows by combining different types of agents and models.

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AIGNE-Engine: {
    label: "AIGNE Engine"
    shape: rectangle
  }

  Context: {
    label: "Context"
    shape: rectangle
    MessageQueue: {
      shape: queue
    }
  }

  Agents: {
    label: "Agents"
    shape: rectangle
    grid-columns: 2

    UserAgent: { label: "UserAgent" }
    AIAgent: { label: "AIAgent" }
    TeamAgent: { label: "TeamAgent" }
    ImageAgent: { label: "ImageAgent" }
    FunctionAgent: { label: "FunctionAgent" }
    MCPAgent: { label: "MCPAgent" }
  }

  Models: {
    label: "Models"
    shape: rectangle
    grid-columns: 2

    ChatModel: { label: "ChatModel" }
    ImageModel: { label: "ImageModel" }
  }

  Skills: {
    shape: rectangle
  }

  PromptBuilder: {
    shape: rectangle
  }
}

User -> AIGNE-Framework.Agents.UserAgent: "Interacts via"
AIGNE-Framework.Agents.UserAgent -> AIGNE-Framework.AIGNE-Engine: "Invokes"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Agents: "Orchestrates"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Skills: "Manages"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Context: "Uses"

AIGNE-Framework.Agents <-> AIGNE-Framework.Context.MessageQueue: "Communicate via"
AIGNE-Framework.Agents.AIAgent -> AIGNE-Framework.PromptBuilder: "Uses"
AIGNE-Framework.Agents.AIAgent -> AIGNE-Framework.Models.ChatModel: "Interacts with"
AIGNE-Framework.Agents.ImageAgent -> AIGNE-Framework.Models.ImageModel: "Interacts with"
AIGNE-Framework.Agents.TeamAgent -> AIGNE-Framework.Agents: "Manages"
```

## Key Features

The AIGNE Core framework is built with a comprehensive set of features to support robust AI application development.

*   **Multiple AI Model Support**: Provides built-in support for major AI models including OpenAI, Gemini, Claude, and Nova, with an extensible architecture to integrate additional models.
*   **Powerful Agent System**: Offers powerful abstractions for different types of agents, such as AI agents, function agents, and team agents, enabling specialized task handling.
*   **Flexible AIGNE Environment**: Manages communication between agents and orchestrates the execution of complex workflows with precision.
*   **Advanced Workflow Patterns**: Supports a variety of workflow patterns like sequential, concurrent, routing, and handoff, allowing for the creation of sophisticated process automation.
*   **MCP Protocol Integration**: Enables seamless integration with external systems through the Model Context Protocol (MCP).
*   **Full TypeScript Support**: Includes comprehensive type definitions to ensure a superior development experience with type safety and autocompletion.

## Getting Started

To begin using `@aigne/core`, you first need to install the package into your project.

### Installation

You can install the package using your preferred package manager.

```bash Using npm
npm install @aigne/core
```

```bash Using yarn
yarn add @aigne/core
```

```bash Using pnpm
pnpm add @aigne/core
```

### Basic Usage

Here is a simple example of how to create and run a basic AI agent using the AIGNE framework.

```typescript Basic Agent Example icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Create an AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 2. Create an AI agent with instructions
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. Initialize the AIGNE engine with the model
const aigne = new AIGNE({ model });

// 4. Use the engine to invoke the agent, creating a user-facing instance
const userAgent = await aigne.invoke(agent);

// 5. Send a message to the agent and receive a response
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);

console.log(response);
```

## Next Steps

This documentation is structured to cater to different audiences. Please select the path that best fits your role and objectives.

<x-cards data-columns="2">
  <x-card data-title="User Guide" data-icon="lucide:user" data-href="/user-guide">
    A conceptual guide for non-technical users. Learn the core ideas behind AIGNE, agents, and AI workflows in plain language.
  </x-card>
  <x-card data-title="Developer Guide" data-icon="lucide:code" data-href="/developer-guide">
    The complete technical guide for developers. Find installation steps, tutorials, and everything needed to build with AIGNE Core.
  </x-card>
</x-cards>