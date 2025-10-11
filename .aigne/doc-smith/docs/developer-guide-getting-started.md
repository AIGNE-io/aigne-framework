# Getting Started

This guide provides the most direct path to installing the `@aigne/core` framework and running your first AI agent. The process is designed to be completed in under 30 minutes, enabling you to quickly begin development and see tangible results.

The following sections will walk you through installing the necessary packages and then building a complete, functional AI agent.

<x-cards data-columns="2">
  <x-card data-title="Installation" data-icon="lucide:download" data-href="/developer-guide/getting-started/installation">
    Begin by adding the @aigne/core package to your project using your preferred package manager (npm, yarn, or pnpm).
  </x-card>
  <x-card data-title="Your First Agent" data-icon="lucide:rocket" data-href="/developer-guide/getting-started/your-first-agent">
    Follow a step-by-step tutorial to create, configure, and run a functional AI agent with a complete code example.
  </x-card>
</x-cards>

## A Complete Example

For a brief overview, the following is a complete, self-contained example of a basic AIGNE implementation. Detailed steps and explanations are provided in the subsequent sections. This example demonstrates the core components working together to process a request.

```typescript A Basic AIGNE Implementation icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Create an AI model instance to connect to a provider like OpenAI.
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 2. Define an AI agent with a name and instructions.
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. Initialize the AIGNE engine, which orchestrates execution.
const aigne = new AIGNE({ model });

// 4. Use the engine to invoke the agent and get a user-facing instance.
const userAgent = await aigne.invoke(agent);

// 5. Send a message to the agent and log the response.
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

### Next Steps

To begin, proceed to the [Installation](./developer-guide-getting-started-installation.md) guide to set up your environment.