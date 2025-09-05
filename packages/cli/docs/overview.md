---
labels: ["Reference"]
---

# Overview

The `@aigne/cli` is the official command-line tool for the AIGNE Framework, designed as your command center for agent development. It provides a comprehensive suite of commands to streamline the entire lifecycle of creating, testing, running, and deploying AI agents, enabling you to focus on building intelligent applications.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI in action" />
</picture>

## Why @aigne/cli?

Developing AI agents involves more than just writing code. You need to manage project structure, handle dependencies, run local tests, serve agents for integration, and deploy them to production. `@aigne/cli` provides a standardized and efficient workflow for these tasks, abstracting away boilerplate and letting you concentrate on agent logic and behavior.

## Key Features

<x-cards data-columns="3">
  <x-card data-title="Project Scaffolding" data-icon="lucide:folder-plus">
    Quickly create new AIGNE projects with predefined file structures and configurations using the `aigne create` command.
  </x-card>
  <x-card data-title="Local Agent Execution" data-icon="lucide:play-circle">
    Easily run and interact with your agents in a local chat loop for rapid testing and debugging via the `aigne run` command.
  </x-card>
  <x-card data-title="Integrated Testing" data-icon="lucide:beaker">
    Run unit and integration tests for your agents and skills with the built-in `aigne test` command to ensure code quality.
  </x-card>
  <x-card data-title="MCP Server" data-icon="lucide:server">
    Launch agents as a Model Context Protocol (MCP) server, allowing them to be integrated with external systems and UIs.
  </x-card>
  <x-card data-title="Development Observability" data-icon="lucide:area-chart">
    Start a local server with `aigne observe` to view, inspect, and analyze agent execution traces and data flows.
  </x-card>
  <x-card data-title="Multi-Model Support" data-icon="lucide:boxes">
    Connect to and utilize a variety of model providers, including OpenAI, Claude, XAI, and others, for maximum flexibility.
  </x-card>
</x-cards>

## How It Fits in Your Workflow

`@aigne/cli` acts as the primary interface between you and the AIGNE framework, orchestrating the various components of your agent application.

```d2
direction: down

Developer: {
  shape: person
}

CLI: {
  label: "@aigne/cli"
  shape: package
  grid-columns: 3

  create: "aigne create"
  run: "aigne run"
  test: "aigne test"
  serve-mcp: "aigne serve-mcp"
  observe: "aigne observe"
}

AIGNE-Project: {
  label: "AIGNE Project"
  shape: rectangle
  grid-columns: 2

  config: {
    label: "aigne.yaml"
    shape: document
  }
  code: {
    label: "Agents & Skills"
    shape: document
  }
}

External-Systems: {
  label: "External Systems"
  shape: package
  grid-columns: 2
  
  LLM-Providers: {
    label: "LLM Providers\n(OpenAI, Claude, etc.)"
    shape: cylinder
  }
  
  MCP-Clients: {
    label: "MCP Clients\n(External UIs)"
    shape: rectangle
  }
}

Observability-UI: {
  label: "Observability UI"
  shape: rectangle
}

Developer -> CLI: "Executes Commands"

CLI.create -> AIGNE-Project: "Scaffolds"
CLI.run -> AIGNE-Project: "Executes"
CLI.test -> AIGNE-Project: "Tests"
CLI.serve-mcp -> AIGNE-Project: "Serves"
CLI.observe -> Observability-UI: "Starts"

AIGNE-Project -> LLM-Providers: "Interacts via API"
AIGNE-Project <-> MCP-Clients: "Connects via MCP"
AIGNE-Project -> Observability-UI: "Sends Traces"
```

This workflow allows for a structured development process where the CLI handles the operational tasks, the project contains your unique logic, and external systems provide the necessary AI capabilities and user interfaces.

## Next Steps

Ready to build your first agent? Head over to the [Getting Started](./getting-started.md) guide to install the CLI and create your first AIGNE project.