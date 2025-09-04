---
labels: ["Reference"]
---

# Getting Started

This guide will walk you through the essential steps to get up and running with `@aigne/cli`. You'll learn how to install the command-line tool, create a new agent project from a template, and run it locally in an interactive chat session.

### Development Workflow

The typical workflow for getting started with a new AIGNE project involves four main steps: installing the CLI, creating a project, configuring your environment, and running the agent.

```d2
direction: down

User-Terminal: {
  label: "User's Terminal"
  shape: rectangle
}

AIGNE-Agent: {
  label: "Interactive Agent Session"
  shape: rectangle
}

Installation: {
  label: "1. Install CLI\n`npm install -g @aigne/cli`"
  shape: step
}

Project-Creation: {
  label: "2. Create Project\n`aigne create my-first-agent`"
  shape: step
}

Configuration: {
  label: "3. Configure API Key\n`cd my-first-agent`\n`cp .env.local.example .env.local`"
  shape: step
}

Execution: {
  label: "4. Run Agent\n`aigne run --chat`"
  shape: step
}


User-Terminal -> Installation: "Execute"
Installation -> Project-Creation: "Execute"
Project-Creation -> Configuration: "Execute"
Configuration -> Execution: "Execute"
Execution -> AIGNE-Agent: "Starts"
```

## 1. Install the AIGNE CLI

First, you need to install the `@aigne/cli` package globally using your preferred package manager. This makes the `aigne` command available in your terminal.

### Using npm

```bash
npm install -g @aigne/cli
```

### Using yarn

```bash
yarn global add @aigne/cli
```

### Using pnpm

```bash
pnpm add -g @aigne/cli
```

## 2. Create Your First Project

Once the CLI is installed, create a new AIGNE project using the `aigne create` command. This command scaffolds a new project with a default file structure and configuration.

```bash
aigne create my-first-agent
```

The CLI will guide you through an interactive process, asking for the project name (if not provided) and the template to use. For now, you can accept the default options.

![AIGNE CLI prompting for project name](../assets/create/create-project-interactive-project-name-prompt.png)

Upon successful creation, you will see a confirmation message with instructions on how to proceed.

![Successful project creation message](../assets/create/create-project-using-default-template-success-message.png)

## 3. Configure Your API Key

Before running the agent, you need to provide an API key for the AI model provider. The default template is configured to use OpenAI.

First, navigate into your newly created project directory:

```bash
cd my-first-agent
```

Next, copy the example environment file to a new `.env.local` file. This file is used to store your secret keys and is ignored by version control.

```bash
cp .env.local.example .env.local
```

Now, open the `.env.local` file and add your OpenAI API key:

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

Replace `"YOUR_OPENAI_API_KEY"` with your actual key.

## 4. Run Your Agent

With the configuration in place, you are ready to run your agent. To start an interactive session, execute the `aigne run` command with the `--chat` flag from within your project directory.

```bash
aigne run --chat
```

This command starts a chat loop with the default agent defined in your project, allowing you to interact with it directly in your terminal.

![AIGNE CLI running the default agent in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

## Next Steps

You have successfully installed the AIGNE CLI, created a new project, and run your first agent. To understand the structure of the project you just created and how agents and skills are defined, head over to the [Core Concepts](./core-concepts.md) section.
