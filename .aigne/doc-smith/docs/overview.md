# Overview

The AIGNE Framework is a functional AI application development framework designed to simplify and accelerate the process of building scalable, agentic AI applications. It combines functional programming concepts, robust artificial intelligence capabilities, and a modular design to provide a structured environment for developers.

This document provides a high-level overview of the AIGNE Framework's architecture, core components, and key features. It also serves as a navigational guide, directing you to the appropriate documentation path based on your technical background and objectives.

## Core Architecture

The framework is architecturally designed around a central orchestrator, known as the `AIGNE`, which manages the lifecycle and interactions of various specialized components called `Agents`. Agents are the fundamental units of work, designed to perform specific tasks. They can be composed into teams to handle complex workflows.

```d2
direction: down
style: {
  font-size: 14
}

AIGNE: {
  label: "AIGNE"
  tooltip: "The central execution engine that orchestrates agents and workflows."
  shape: hexagon
  style: {
    fill: "#F0F4EB"
    stroke: "#C2D7A7"
    stroke-width: 2
  }
}

Models: {
  label: "AI Models"
  tooltip: "Interfaces with external language and image models (e.g., OpenAI, Anthropic)."
  shape: cylinder
  style: {
    fill: "#FEF7E8"
    stroke: "#F7D8A3"
    stroke-width: 2
  }
}

Agents: {
  shape: package
  label: "Agents"
  tooltip: "Specialized units of work that perform tasks."
  style: {
    fill: "#EBF5FB"
    stroke: "#AED6F1"
    stroke-width: 2
  }

  AIAgent: {
    label: "AI Agent"
    tooltip: "Interacts with language models."
  }
  TeamAgent: {
    label: "Team Agent"
    tooltip: "Orchestrates multiple agents."
  }
  FunctionAgent: {
    label: "Function Agent"
    tooltip: "Wraps custom code."
  }
  OtherAgents: {
    label: "..."
    tooltip: "Other specialized agents like ImageAgent, MCPAgent, etc."
  }
}

Skills: {
  label: "Skills & Tools"
  tooltip: "Reusable functions or external tools available to agents."
  shape: rectangle
  style: {
    fill: "#F4ECF7"
    stroke: "#D7BDE2"
    stroke-width: 2
  }
}

AIGNE -> Agents: Manages & Invokes
Agents -> Models: Utilizes
Agents -> Skills: Uses
```

-   **AIGNE**: The central execution engine responsible for managing the lifecycle of agents, orchestrating their interactions, and handling the overall execution flow. It is instantiated with a configuration that can include models, agents, and skills.
-   **Agents**: The fundamental building blocks of the framework. An agent is an autonomous unit that performs a specific task. The framework provides several specialized agent types, including `AIAgent` for interacting with language models, `TeamAgent` for coordinating multiple agents, and `FunctionAgent` for executing custom code.
-   **Models**: Abstractions that interface with external AI model providers like OpenAI, Anthropic, and Google. These are used by agents to leverage the power of large language models (LLMs) and image generation models.
-   **Skills**: Reusable capabilities, often represented as functions or other agents, that can be attached to an agent to extend its functionality.

## Key Features

The AIGNE Framework is equipped with a comprehensive set of features to support the development of sophisticated AI applications.

<x-cards data-columns="2">
  <x-card data-title="Modular Design" data-icon="lucide:blocks">
    A clear modular structure allows developers to organize code effectively, improving development efficiency and simplifying maintenance.
  </x-card>
  <x-card data-title="Multiple AI Model Support" data-icon="lucide:bot">
    Built-in support for a wide range of mainstream AI models, including those from OpenAI, Google, and Anthropic, with an extensible design to support additional models.
  </x-card>
  <x-card data-title="Flexible Workflow Patterns" data-icon="lucide:git-merge">
    Natively supports various workflow patterns such as sequential, concurrent, and routing to meet complex application requirements.
  </x-card>
  <x-card data-title="TypeScript Support" data-icon="lucide:file-type">
    Provides comprehensive TypeScript type definitions, ensuring type safety and enhancing the overall developer experience.
  </x-card>
  <x-card data-title="Code Execution" data-icon="lucide:terminal-square">
    Supports the execution of dynamically generated code within a secure sandbox, enabling powerful automation capabilities.
  </x-card>
  <x-card data-title="MCP Protocol Integration" data-icon="lucide:plug-zap">
    Seamlessly integrates with external systems and services through the Model Context Protocol (MCP).
  </x-card>
</x-cards>

## How to Use These Docs

To accommodate different needs, this documentation is divided into two primary paths. Please select the path that best aligns with your role and goals.

<x-cards data-columns="2">
  <x-card data-title="Developer Guide" data-icon="lucide:code" data-href="/developer-guide/getting-started" data-cta="Start Building">
    For engineers and developers. This guide provides technical deep-dives, code-first examples, API references, and everything you need to build, test, and deploy agentic applications with the AIGNE Framework.
  </x-card>
  <x-card data-title="User Guide" data-icon="lucide:user" data-href="/user-guide" data-cta="Learn Concepts">
    For non-technical users, product managers, and business stakeholders. This guide explains the core concepts of AI agents and workflows in plain language, focusing on potential applications and business outcomes without technical jargon.
  </x-card>
</x-cards>

## Summary

This overview has introduced the AIGNE Framework, its core architecture, and its primary features. The framework is a comprehensive toolset for building modern, agent-based AI applications.

For your next step, we recommend the following:
-   **Developers**: Proceed to the [Getting Started](./developer-guide-getting-started.md) guide for a hands-on tutorial.
-   **Non-technical Users**: Begin with [What is AIGNE?](./user-guide-what-is-aigne.md) for a conceptual introduction.