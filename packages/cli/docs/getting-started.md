---
labels: ["Reference"]
---

# Getting Started

This guide provides a step-by-step walkthrough for installing the `@aigne/cli`, creating a new project from a template, and running your first agent. You'll be interacting with an AI agent in your terminal in just a few minutes.

## 1. Install @aigne/cli

First, you need to install the AIGNE command-line tool globally using your preferred package manager. This makes the `aigne` command available in your system.

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

## 2. Create Your First Project

With the CLI installed, you can now create a new AIGNE project. The `create` command scaffolds a project directory with a basic agent and all the necessary configuration files.

Run the following command in your terminal:

```bash
aigne create my-first-agent
```

The CLI will guide you through an interactive setup process. It will first ask for the project name and then prompt you to select a template. For now, choose the `default` template.

![Create project interactive project name prompt](../assets/create/create-project-interactive-project-name-prompt.png)

Once the process is complete, you will see a success message with instructions on how to proceed.

![Create project using default template success message](../assets/create/create-project-using-default-template-success-message.png)

## 3. Configure Your Environment

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

Everything is now set up. You can start the agent by running the `aigne run` command from within your project directory. This command loads your agent and starts an interactive chat session in the terminal.

```bash
aigne run
```

You can now start sending messages to your agent and receive responses.

![Run default template project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

To end the session, press `Ctrl + C`.

## Next Steps

You have successfully installed the AIGNE CLI, created a project, and run your first agent. To understand what's happening under the hood, including the structure of the project and how agents and skills are defined, head over to the next section.

Next, learn about the [Core Concepts](./core-concepts.md) of an AIGNE project.