# Agent Library

The Agent Library provides a collection of pre-built, reusable agents designed to accelerate the development of complex AI applications. By integrating these ready-made components, you can easily orchestrate sophisticated workflows, manage concurrent tasks, and automate multi-step processes without building everything from the ground up.

## Introduction

`@aigne/agent-library` is an official package for the AIGNE Framework that provides powerful, pre-built agent implementations. Built on `@aigne/core`, this library extends the framework's fundamental capabilities to simplify the orchestration of intricate agentic workflows, allowing developers to focus on high-level logic rather than foundational implementation details.

Key features of the library include:

*   **Advanced Agent Patterns**: Offers high-level agent implementations, such as the `OrchestratorAgent`, for managing complex task execution flows.
*   **Concurrent Task Execution**: Supports the parallel execution of multiple tasks, significantly improving processing efficiency for demanding workloads.
*   **Automated Planning**: Capable of automatically generating step-by-step execution plans based on a high-level objective.
*   **Result Synthesis**: Intelligently aggregates and synthesizes results from various tasks and steps to produce a coherent final output.
*   **Full TypeScript Support**: Includes comprehensive type definitions to ensure a robust and type-safe development experience.

## Installation

To get started, install the necessary packages using your preferred package manager. You will need both `@aigne/agent-library` and its core dependency, `@aigne/core`.

```sh Install with npm icon=lucide:terminal
npm install @aigne/agent-library @aigne/core
```

```sh Install with yarn icon=lucide:terminal
yarn add @aigne/agent-library @aigne/core
```

```sh Install with pnpm icon=lucide:terminal
pnpm add @aigne/agent-library @aigne/core
```

## Available Agents

The library includes specialized agents designed for advanced use cases. Each agent is documented in its own section for detailed guidance.

The following diagram illustrates the high-level architecture of the `OrchestratorAgent`:

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Agent Library](assets/diagram/agent-library-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

<x-cards data-columns="2">
  <x-card data-title="Orchestrator Agent" data-href="/agent-library/orchestrator" data-icon="lucide:workflow">
    An advanced agent that autonomously plans, executes, and synthesizes results for complex objectives. It uses a Planner → Worker → Completer architecture to coordinate multi-step workflows.
  </x-card>
</x-cards>

## Summary

The Agent Library is a vital toolkit for any developer looking to build sophisticated, multi-agent systems with the AIGNE Framework. It provides the foundational components for automating complex processes and orchestrating workflows efficiently. To dive deeper into the primary component of this library, proceed to the [Orchestrator](./agent-library-orchestrator.md) documentation.