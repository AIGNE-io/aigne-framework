# Overview

The AIGNE Framework is a complete toolkit designed to help you build, run, and manage powerful AI agents with ease. Whether you're a developer looking to streamline your workflow or a creator eager to bring an AI idea to life, AIGNE provides the tools you need to get started quickly.

It simplifies the entire process of agent development, from creating a new project to deploying a fully functional application. By handling the complex parts of AI integration, AIGNE lets you focus on what makes your agent unique: its skills and purpose.

## Key Components

The framework is built on three core pillars that work together to provide a seamless development experience.

<x-cards data-columns="3">
  <x-card data-title="Core Framework" data-icon="lucide:box" data-href="/core">
    The foundational engine of your AI agent. It manages state, orchestrates skills, and provides the essential building blocks for agent logic.
  </x-card>
  <x-card data-title="Command Line (CLI)" data-icon="lucide:terminal" data-href="/cli">
    Your command center for development. Use simple commands to create projects, run agents locally, run tests, and deploy your applications.
  </x-card>
  <x-card data-title="AI Models" data-icon="lucide:brain-circuit" data-href="/models">
    The brains of the operation. Easily connect your agent to a wide range of powerful language models from providers like OpenAI, Anthropic, and Google.
  </x-card>
</x-cards>

## How It Works

At a high level, you use the AIGNE Command Line Interface (CLI) to build an agent that runs on the Core Framework. The Core Framework then connects to your chosen AI models to power your agent's intelligence and conversational abilities.

```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  CLI: {
    label: "Command Line (CLI)"
    shape: rectangle
  }

  Core: {
    label: "Core Framework"
    shape: rectangle
  }
}

AI-Models: {
  label: "AI Models"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  OpenAI: { label: "OpenAI" }
  Anthropic: { label: "Anthropic" }
  Google: { label: "Google Gemini" }
  More: { label: "And many more..." }
}

Developer -> AIGNE-Framework.CLI: "Uses to create & manage agent"
AIGNE-Framework.CLI -> AIGNE-Framework.Core: "Builds agent upon"
AIGNE-Framework.Core -> AI-Models: "Connects to for intelligence"
```

## Get Started

Ready to build your first AI agent? Our getting started guide will walk you through installing the CLI and running an agent in just a few minutes.

<x-card data-title="Get Started in 5 Minutes" data-icon="lucide:rocket" data-href="/cli/getting-started" data-cta="Start Building">
  Follow our step-by-step guide to install the AIGNE CLI, create a new project, and have a conversation with your first AI agent.
</x-card>