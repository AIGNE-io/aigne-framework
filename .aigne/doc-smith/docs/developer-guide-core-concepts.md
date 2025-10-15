# Core Concepts

To effectively build applications with the AIGNE Framework, it is essential to first understand its fundamental architectural components. This section provides a high-level overview of the primary building blocks and their interactions. A clear grasp of these concepts will facilitate a more intuitive development process.

The framework is designed around a few key abstractions that work together to orchestrate complex AI-driven workflows. The main components are the AIGNE orchestrator, the Agent as the basic unit of work, Models for interfacing with AI services, and Memory for state persistence.

The following diagram illustrates the relationship between these core components.

```d2
direction: down

AIGNE-Orchestrator: {
  label: "AIGNE Orchestrator"
  shape: rectangle

  Agent: {
    label: "Agent\n(Unit of Work)"
    shape: rectangle
  }

  Models: {
    label: "Models\n(AI Service Interface)"
    shape: rectangle
  }

  Memory: {
    label: "Memory\n(State Persistence)"
    shape: rectangle
  }
}

AI-Services: {
  label: "External AI Services"
  shape: cylinder
}

State-Store: {
  label: "State Store"
  shape: cylinder
}

AIGNE-Orchestrator.Agent <-> AIGNE-Orchestrator.Models: "Uses"
AIGNE-Orchestrator.Agent <-> AIGNE-Orchestrator.Memory: "Uses"
AIGNE-Orchestrator.Models -> AI-Services: "API Calls"
AIGNE-Orchestrator.Memory -> State-Store: "Read/Write State"
```

## Architectural Building Blocks

The AIGNE Framework is composed of four primary concepts. Understanding each one is crucial for building robust and scalable agent-based applications.

<x-cards data-columns="2">
  <x-card data-title="AIGNE" data-icon="lucide:box" data-href="/developer-guide/core-concepts/aigne-engine">
    The central orchestrator responsible for managing the lifecycle of agents, coordinating their interactions, and handling the overall execution flow.
  </x-card>
  <x-card data-title="Agents" data-icon="lucide:bot" data-href="/developer-guide/core-concepts/agents">
    The fundamental unit of work. An Agent is an abstraction that encapsulates a specific capability, from running a simple function to complex reasoning.
  </x-card>
  <x-card data-title="Models" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/models">
    Specialized agents that provide a standardized interface to external services, such as Large Language Models (LLMs) or image generation APIs.
  </x-card>
  <x-card data-title="Memory" data-icon="lucide:database" data-href="/developer-guide/core-concepts/memory">
    Provides agents with the ability to persist and recall information, enabling stateful conversations and context-aware behavior over time.
  </x-card>
</x-cards>

## Summary

This section has introduced the four foundational pillars of the AIGNE Framework: the `AIGNE` orchestrator, the `Agent`, `Models`, and `Memory`. Each component plays a distinct and vital role in the architecture.

For a more comprehensive understanding, it is recommended to proceed to the detailed documentation for each concept.

*   **Next:** Dive deeper into the [AIGNE orchestrator](./developer-guide-core-concepts-aigne-engine.md).