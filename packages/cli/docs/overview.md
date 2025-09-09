---
labels: ["Reference"]
---

# Overview

<p align="center">
  <picture>
    <source srcset="../logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="../logo.svg" media="(prefers-color-scheme: light)">
    <img src="../logo.svg" alt="AIGNE Logo" width="400" />
  </picture>

  <center>Your command center for agent development</center>
</p>

`@aigne/cli` is the official command-line tool for the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), designed to streamline the entire lifecycle of agent development. It provides a comprehensive suite of commands to simplify project creation, local execution, testing, and deployment, enabling you to build, run, and manage AIGNE applications with ease.

## Key Features

`@aigne/cli` is packed with features to accelerate your agent development workflow.

<x-cards data-columns="3">
  <x-card data-title="Project Scaffolding" data-icon="lucide:folder-plus">
    Quickly create new AIGNE projects with predefined file structures and configurations using the `aigne create` command.
  </x-card>
  <x-card data-title="Local Agent Execution" data-icon="lucide:play-circle">
    Easily run and interact with your agents in a local chat loop for rapid testing and debugging via `aigne run`.
  </x-card>
  <x-card data-title="Automated Testing" data-icon="lucide:beaker">
    Leverage the built-in `aigne test` command for running unit and integration tests to ensure your agents are robust and reliable.
  </x-card>
  <x-card data-title="MCP Server Integration" data-icon="lucide:server">
    Launch your agents as Model Context Protocol (MCP) servers, allowing them to be integrated with external systems.
  </x-card>
  <x-card data-title="Rich Observability" data-icon="lucide:bar-chart-3">
    Start a local server with `aigne observe` to view and analyze agent execution traces and performance data.
  </x-card>
  <x-card data-title="Multi-Model Support" data-icon="lucide:bot">
    Seamlessly switch between different AI model providers, including OpenAI, Claude, XAI, and others.
  </x-card>
</x-cards>

## Core Commands at a Glance

The CLI provides a set of intuitive commands to manage your AIGNE projects. Here are the main commands you'll be using:

```bash Basic Commands icon=lucide:terminal
# Create a new AIGNE project
aigne create [path]

# Run an agent locally
aigne run --path <agent-path>

# Run automated tests for your agents
aigne test --path <agent-path>

# Serve agents as an MCP server
aigne serve-mcp --path <agent-path>

# Start the observability and monitoring server
aigne observe
```

This toolset forms the foundation of the AIGNE development experience, providing everything you need from inception to production.

---

Ready to get started? Follow our [Getting Started](./getting-started.md) guide to install the CLI and create your first AIGNE agent.