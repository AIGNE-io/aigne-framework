# Command Line Interface (CLI)

The AIGNE Command Line Interface (CLI) is your command center for creating, running, and managing AI agents. As the official command-line tool for the AIGNE Framework, `@aigne/cli` is designed to simplify the entire development lifecycle, from initial setup to deployment.

Whether you're creating a new project, testing your agent's skills, or making it available as a service, the CLI provides a set of intuitive commands to streamline the process.

![AIGNE CLI](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png)

## Key Features

The AIGNE CLI is packed with features to make agent development faster and more efficient.

<x-cards data-columns="3">
  <x-card data-title="Project Creation" data-icon="lucide:folder-plus">
    Quickly scaffold new AIGNE projects with predefined file structures and configurations, so you can start building right away.
  </x-card>
  <x-card data-title="Agent Runner" data-icon="lucide:play-circle">
    Easily run and interact with your AIGNE agents in a local chat environment to test their responses and behavior.
  </x-card>
  <x-card data-title="Testing Support" data-icon="lucide:beaker">
    Use the built-in test command to run unit and integration tests, ensuring your agent's skills work as expected.
  </x-card>
  <x-card data-title="MCP Services" data-icon="lucide:server">
    Launch your agents as Model Context Protocol (MCP) servers, allowing them to be integrated with external systems and applications.
  </x-card>
  <x-card data-title="Interactive Interface" data-icon="lucide:terminal">
    Enjoy a user-friendly command-line experience with clear prompts and feedback, guiding you through every step.
  </x-card>
  <x-card data-title="Multi-Model Support" data-icon="lucide:brain-circuit">
    Connect your agents to a wide range of AI models from providers like OpenAI, Anthropic (Claude), xAI, and more.
  </x-card>
</x-cards>

## Installation

To get started, install the CLI globally on your system using your preferred package manager.

### npm

```bash npm install icon=logos:npm
npm install -g @aigne/cli
```

### yarn

```bash yarn add icon=logos:yarn
yarn global add @aigne/cli
```

### pnpm

```bash pnpm add icon=logos:pnpm
pnpm add -g @aigne/cli
```

## What You Can Do

The CLI provides a suite of commands to manage your agent's entire lifecycle. For a quick overview of what's possible, see the [Overview](./cli-overview.md) or dive into the detailed [Command Reference](./cli-command-reference.md).

<x-cards>
  <x-card data-title="Getting Started" data-icon="lucide:rocket" data-href="/cli/getting-started">
    Follow a step-by-step guide to install the CLI, create your first project, and run an agent in under five minutes.
  </x-card>
  <x-card data-title="Command Reference" data-icon="lucide:book-open" data-href="/cli/command-reference">
    Explore a complete reference for all available commands, including `create`, `run`, `test`, `deploy`, and more.
  </x-card>
</x-cards>

## Next Steps

Ready to build your first agent? Head over to the **Getting Started** guide to begin.

<x-card data-title="Get Started with the CLI" data-icon="lucide:arrow-right-circle" data-href="/cli/getting-started" data-cta="Start Tutorial">
  A step-by-step guide to get you from installation to running your first AI agent in just a few minutes.
</x-card>