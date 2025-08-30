---
labels: ["Reference"]
---

# Getting Started

This guide provides a step-by-step walkthrough to get you up and running with `@aigne/cli`. You will learn how to install the command-line tool, create a new AIGNE project from a template, and run your first agent.

## Prerequisites

Before you begin, make sure you have the following:

- **Node.js**: A modern version of Node.js is required.
- **API Key**: You'll need an API key from a supported AI model provider, such as OpenAI. The default template is configured to use OpenAI.

## Step 1: Install the AIGNE CLI

First, install the `@aigne/cli` package globally on your system using your preferred package manager. This makes the `aigne` command available from any directory.

**Using npm**
```bash
npm install -g @aigne/cli
```

**Using yarn**
```bash
yarn global add @aigne/cli
```

**Using pnpm**
```bash
pnpm add -g @aigne/cli
```

## Step 2: Create Your First Project

Next, use the `aigne create` command to generate a new project. This command scaffolds a directory with all the necessary configuration files to get started.

```bash
aigne create my-first-agent
```

The CLI will launch an interactive process, prompting you to confirm the project name and select a template. For now, you can choose the `default` template.

![Interactive project name prompt](../assets/create/create-project-interactive-project-name-prompt.png)

Upon successful creation, you will see a confirmation message with instructions on how to proceed.

![Project creation success message](../assets/create/create-project-using-default-template-success-message.png)

## Step 3: Configure Environment Variables

Your agent needs an API key to communicate with an AI model provider. The project template includes an example environment file for this purpose.

First, navigate into your newly created project directory:
```bash
cd my-first-agent
```

Next, copy the example environment file to a new file named `.env.local`:
```bash
cp .env.local.example .env.local
```

Now, open the `.env.local` file in your editor and add your OpenAI API key:

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY" # Paste your key here
```

## Step 4: Run the Agent

With your API key configured, you are ready to run the agent. Execute the `aigne run` command from within your project directory:

```bash
aigne run
```

This command initializes the AIGNE framework and starts an interactive chat session in your terminal with the default agent. You can now start sending messages to your agent.

![Running the agent in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

## Next Steps

Congratulations! You have successfully installed the AIGNE CLI and run your first agent. From here, you can:

- Explore the generated project files to understand how agents and skills are defined in the [Core Concepts](./core-concepts.md) section.
- Discover all the available commands and their options in the [Command Reference](./command-reference.md).
- Learn how to write tests for your agent with the `aigne test` command.