# Your First Agent

This guide provides a complete, step-by-step tutorial for creating and running your first AI agent using the AIGNE framework. By the end of this section, you will have a functional agent that can respond to your inputs.

## Prerequisites

Before proceeding, ensure you have completed the following:

1.  **Installation**: The `@aigne/core` package must be installed in your project. If you have not done this, please refer to the [Installation guide](./developer-guide-getting-started-installation.md).
2.  **OpenAI API Key**: You will need an API key from OpenAI. This key should be set as an environment variable named `OPENAI_API_KEY`.

## Step-by-Step Guide

We will now build a basic "Assistant" agent.

### Step 1: Set Up Your File

Create a new TypeScript file (e.g., `index.ts`) and begin by importing the necessary classes from `@aigne/core`.

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
```

### Step 2: Configure the AI Model

Instantiate the chat model you wish to use. In this example, we will use OpenAI's `gpt-4-turbo`. The model requires your API key for authentication.

```typescript
// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});
```

### Step 3: Create an AI Agent

Define your agent using `AIAgent.from()`. At a minimum, an agent needs a `name` and `instructions` to define its purpose and behavior.

```typescript
// Create AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});
```

### Step 4: Initialize the AIGNE Engine

The `AIGNE` class is the main execution engine that orchestrates agents and models. Create an instance of the engine and provide the model as a global default for all agents.

```typescript
// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model });
```

### Step 5: Invoke the Agent

To interact with the agent, you first create a user-facing instance of it using `aigne.invoke()`. This prepares the agent for conversation.

```typescript
// Use the AIGNE to invoke the agent
const userAgent = await aigne.invoke(agent);
```

### Step 6: Send a Message

Finally, send a message to the agent using `userAgent.invoke()` and print the response to the console.

```typescript
// Send a message to the agent
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

## Complete Code Example

Here is the complete code, ready to copy and paste into your file.

```typescript Your First Agent icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Step 1: Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// Step 2: Create AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// Step 3: Initialize the AIGNE engine
const aigne = new AIGNE({ model });

async function main() {
  // Step 4: Invoke the agent to get a user-facing instance
  const userAgent = await aigne.invoke(agent);

  // Step 5: Send a message to the agent and get a response
  const response = await userAgent.invoke(
    "Hello, can you help me write a short article about the AIGNE framework?",
  );
  
  console.log(response);
}

main();
```

## Running the Code

To run the example, execute the script from your terminal. Make sure to set the `OPENAI_API_KEY` environment variable first.

```bash
OPENAI_API_KEY="your-api-key-here" ts-node index.ts
```

You should see a response from the AI assistant printed in your console.

## Summary

You have successfully created, configured, and run a basic AI agent. This example demonstrates the fundamental workflow of the AIGNE framework: defining a model, creating an agent with specific instructions, and using the AIGNE engine to facilitate communication.

To gain a deeper understanding of the concepts introduced here, proceed to the [Core Concepts](./developer-guide-core-concepts.md) section.