# Core Framework

Welcome to the engine room of the AIGNE platform. The Core Framework provides the fundamental building blocks for creating, managing, and running sophisticated AI agents. It is designed to be a powerful yet flexible foundation for your applications, handling everything from simple chat interactions to complex, multi-agent workflows.

At its heart, the framework consists of three main pillars:

*   **AIGNE Engine**: The central orchestrator that manages the entire lifecycle of an AI task.
*   **Context**: The state manager that keeps track of conversations, memory, and other critical data during an interaction.
*   **Agents**: The specialized actors that perform specific tasks, such as communicating with AI models, executing code, or coordinating other agents.

### How It Works

The following diagram illustrates the high-level architecture of the AIGNE Core Framework. An application interacts with the central AIGNE engine, which uses a Context object to manage state and delegates tasks to one or more Agents.

```d2
direction: down

app: {
  label: "Your Application"
  shape: rectangle
}

aigne-core: {
  label: "AIGNE Core Framework"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 2
  }

  aigne-engine: {
    label: "AIGNE Engine"
  }

  context: {
    label: "Context"
    shape: cylinder
  }

  agents: {
    label: "Agents"
    shape: rectangle
    grid-columns: 3

    ai-agent: { label: "AIAgent" }
    function-agent: { label: "FunctionAgent" }
    team-agent: { label: "TeamAgent" }
  }
}

app -> aigne-core.aigne-engine: "Invoke"
aigne-core.aigne-engine <-> aigne-core.context: "Manages"
aigne-core.aigne-engine -> aigne-core.agents: "Delegates Tasks"
```

### Key Components

The Core Framework is divided into two primary concepts. Click on a card to learn more about each one.

<x-cards data-columns="2">
  <x-card data-title="AIGNE & Context" data-icon="lucide:brain-circuit" data-href="/core/aigne-and-context">
    Learn about the main AIGNE class that orchestrates agents and the Context object that manages state and observability.
  </x-card>
  <x-card data-title="Agents" data-icon="lucide:bot" data-href="/core/agents">
    Explore the different types of agents, which are the fundamental actors for performing tasks like chatting or calling functions.
  </x-card>
</x-cards>

### Summary

The AIGNE Core Framework provides a robust and modular architecture for building powerful AI applications. By understanding these core components, you can effectively design agents that are scalable, maintainable, and capable of handling complex tasks.

To continue, please explore the detailed documentation for each component:

*   **[AIGNE & Context](./core-aigne-and-context.md)**: Understand the central engine and state management.
*   **[Agents](./core-agents.md)**: Discover the different types of workers you can build and use.