This document provides a detailed guide to the `AIGNE` class, the core orchestrator in the AIGNE Framework. You will learn how to create, configure, and use `AIGNE` instances to manage agents, handle message passing, and build complex AI-driven applications.

### Introduction

The `AIGNE` class is the central component of the framework, designed to orchestrate multiple agents and their interactions. It acts as the main execution engine, managing the lifecycle of agents, facilitating communication through a message queue, and providing a unified entry point for invoking agentic workflows.

Key responsibilities of the `AIGNE` class include:
-   **Agent Management**: Loading, adding, and managing the agents that form an application.
-   **Execution Context**: Creating isolated contexts for each workflow to manage state and enforce limits.
-   **Invocation**: Providing a flexible `invoke` method to interact with agents, supporting both standard and streaming responses.
-   **Message Passing**: Offering a publish-subscribe system for decoupled communication between agents.
-   **Resource Management**: Ensuring graceful shutdown of agents and associated resources.

### Architecture Overview

The `AIGNE` class sits at the heart of the framework, coordinating various components to execute complex tasks. The following diagram illustrates its central role in the architecture.

```d2
direction: down

User-Application: {
  label: "User Application"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AIGNE: {
    label: "AIGNE Class\n(Core Orchestrator)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Managed-Components: {
    grid-columns: 2

    Agents: {
      label: "Managed Agents"
      shape: rectangle
      Agent-A: "Agent A"
      Agent-B: "Agent B"
      Agent-C: "..."
    }

    Message-Queue: {
      label: "Message Queue\n(Pub/Sub)"
      shape: queue
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE: "invoke()"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Agents: "Agent Management"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Message-Queue: "Message Passing"
AIGNE-Framework.AIGNE -> AIGNE-Framework.AIGNE: "Creates Execution Context"
AIGNE-Framework.Managed-Components.Agents.Agent-A <-> AIGNE-Framework.Managed-Components.Message-Queue: "Communicate"

```

### Creating an Instance

You can create an `AIGNE` instance in two main ways: directly using its constructor or by loading a configuration from the file system.

#### 1. Using the Constructor

The most direct way is to instantiate the class with an `AIGNEOptions` object. This allows you to programmatically define all aspects of the engine, such as the global model, agents, and skills.

**Parameters (`AIGNEOptions`)**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of the AIGNE instance. |
| `description` | `string` | A description of the instance's purpose. |
| `model` | `ChatModel` | A global model to be used by all agents that don't have a specific model assigned. |
| `imageModel` | `ImageModel` | An optional global image model for image-related tasks. |
| `skills` | `Agent[]` | A list of skill agents available to the instance. |
| `agents` | `Agent[]` | A list of primary agents to be managed by the instance. |
| `limits` | `ContextLimits` | Usage limits for execution contexts, such as timeouts or max tokens. |
| `observer` | `AIGNEObserver` | An observer for monitoring and logging. |

**Example**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Create a model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. Define an agent
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. Create an AIGNE instance
const aigne = new AIGNE({
  model: model,
  agents: [assistantAgent],
  name: "MyFirstAIGNE",
});
```

#### 2. Loading from Configuration

For more complex applications, you can define your AIGNE setup in YAML files and load it using the static `AIGNE.load()` method. This approach separates configuration from code, making your application more modular.

```typescript
import { AIGNE } from '@aigne/core';

// Assumes you have an `aigne.yaml` in the './my-aigne-app' directory
async function loadAigne() {
  const aigne = await AIGNE.load('./my-aigne-app');
  console.log(`AIGNE instance "${aigne.name}" loaded successfully.`);
  return aigne;
}
```

### Core Methods

The `AIGNE` class provides a powerful set of methods for managing and interacting with agents.

#### `invoke()`

The `invoke` method is the primary way to interact with an agent. It supports multiple patterns, including creating a persistent user session, sending a single message, and streaming responses.

**1. Creating a User Agent**

Invoking an agent without a message creates a `UserAgent`, which maintains a consistent interaction context.

```typescript
// Creates a user agent for continuous interaction with 'assistantAgent'
const userAgent = aigne.invoke(assistantAgent);

// Now you can send multiple messages through the userAgent
const response1 = await userAgent.invoke("Hello, what's your name?");
const response2 = await userAgent.invoke("Can you help me with a task?");
```

**2. Sending a Single Message (Request-Response)**

For simple, one-off interactions, you can pass the agent and the message directly.

```typescript
const response = await aigne.invoke(
  assistantAgent,
  "Write a short poem about AI.",
);
console.log(response);
```

**3. Streaming Responses**

To receive the response as a stream of chunks, set the `streaming` option to `true`. This is ideal for real-time applications like chatbots.

```typescript
const stream = await aigne.invoke(
  assistantAgent,
  "Tell me a long story.",
  { streaming: true }
);

for await (const chunk of stream) {
  // Process each piece of the story as it arrives
  process.stdout.write(chunk.delta.text?.content || "");
}
```

#### `addAgent()`

You can dynamically add agents to an `AIGNE` instance after it has been created. The agent will be attached to the instance's lifecycle and communication system.

```typescript
const newAgent = AIAgent.from({ name: "NewAgent", instructions: "..." });
aigne.addAgent(newAgent);
```

#### `publish()` & `subscribe()`

The framework includes a message queue for decoupled communication between agents. Agents can publish messages to topics, and other agents can subscribe to those topics to receive them.

**Publishing a Message**

```typescript
// Publish a message to the 'news_updates' topic
aigne.publish("news_updates", {
  headline: "AIGNE Framework v2.0 Released",
  content: "New features include...",
});
```

**Subscribing to a Topic**

You can subscribe to a topic to receive a single message or set up a persistent listener.

```typescript
// 1. Await the next message on a topic
const nextMessage = await aigne.subscribe('user_actions');
console.log('Received action:', nextMessage);

// 2. Set up a listener for all messages on a topic
const unsubscribe = aigne.subscribe('system_events', (payload) => {
  console.log(`System Event: ${payload.message.type}`);
});

// Later, to stop listening:
unsubscribe();
```

#### `shutdown()`

To ensure a clean exit, the `shutdown` method gracefully terminates all agents and skills, cleaning up any resources they hold.

```typescript
await aigne.shutdown();
console.log("AIGNE instance has been shut down.");
```

This can also be managed automatically using the `Symbol.asyncDispose` feature in modern JavaScript/TypeScript.

```typescript
async function run() {
  await using aigne = new AIGNE({ ... });
  // ... use the aigne instance ...
} // aigne.shutdown() is called automatically here
```