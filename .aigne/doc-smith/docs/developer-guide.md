# Developer Guide

This guide provides comprehensive technical documentation for developers working with the `@aigne/core` framework. It covers everything from initial setup to advanced concepts, enabling you to build, integrate, and extend powerful AI-driven applications.

The `@aigne/core` package is the foundational component of the AIGNE Framework. It supplies the essential modules and tools required to build sophisticated AI-driven applications, including a powerful agent system, the AIGNE execution environment, seamless model integrations, and support for complex workflow patterns.

### Architecture Overview

The framework is designed around a central AIGNE Engine that orchestrates agent execution. Agents interact with various AI Models and utilize Memory for state persistence. This modular architecture is built with TypeScript, providing comprehensive type definitions for a superior development experience.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-framework.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-framework.png" alt="AIGNE Framework Architecture Diagram" />
</picture>

### Core Features

<x-cards data-columns="2">
  <x-card data-title="Multiple AI Model Support" data-icon="lucide:puzzle">
    Built-in support for OpenAI, Gemini, Claude, and other mainstream AI models, with an extensible architecture to support additional models.
  </x-card>
  <x-card data-title="Advanced Agent System" data-icon="lucide:bot">
    Powerful abstractions supporting various agent types, including AI agents, function agents, and multi-agent teams.
  </x-card>
  <x-card data-title="AIGNE Environment" data-icon="lucide:box">
    A flexible engine that handles communication between agents and orchestrates the execution of complex workflows.
  </x-card>
  <x-card data-title="Versatile Workflow Patterns" data-icon="lucide:git-merge">
    Native support for sequential, concurrent, routing, and other essential workflow patterns to model complex processes.
  </x-card>
</x-cards>

### How to Use This Guide

This guide is organized into several key sections to help you find the information you need efficiently. We recommend following the path below, especially if you are new to the AIGNE Framework.

<x-cards data-columns="2">
  <x-card data-title="Getting Started" data-href="/developer-guide/getting-started" data-icon="lucide:rocket">
    Install the framework and build your first AI agent in under 30 minutes.
  </x-card>
  <x-card data-title="Core Concepts" data-href="/developer-guide/core-concepts" data-icon="lucide:brain-circuit">
    Understand the fundamental building blocks of AIGNE, including the Engine, Agents, Models, and Memory.
  </x-card>
  <x-card data-title="Agent Types & Examples" data-href="/developer-guide/agent-types-and-examples" data-icon="lucide:lightbulb">
    Explore practical examples for the different types of specialized agents available in the framework.
  </x-card>
  <x-card data-title="API Reference" data-href="/api-reference" data-icon="lucide:book-open">
    A detailed reference of all public classes, functions, and types exported by the @aigne/core package.
  </x-card>
</x-cards>