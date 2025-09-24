# Core Framework

Welcome to the heart of the AIGNE platform. The Core Framework is the engine that powers every AI application you build. Think of it as the central nervous system that coordinates all activities, manages memory, and directs specialized 'agents' to perform tasks. In this section, we'll explore the fundamental building blocks that make your AI work.

## How It Works

At a high level, the Core Framework consists of a few key parts that work together seamlessly. The AIGNE engine acts as the central orchestrator, the Context provides the necessary memory and state, and the Agents are the workers that carry out the actual tasks.

This diagram shows the basic relationship between these components:

```d2 AIGNE Core Architecture icon=lucide:workflow
direction: down

AIGNE-Engine: {
  label: "AIGNE Engine\n(The Orchestrator)"
  shape: rectangle
  style.fill: "#f0f9ff"
}

Context: {
  label: "Context\n(The Memory)"
  shape: cylinder
  style.fill: "#fefce8"
}

Agents: {
  label: "Agents\n(The Workers)"
  shape: rectangle
  style: {
    stroke-dash: 4
  }

  AIAgent: {
    label: "AI Agent"
  }
  FunctionAgent: {
    label: "Function Agent"
  }
  TeamAgent: {
    label: "Team Agent"
  }
}

AIGNE-Engine <-> Context: "Manages State"
AIGNE-Engine -> Agents: "Delegates Tasks"

```

## Dive Deeper

To understand how these pieces fit together, explore the main components of the Core Framework in the following sections.

<x-cards data-columns="2">
  <x-card data-title="AIGNE & Context" data-icon="lucide:brain-circuit" data-href="/core/aigne-and-context">
    Learn about the central AIGNE engine that orchestrates tasks and the Context object that provides memory and awareness to your agents.
  </x-card>
  <x-card data-title="Agents" data-icon="lucide:bot" data-href="/core/agents">
    Discover the different types of agents—the specialized workers that execute tasks, run functions, or even collaborate as a team.
  </x-card>
</x-cards>

By understanding these core concepts, you'll be well on your way to building sophisticated and powerful AI applications with AIGNE. We recommend starting with [AIGNE & Context](./core-aigne-and-context.md) to learn about the main controller.