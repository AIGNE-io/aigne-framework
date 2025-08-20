# Getting Started

This guide provides a step-by-step walkthrough for installing the `@aigne/cli`, creating a new project from a template, and running your first AI agent.

## 1. Install the CLI

To begin, install the AIGNE command-line tool globally on your system. You can use npm, yarn, or pnpm.

#### Using npm
```bash
npm install -g @aigne/cli
```

#### Using yarn
```bash
yarn global add @aigne/cli
```

#### Using pnpm
```bash
pnpm add -g @aigne/cli
```

## 2. Create Your First Project

With the CLI installed, you can scaffold a new AIGNE project. The `create` command sets up a directory with a default file structure and configuration.

```bash
aigne create my-aigne-project
```

The CLI will launch an interactive prompt asking you to confirm the project name and select a template. The default template includes a pre-configured chat agent and a JavaScript sandbox skill.

Once complete, a new directory named `my-aigne-project` will be created.

## 3. Configure Your Environment

Before running the agent, you must provide an API key for the language model. The default project uses OpenAI's `gpt-4o-mini`.

First, navigate to your new project directory:

```bash
cd my-aigne-project
```

Next, create a local environment file by copying the provided example:

```bash
# On macOS or Linux
cp .env.local.example .env.local

# On Windows
copy .env.local.example .env.local
```

Open the new `.env.local` file and add your OpenAI API key:

```shell
# .env.local

# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 4. Run the Agent

Your project is now configured and ready to run. From within the project directory, execute the `run` command to start an interactive chat session with your agent.

```bash
aigne run
```

You can now interact with your agent directly in the terminal.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-cli.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-cli.png" alt="AIGNE CLI running a chat session" />
</picture>

## Next Steps

You have successfully set up your first AIGNE project. To learn more about the project structure, configuration files, and how agents and skills work, continue to the [Core Concepts](./core-concepts.md) section.