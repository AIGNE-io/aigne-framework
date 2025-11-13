# Workflow Group Chat

This document provides a step-by-step guide to building and running a multi-agent group chat application using the AIGNE Framework. You will learn how to orchestrate several AI agents—a manager, writer, editor, and illustrator—to collaborate on a task, demonstrating a practical application of complex agentic workflows.

## Overview

In this workflow, a `Group Manager` agent serves as the central coordinator. When a user provides an instruction, the manager directs the request to the appropriate specialized agent. The agents then collaborate by sharing messages within the group to complete the task.

The following diagram illustrates this interaction flow:

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  Group-Manager: {
    label: "Group Manager"
  }

  Writer: {
    label: "Writer"
  }

  Editor: {
    label: "Editor"
  }

  Illustrator: {
    label: "Illustrator"
  }

}

User -> AIGNE-Framework.Group-Manager: "1. Sends instruction"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Writer: "2. Delegates task"
AIGNE-Framework.Writer -> AIGNE-Framework.Editor: "3. Shares draft (group message)"
AIGNE-Framework.Writer -> AIGNE-Framework.Illustrator: "3. Shares draft (group message)"
AIGNE-Framework.Writer -> User: "3. Shares draft (group message)"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Illustrator: "4. Requests image creation"
```

The interaction flow is as follows:

1.  A **User** sends an instruction to the **Group Manager**.
2.  The **Group Manager** delegates the initial task to the **Writer** agent.
3.  The **Writer** agent drafts the content and shares it as a group message, making it available to the **Editor**, **Illustrator**, and **User**.
4.  The **Manager** then requests the **Illustrator** to create an image based on the story.
5.  This collaborative process continues until the initial instruction is fulfilled.

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with your Node.js installation.
*   **OpenAI API Key**: Required for agents to interact with OpenAI's language models. Obtain a key from the [OpenAI Platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly using `npx` without cloning the repository.

### Run the Example

The application supports several execution modes.

#### One-Shot Mode

In the default mode, the application processes a single input instruction and then terminates.

```bash Run in one-shot mode icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

#### Interactive Chat Mode

Use the `--chat` flag to run the application in an interactive mode for continuous conversation.

```bash Run in interactive chat mode icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

#### Pipeline Input

You can also pipe input directly from your terminal.

```bash Use pipeline input icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### Connect to an AI Model

The first time you run the example, you will be prompted to connect to an AI model provider.

![Connect to an AI model](/sources/examples/workflow-group-chat/run-example.png)

You have several options:

1.  **AIGNE Hub (Official)**: The recommended method. The official hub provides free tokens for new users.
2.  **Self-Hosted AIGNE Hub**: Connect to your own instance of AIGNE Hub by providing its URL.
3.  **Third-Party Model Provider**: Connect directly to providers like OpenAI by setting the appropriate environment variables. For OpenAI, set your API key as follows:

    ```bash Set OpenAI API key icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key-here"
    ```

After configuration, run the `npx` command again.

## Running from Source

To inspect or modify the code, you can clone the repository and run the example locally.

### 1. Clone the Repository

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example directory and install the required packages using `pnpm`.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. Run the Example

Use the `pnpm start` command to execute the application. Command-line arguments must be passed after `--`.

```bash Run in one-shot mode icon=lucide:terminal
pnpm start
```

```bash Run in interactive chat mode icon=lucide:terminal
pnpm start -- --chat
```

```bash Use pipeline input icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

## Command-Line Options

The application's behavior can be customized using the following command-line parameters.

| Parameter | Description | Default |
|---|---|---|
| `--chat` | Run in interactive chat mode | Disabled (one-shot mode) |
| `--model <provider[:model]>` | AI model to use in format 'provider\[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | Temperature for model generation | Provider default |
| `--top-p <value>` | Top-p sampling value | Provider default |
| `--presence-penalty <value>` | Presence penalty value | Provider default |
| `--frequency-penalty <value>` | Frequency penalty value | Provider default |
| `--log-level <level>` | Set logging level (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | Specify input directly | None |

### Usage Example

The following command runs the application with the logging level set to `DEBUG`:

```bash Set logging level icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## Debugging

To inspect and analyze agent behavior, use the `aigne observe` command. This tool launches a local web server with an interface for viewing execution traces, call details, and other runtime data, which is essential for debugging agentic workflows.

To start the observation server, run:

```bash Start the observation server icon=lucide:terminal
aigne observe
```

![Start aigne observe](/sources/examples/images/aigne-observe-execute.png)

Once running, the web interface will display a list of recent agent executions, allowing you to drill down into the details of each run.

![View recent executions](/sources/examples/images/aigne-observe-list.png)

## Summary

This guide has demonstrated how to run and configure a collaborative, multi-agent group chat. To explore other advanced workflow patterns, refer to the following examples:

<x-cards data-columns="2">
  <x-card data-title="Workflow: Handoff" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  Learn how to create seamless transitions between specialized agents to solve complex problems.
  </x-card>
  <x-card data-title="Workflow: Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:network">
  Coordinate multiple agents working together in sophisticated processing pipelines.
  </x-card>
</x-cards>