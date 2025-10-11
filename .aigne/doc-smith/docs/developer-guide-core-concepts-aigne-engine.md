# The AIGNE Engine

The AIGNE Engine is the central nervous system of the framework, responsible for orchestrating agent execution, managing state, and facilitating communication. It is composed of two primary components: the `AIGNE` class and the `Context` object. Together, they provide a robust environment for building and running complex AI applications.

The `AIGNE` class acts as the main entry point and coordinator, while the `Context` object provides an isolated, stateful environment for each specific task or conversation.

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Engine: {
  label: "AIGNE Engine"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE Class\n(Orchestrator)"
    shape: rectangle
  }

  Context: {
    label: "Context Object\n(Isolated Environment)"
    shape: rectangle
  }

  Agent: {
    label: "Agent\n(Task Executor)"
    shape: rectangle
  }
}

User -> AIGNE-Engine.AIGNE-Class: "1. Invokes Agent"
AIGNE-Engine.AIGNE-Class -> AIGNE-Engine.Context: "2. Creates for execution"
AIGNE-Engine.AIGNE-Class -> AIGNE-Engine.Agent: "3. Dispatches task"
AIGNE-Engine.Agent <-> AIGNE-Engine.Context: "4. Executes task within context"
AIGNE-Engine.Agent -> AIGNE-Engine.AIGNE-Class: "5. Returns result"
AIGNE-Engine.AIGNE-Class -> User: "6. Forwards result"
```

## The `AIGNE` Class

The `AIGNE` class is the high-level orchestrator that manages all the components of your AI application. It serves as the central point for loading configurations, managing agents and skills, and initiating agent invocations.

Its primary responsibilities include:
*   **Agent Management**: Adding, storing, and providing access to all registered agents.
*   **Resource Provisioning**: Holding global resources like the default `ChatModel`, `ImageModel`, and a collection of shared `skills` (tools) that can be made available to agents.
*   **Execution Initiation**: Kicking off agent workflows through the `invoke` method, which creates a new execution `Context`.
*   **Configuration**: Loading an entire application setup from a directory using the static `load` method.
*   **Lifecycle Management**: Handling the graceful shutdown of all agents and their resources.

### Basic Usage

Here is a simple example of how to instantiate and use the `AIGNE` class to run an agent.

```typescript AIGNE Engine Example icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. Define a global model
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. Create the main AIGNE instance
const aigne = new AIGNE({ model });

// 3. Define an agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 4. Add the agent to the engine
aigne.addAgent(agent);

// 5. Invoke the agent with an input message
const response = await aigne.invoke(agent, "Hello, how are you?");

console.log(response);
```

### Key Methods and Properties

The `AIGNE` class exposes several methods and properties for managing the application lifecycle.

<x-field-group>
  <x-field data-name="agents" data-type="Agent[]" data-desc="A collection of the primary agents managed by the instance."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-desc="A collection of skill agents (tools) available to the instance."></x-field>
  <x-field data-name="model" data-type="ChatModel" data-desc="The default global chat model used by agents that do not have one specified."></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-desc="The default global image model for image generation tasks."></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-desc="Global usage limits, such as timeouts or max tokens, applied to execution contexts."></x-field>
</x-field-group>

| Method | Description |
| :--- | :--- |
| `static load(path, options)` | Initializes an `AIGNE` instance from a directory containing an `aigne.yaml` file and agent definitions. |
| `addAgent(...agents)` | Adds one or more agents to the instance, making them available for invocation. |
| `invoke(agent, message, options)` | The primary method to execute an agent. It creates a new `Context` and runs the agent's logic. |
| `publish(topic, payload)` | Publishes a message to a topic on the internal message queue, allowing for event-driven agent communication. |
| `subscribe(topic, listener)` | Subscribes to a topic to receive messages. Can be used with a callback listener or to await the next message. |
| `shutdown()` | Gracefully shuts down the instance and all its associated agents and skills, cleaning up resources. |

## The `Context` Object

While the `AIGNE` class is the static orchestrator, the `Context` object is the dynamic environment where work actually happens. A new `AIGNEContext` is created for every top-level `invoke` call, ensuring that each execution run is isolated from others. This is critical for managing concurrent requests and maintaining conversational state without conflicts.

The `Context` object is responsible for:

*   **State Management**: It holds the state for a single execution flow, including usage statistics (`usage`), user-specific data (`userContext`), and memories.
*   **Isolation**: Each context has a unique ID (`id`, `rootId`), preventing interference between different conversations or tasks.
*   **Resource Access**: It provides the executing agent with access to the necessary resources, such as models (`model`, `imageModel`) and `skills`, inherited from the parent `AIGNE` instance.
*   **Message Passing**: The context inherits the message queue, allowing agents within the same execution flow to communicate via `publish` and `subscribe`.
*   **Observability**: Each context is linked to an OpenTelemetry `Span`, enabling detailed tracing and monitoring of agent execution.

You typically do not create a `Context` object directly. The framework handles its creation and management for you when you call `aigne.invoke()`. The `Context` is then passed internally between agents as they execute and collaborate.

### Key Properties

The following properties are available on a `Context` instance and are crucial for understanding the execution environment.

<x-field-group>
    <x-field data-name="id" data-type="string" data-desc="A unique identifier for the current context span."></x-field>
    <x-field data-name="rootId" data-type="string" data-desc="The identifier for the root context in a chain of invocations, equivalent to the trace ID."></x-field>
    <x-field data-name="parentId" data-type="string" data-desc="The ID of the parent context, if this is a child context."></x-field>
    <x-field data-name="usage" data-type="ContextUsage" data-desc="An object tracking resource consumption for the current context, such as token counts and duration."></x-field>
    <x-field data-name="userContext" data-type="object" data-desc="A flexible object for passing user-specific data (e.g., userId, sessionId) through the execution flow."></x-field>
    <x-field data-name="memories" data-type="Memory[]" data-desc="A collection of memories available to the agent during this execution."></x-field>
    <x-field data-name="span" data-type="Span" data-desc="The OpenTelemetry span for tracing and observability."></x-field>
</x-field-group>

## Summary

The AIGNE Engine's dual-component design provides a clear separation of concerns:

-   The **`AIGNE` class** serves as the static, long-lived container for your application's configuration, agents, and shared resources.
-   The **`Context` object** provides a dynamic, short-lived, and isolated environment for each individual execution, ensuring state integrity and enabling robust observability.

This architecture allows you to define your agents and resources once at the application level, while the engine handles the complex task of managing their execution in a scalable and reliable manner.