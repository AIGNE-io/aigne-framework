This document provides a comprehensive guide to creating and running an agent-based chatbot using the AIGNE Framework. You will learn to execute the chatbot instantly without installation, connect it to various AI model providers, and set it up for local development. The example supports both single-response (one-shot) and continuous conversation (interactive) modes.

## Overview

This example demonstrates the capabilities of the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) by building a functional chatbot. The agent can be operated in two primary modes:

*   **One-shot Mode**: The chatbot processes a single input and provides a single response before exiting. This is ideal for direct questions or command-line piping.
*   **Interactive Mode**: The chatbot engages in a continuous conversation, maintaining context between turns until the user terminates the session.

## Prerequisites

Before proceeding, ensure your environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with your Node.js installation.
*   **AI Model Access**: An API key from a provider like OpenAI is required. Alternatively, you can connect to the AIGNE Hub.

## Quick Start (No Installation)

You can run the chatbot example directly from your terminal without any local installation steps using `npx`.

### Execute the Chatbot

The chatbot can be run in different modes to suit your needs.

*   **One-Shot Mode (Default)**: For a single question and answer.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

*   **Interactive Chat Mode**: To begin a continuous conversation.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

*   **Pipeline Input**: You can pipe input directly to the chatbot in one-shot mode.

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | npx -y @aigne/example-chat-bot
    ```

### Connect to an AI Model

On the first run, the CLI will prompt you to connect to an AI model service. You have several options available.
```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Connection-Options: {
  label: "Connection Options"
  shape: rectangle
  grid-columns: 3

  AIGNE-Hub-Official: {
    label: "AIGNE Hub\n(Official)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  AIGNE-Hub-Self-Hosted: {
    label: "AIGNE Hub\n(Self-Hosted)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "Third-Party Provider\n(e.g., OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

User -> AIGNE-CLI: "1. Run chatbot"
AIGNE-CLI -> User: "2. Prompt for AI model connection"
User -> Connection-Options: "3. Selects an option"

Connection-Options.AIGNE-Hub-Official -> AIGNE-CLI: "Connect via browser auth"
Connection-Options.AIGNE-Hub-Self-Hosted -> AIGNE-CLI: "Connect via service URL"
Connection-Options.AIGNE-Hub-Self-Hosted <- Blocklet-Store: "Deploy from"
Connection-Options.Third-Party-Provider -> AIGNE-CLI: "Connect via env variables"
```
1.  **Connect via AIGNE Hub (Official)**
    This is the recommended path for new users. Selecting this option will open your web browser to the official AIGNE Hub. Follow the on-screen instructions to connect. New users automatically receive a complimentary token balance to get started.

2.  **Connect via AIGNE Hub (Self-Hosted)**
    If you operate your own instance of AIGNE Hub, choose this option and enter your service's URL to complete the connection. You can deploy a self-hosted AIGNE Hub from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

3.  **Connect via a Third-Party Model Provider**
    You can connect directly to a provider such as OpenAI by setting the required environment variables. For OpenAI, set your API key as follows:

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    After configuring the environment variable, run the chatbot command again. For a list of supported variables for other providers (e.g., DeepSeek, Google Gemini), refer to the `.env.local.example` file in the repository.

## Local Installation and Setup

For development or customization, you can clone the repository and run the example from your local machine.

### 1. Install AIGNE CLI

First, install the AIGNE command-line interface globally.

```bash icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. Clone the Repository

Clone the AIGNE Framework repository and navigate into the chatbot example's directory.

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. Run the Example Locally

From within the `chat-bot` directory, use `pnpm` to execute the start scripts.

*   **One-Shot Mode (Default)**:

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **Interactive Chat Mode**:

    ```bash icon=lucide:terminal
    pnpm start --chat
    ```

*   **Pipeline Input**:

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | pnpm start
    ```

## Command-Line Options

The chatbot script accepts several command-line arguments to customize its behavior and configuration.

| Parameter | Description | Default |
|---|---|---|
| `--chat` | Runs the chatbot in interactive mode for continuous conversation. | Disabled (one-shot mode) |
| `--model <provider[:model]>` | Specifies the AI model to use. Format is `provider[:model]`. Examples: `openai` or `openai:gpt-4o-mini`. | `openai` |
| `--temperature <value>` | Sets the temperature for model generation to control randomness. | Provider default |
| `--top-p <value>` | Sets the top-p (nucleus sampling) value for token selection. | Provider default |
| `--presence-penalty <value>` | Adjusts the penalty for new tokens based on their presence in the text so far. | Provider default |
| `--frequency-penalty <value>` | Adjusts the penalty for new tokens based on their frequency in the text so far. | Provider default |
| `--log-level <level>` | Sets the logging verbosity. Options: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`. | `INFO` |
| `--input`, `-i <input>` | Provides the input query directly as an argument. | None |

## Debugging

The AIGNE Framework includes a powerful observation tool for monitoring and analyzing agent execution, which is essential for debugging and performance tuning.

1.  **Start the Observation Server**
    Run the `aigne observe` command in your terminal. This launches a local web server that listens for execution data from your agents.

2.  **View Executions**
    Open the web interface in your browser to see a list of recent agent runs. You can select an execution to inspect its traces, view detailed call information, and understand how the agent processes information and interacts with models.

## Summary

This example provides a practical foundation for building agent-based chatbots with the AIGNE Framework. You have learned how to run the chatbot in different modes, connect it to AI models, and debug its execution.

For more advanced examples and features, you may want to explore the following topics:

<x-cards data-columns="2">
  <x-card data-title="Memory" data-icon="lucide:brain-circuit" data-href="/examples/memory">Learn how to give your chatbot memory to recall past interactions.</x-card>
  <x-card data-title="AIGNE File System (AFS)" data-icon="lucide:folder-tree" data-href="/examples/afs-system-fs">Build a chatbot that can interact with your local file system.</x-card>
  <x-card data-title="Workflow Orchestration" data-icon="lucide:workflow" data-href="/examples/workflow-orchestration">Coordinate multiple agents to work together on complex tasks.</x-card>
  <x-card data-title="Core Concepts" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">Dive deeper into the fundamental building blocks of the AIGNE Framework.</x-card>
</x-cards>