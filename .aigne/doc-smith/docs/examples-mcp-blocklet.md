# MCP Blocklet

This document provides a technical guide on using the AIGNE Framework and the Model Context Protocol (MCP) to interact with applications hosted on the Blocklet platform. It outlines the necessary prerequisites, quick-start procedures, model connection methods, and advanced configuration options for developers.

```d2
direction: down

Developer: {
  shape: c4-person
}

Execution-Environment: {
  label: "Execution Environment"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Blocklet-Example: {
    label: "@aigne/example-mcp-blocklet"
    shape: rectangle
  }

  AIGNE-Observe: {
    label: "aigne observe"
    shape: rectangle
  }
}

Blocklet-Application: {
  label: "Target Blocklet Application"
  shape: rectangle
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

AI-Model-Providers: {
  label: "AI Model Providers"
  shape: rectangle

  AIGNE-Hub-Official: {
    label: "AIGNE Hub (Official)"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "Self-Hosted AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "Third-Party Provider (e.g., OpenAI)"
  }
}

Developer -> Execution-Environment.MCP-Blocklet-Example: "Runs via `npx` or `pnpm start`"
Developer -> Execution-Environment.AIGNE-Observe: "Uses for debugging"
Execution-Environment.MCP-Blocklet-Example -> Blocklet-Application: "Interacts with"
Execution-Environment.MCP-Blocklet-Example -> AI-Model-Providers: "Connects to one"
Execution-Environment.AIGNE-Observe -> Execution-Environment.MCP-Blocklet-Example: "Monitors execution data"
```

## Prerequisites

To proceed, ensure the following dependencies are installed and correctly configured on your local development machine:

*   **Node.js:** Version 20.0 or a more recent release.
*   **npm:** Node Package Manager, which is distributed with Node.js.
*   **OpenAI API Key:** An active API key is required to interface with OpenAI models. Keys can be generated from the [OpenAI API keys page](https://platform.openai.com/api-keys).

For developers intending to run the example from the source code, the following are also required:

*   **Bun:** A JavaScript runtime used for executing unit tests and examples.
*   **pnpm:** A package manager for handling project dependencies.

## Quick Start

This section outlines the procedure for executing the example directly via `npx`, which does not require a local installation of the project repository.

First, configure the `BLOCKLET_APP_URL` environment variable to point to your target Blocklet application.

```bash Set Blocklet App URL icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

### Execution Modes

The example supports two primary modes of operation.

#### One-Shot Mode

In the default one-shot mode, the agent processes a single request and then terminates.

```bash Run in one-shot mode icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet
```

Input can also be supplied via a standard pipeline, which is useful for scripting.

```bash Run with pipeline input icon=lucide:terminal
echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
```

#### Interactive Chat Mode

For a persistent, conversational session, execute the example with the `--chat` flag.

```bash Run in interactive mode icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet --chat
```

### Connecting to an AI Model

An AI model connection is required for the agent to function. The following connection methods are supported.

#### 1. AIGNE Hub (Official)

Upon first execution, you will be prompted to connect to a model provider. The first option, connecting via the official AIGNE Hub, is recommended for new users. This method provides a managed service and a complimentary token allocation for initial use.

#### 2. Self-Hosted AIGNE Hub

Alternatively, you can connect to a self-hosted instance of the AIGNE Hub. Select the second option and provide the URL of your deployed instance. A self-hosted hub can be installed from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

#### 3. Third-Party Model Provider

Direct integration with third-party model providers is supported via environment variables. For example, to use OpenAI, set the `OPENAI_API_KEY` variable.

```bash Configure OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

Refer to the `.env.local.example` file for a comprehensive list of supported providers and their required environment variables. After setting the variables, re-run the `npx` command.

## Running from Source

For development or modification purposes, the example can be run from a local clone of the repository.

### 1. Clone the Repository

Clone the `aigne-framework` repository using Git.

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and use `pnpm` to install dependencies.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. Run the Example

Use the `pnpm start` command to execute the script in its default one-shot mode.

```bash Run the example icon=lucide:terminal
pnpm start
```

You can also provide the Blocklet application URL as a command-line argument.

```bash Run with specific URL icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## Command-Line Options

The example's behavior can be modified using the command-line parameters detailed below. When running from source via `pnpm start`, command-line arguments for the script must be preceded by `--`.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `--chat` | Runs the agent in interactive chat mode. | Disabled |
| `--model <provider[:model]>` | Specifies the AI model to use. Format: `'provider[:model]'`. Examples: `'openai'` or `'openai:gpt-4o-mini'`. | `openai` |
| `--temperature <value>` | Sets the temperature for model generation. | Provider default |
| `--top-p <value>` | Sets the top-p sampling value for model generation. | Provider default |
| `--presence-penalty <value>` | Sets the presence penalty value for model generation. | Provider default |
| `--frequency-penalty <value>` | Sets the frequency penalty value for model generation. | Provider default |
| `--log-level <level>` | Sets the logging verbosity. Accepted values: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`. | `INFO` |
| `--input`, `-i <input>` | Provides input directly as an argument. | `None` |

### Usage Examples

```bash Run in interactive mode icon=lucide:terminal
pnpm start -- --chat
```

```bash Set logging level to DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash Use pipeline input icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## Debugging

The AIGNE Framework includes `aigne observe`, a command-line tool that launches a local web server for monitoring and analyzing agent execution data. This tool is essential for debugging, performance analysis, and understanding agent behavior.

Start the observation server in a dedicated terminal session. After running your agent, the web interface will display a list of recent executions, providing detailed traces, call information, and runtime metrics.

## Summary

This document detailed the procedure for running the MCP Blocklet example, covering prerequisites, quick-start execution with `npx`, various model connection methods, and running from source. For additional examples of MCP integration, refer to the following guides.

<x-cards data-columns="2">
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">Learn how to run AIGNE Framework agents as a Model Context Protocol (MCP) Server.</x-card>
  <x-card data-title="MCP DID Spaces" data-icon="lucide:space" data-href="/examples/mcp-did-spaces">See how to create a chatbot with MCP DID Spaces integration to expose DID Spaces functionality as skills.</x-card>
</x-cards>