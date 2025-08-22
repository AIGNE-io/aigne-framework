# Getting Started

This guide provides a step-by-step walkthrough for installing the AIGNE command-line interface (CLI), creating a new project from a template, and running your first AI agent. By the end of this guide, you will have a functional, chat-based agent running on your local machine.

## Step 1: Install the AIGNE CLI

The AIGNE CLI is a command-line tool that requires Node.js. You can install it globally using your preferred package manager.

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

After installation, you can verify it by running `aigne --help` in your terminal, which will display a list of available commands.

## Step 2: Create a New Project

With the CLI installed, you can now create a new AIGNE project. The `create` command scaffolds a project directory with a default agent and necessary configuration files.

To create a project in a new directory named `my-first-agent`, run:
```bash
aigne create my-first-agent
```

Alternatively, if you run the command without a path, it will prompt you to enter the project name interactively:
```bash
aigne create
```

![Creating a project with an interactive prompt for the project name](https://docsmith.aigne.io/image-bin/uploads/61a25e0b14ee2b304cd02972e81236b2.png)

Once completed, a success message will be displayed, and a new directory will be created with the following structure:

![File structure of a project created with the default template](https://docsmith.aigne.io/image-bin/uploads/d77c21029750a66ba316b3a91e00f9ca.png)

## Step 3: Configure Environment Variables

Before running the agent, you need to provide an API key for the language model. The default template is configured to use OpenAI.

1.  Navigate into your new project directory:
    ```bash
    cd my-first-agent
    ```

2.  The project includes a file named `.env.local.example`. Copy it to a new file named `.env.local`.

3.  Open `.env.local` in your editor and add your OpenAI API key:

    ```shell
    # OpenAI
    MODEL="openai:gpt-4o-mini"
    OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

## Step 4: Run Your Agent

Now that the project is created and configured, you can start the agent. The `run` command launches an interactive chat loop in your terminal, allowing you to converse with your agent.

From inside the `my-first-agent` directory, execute:

```bash
aigne run
```

The CLI will initialize the agent and present you with a chat prompt. You can now interact with your agent directly.

![Running the default project in chat mode](https://docsmith.aigne.io/image-bin/uploads/6d8b90c443540b0fdb3c00211448a47f.png)

## Next Steps

You have successfully installed the AIGNE CLI, created a project, and run your first agent. To understand how the project is structured and how to customize your agent, proceed to the [Core Concepts](./core-concepts.md) section.