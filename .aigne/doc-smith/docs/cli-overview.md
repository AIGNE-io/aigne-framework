# Overview

Welcome to the AIGNE Command Line Interface (CLI)! Think of it as your personal command center for building, testing, and managing AI agents with the AIGNE Framework.

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

The `@aigne/cli` is the official command-line tool designed to make your entire agent development process smooth and straightforward, from creating your first project to deploying it for others to use. It simplifies development, testing, and deployment, so you can focus on building great agents.

## What Can You Do with It?

The CLI provides a set of simple yet powerful commands to manage the entire lifecycle of your AI agent. Here's a quick tour of its main features:

<x-cards data-columns="2">
  <x-card data-title="Create Projects" data-icon="lucide:folder-plus">
    Quickly start new AIGNE projects with all the necessary files and configurations set up for you automatically.
  </x-card>
  <x-card data-title="Run Agents" data-icon="lucide:play-circle">
    Easily start an interactive chat session with your AI agents to test them out and see how they respond.
  </x-card>
  <x-card data-title="Run Tests" data-icon="lucide:shield-check">
    Run automated checks to ensure your agent's skills and configurations are working correctly before you deploy.
  </x-card>
  <x-card data-title="Serve Agents" data-icon="lucide:server">
    Turn your agent into a service that other applications can connect to and interact with through an API.
  </x-card>
  <x-card data-title="Observe & Debug" data-icon="lucide:area-chart">
    Launch a local web dashboard to visually monitor your agent's activities, making it easier to understand and debug.
  </x-card>
  <x-card data-title="Deploy Applications" data-icon="lucide:rocket">
    Package and publish your agent application to a specified endpoint, making it available for production use.
  </x-card>
</x-cards>

## A Quick Look

The CLI provides a beautiful and interactive experience right in your terminal, guiding you through every step.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI Interface" />
</picture>

## Main Commands

Here are the most common commands you'll be using:

| Command         | Description                                                |
| :-------------- | :--------------------------------------------------------- |
| `aigne create`  | Creates a new AIGNE project from a template.               |
| `aigne run`     | Starts an interactive chat session with your agent.        |
| `aigne test`    | Runs automated tests to validate your agent.               |
| `aigne serve-mcp` | Makes your agent available as a service for other apps.    |
| `aigne observe` | Starts a local web server to monitor and debug your agent. |

## Next Steps

This was just a quick look at what the AIGNE CLI can do. Ready to get your hands dirty? Let's move on to the [Getting Started](./cli-getting-started.md) guide to install the CLI and create your very first agent.