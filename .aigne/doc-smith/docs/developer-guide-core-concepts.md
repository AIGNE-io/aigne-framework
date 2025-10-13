This document provides a detailed overview of the `AIGNE` class, the central orchestrator for building complex AI applications.

## AIGNE Class

The `AIGNE` class is the core of the framework, designed to manage and coordinate multiple agents to perform complex tasks. It acts as the central hub for agent interactions, message passing, and the overall execution flow. By orchestrating various specialized agents, `AIGNE` enables the construction of sophisticated, multi-agent AI systems.

### Architecture Overview

The following diagram illustrates the high-level architecture of the AIGNE system, showing the relationships between the main classes like `AIGNE`, `Agent`, and `Context`.

```d2
direction: down

AIGNE: {
  label: "AIGNE Class\n(Orchestrator)"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Context: {
  label: "Context"
  shape: cylinder
}

Agents: {
  label: "Pool of Agents"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-A: {
    label: "Agent A"
  }
  Agent-B: {
    label: "Agent B"
  }
  Agent-N: {
    label: "..."
  }
}

AIGNE -> Context: "Manages"
AIGNE <-> Agents: "Orchestrates & Routes Messages"
Agents -> Context: "Accesses"
```

### Core Concepts

-   **Agent Management**: `AIGNE` is responsible for adding, managing, and orchestrating the lifecycle of all agents within the system.
-   **Context Creation**: It creates isolated execution contexts (`AIGNEContext`) for different tasks or conversations, ensuring that state and resource usage are properly managed.
-   **Message Passing**: It facilitates communication between agents through a built-in message queue, allowing for both direct invocation and a publish-subscribe model.
-   **Global Configuration**: `AIGNE` holds global configurations, such as the default `ChatModel`, `ImageModel`, and a collection of shared `skills` (specialized agents) that can be accessed by any agent in the system.

### Creating an AIGNE Instance

You can create an `AIGNE` instance in two primary ways: programmatically using the constructor or by loading a configuration from the file system.

#### 1. Using the Constructor

The constructor allows you to configure the instance programmatically.

```typescript
import { AIGNE, Agent, ChatModel } from "@aigne/core";

// Define a model and some agents (skills)
const model = new ChatModel(/* ... */);
const skillAgent = new Agent({ /* ... */ });
const mainAgent = new Agent({ /* ... */ });

// Create an AIGNE instance
const aigne = new AIGNE({
  name: "MyAIGNEApp",
  description: "An example AIGNE application.",
  model: model,
  skills: [skillAgent],
  agents: [mainAgent],
});
```

**Constructor Options (`AIGNEOptions`)**

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="The name of the AIGNE instance."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of the instance's purpose."></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="A global default ChatModel for all agents."></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="A global default ImageModel for image-related tasks."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="A list of shared agents (skills) available to all other agents."></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="A list of primary agents to add to the instance upon creation."></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="Usage limits for execution contexts (e.g., timeout, max tokens)."></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="An observer for monitoring and logging instance activities."></x-field>
</x-field-group>

#### 2. Loading from Configuration

The static `AIGNE.load()` method provides a convenient way to initialize an instance from a directory containing an `aigne.yaml` file and other agent definitions. This is ideal for separating configuration from code.

```typescript
import { AIGNE } from "@aigne/core";

// Load the AIGNE instance from a directory path
const aigne = await AIGNE.load("./path/to/config/dir");

// You can also override loaded options
const aigneWithOverrides = await AIGNE.load("./path/to/config/dir", {
  name: "MyOverriddenAppName",
});
```

### Key Methods

#### invoke()

The `invoke()` method is the primary way to interact with an agent. It has several overloads to support different interaction patterns.

**1. Simple Invocation**

This is the most common use case, where you send an input message to an agent and receive a complete response.

**Example**
```typescript
import { AIGNE } from '@aigne/core';
import { GreeterAgent } from './agents/greeter.agent.js';

const aigne = new AIGNE();
const greeter = new GreeterAgent();
aigne.addAgent(greeter);

const { message } = await aigne.invoke(greeter, {
  name: 'John',
});

// Expected output: "Hello, John"
console.log(message);
```

**2. Streaming Invocation**

For long-running tasks or interactive experiences (like a chatbot), you can stream the response as it's being generated.

**Example**
```typescript
import { AIGNE } from '@aigne/core';
import { StreamAgent } from './agents/stream.agent.js';

const aigne = new AIGNE();
const streamAgent = new StreamAgent();
aigne.addAgent(streamAgent);

const stream = await aigne.invoke(
  streamAgent,
  {
    name: 'World',
  },
  { streaming: true }
);

let fullMessage = '';
for await (const chunk of stream) {
  if (chunk.delta.text?.message) {
    fullMessage += chunk.delta.text.message;
    // Process chunk in real-time
    process.stdout.write(chunk.delta.text.message);
  }
}
// Expected output: "Hello, World" (streamed character by character)
```

**3. Creating a UserAgent**

If you need to interact with an agent repeatedly, you can create a `UserAgent`. This provides a consistent interface for the conversation.

**Example**
```typescript
import { AIGNE } from '@aigne/core';
import { CalculatorAgent } from './agents/calculator.agent.js';

const aigne = new AIGNE();
const calculator = new CalculatorAgent();
aigne.addAgent(calculator);

// Create a UserAgent for the calculator
const user = aigne.invoke(calculator);

// Invoke it multiple times
const result1 = await user.invoke({ operation: 'add', a: 5, b: 3 });
console.log(result1.result); // 8

const result2 = await user.invoke({ operation: 'subtract', a: 10, b: 4 });
console.log(result2.result); // 6
```

#### addAgent()

Dynamically adds one or more agents to the `AIGNE` instance after it has been created. Once added, an agent is attached to the instance and can participate in the system.

```typescript
const aigne = new AIGNE();
const agent1 = new MyAgent1();
const agent2 = new MyAgent2();

aigne.addAgent(agent1, agent2);
```

#### publish() / subscribe()

`AIGNE` provides a message queue for decoupled, event-driven communication between agents using a publish-subscribe model.

**Example**
```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

// Subscriber: Listens for messages on a topic
aigne.subscribe('user.updated', ({ message }) => {
  console.log(`Received user update: ${message.userName}`);
});

// Another subscriber using async/await for a single message
async function waitForUpdate() {
  const { message } = await aigne.subscribe('user.updated');
  console.log(`Async handler received: ${message.userName}`);
}
waitForUpdate();

// Publisher: Broadcasts a message to a topic
aigne.publish('user.updated', {
  userName: 'JaneDoe',
  status: 'active',
});
```

#### shutdown()

Gracefully shuts down the `AIGNE` instance, ensuring that all agents and skills clean up their resources properly. This is crucial for preventing resource leaks.

**Example**
```typescript
const aigne = new AIGNE();
// ... add agents and operate

// Shutdown when done
await aigne.shutdown();
```

The `AIGNE` class also supports the `Symbol.asyncDispose` method, allowing you to use it with the `using` statement for automatic cleanup.

```typescript
import { AIGNE } from '@aigne/core';

async function myApp() {
  await using aigne = new AIGNE();
  // ... aigne will be shut down automatically at the end of this block
}
```