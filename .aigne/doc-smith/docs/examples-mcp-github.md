# MCP GitHub

This document provides a comprehensive guide to an example that demonstrates how to interact with GitHub repositories. By the end of this guide, you will be able to run an AI agent that can search for repositories, read file contents, and perform other GitHub-related tasks using the AIGNE Framework and the GitHub Model Context Protocol (MCP) Server.

## Overview

This example showcases the integration of the AIGNE Framework with the GitHub MCP Server, enabling an AI agent to utilize GitHub's API as a set of tools. The agent can be run in a single-command (one-shot) mode or an interactive chat mode, allowing for flexible interaction.

The core components involved are:
- **AI Agent**: The primary agent responsible for understanding user requests and orchestrating tasks.
- **GitHub MCP Agent**: A specialized agent that connects to the GitHub MCP Server, exposing its capabilities (like searching repos, reading files) as skills.

The following diagram illustrates the relationship between these components and the flow of information:

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
    "Understands user requests\nand orchestrates tasks"
  }

  GitHub-MCP-Agent: {
    label: "GitHub MCP Agent"
    shape: rectangle
    "Exposes GitHub server\ncapabilities as skills"
  }
}

GitHub-MCP-Server: {
  label: "GitHub MCP Server"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "1. Sends request (e.g., search repos)"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.GitHub-MCP-Agent: "2. Uses GitHub skills"
AIGNE-Framework.GitHub-MCP-Agent -> GitHub-MCP-Server: "3. Connects and sends commands"
GitHub-MCP-Server -> GitHub-API: "4. Makes API calls"
GitHub-API -> GitHub-MCP-Server: "5. Returns data"
GitHub-MCP-Server -> AIGNE-Framework.GitHub-MCP-Agent: "6. Forwards response"
AIGNE-Framework.GitHub-MCP-Agent -> AIGNE-Framework.AI-Agent: "7. Returns result of skill execution"
AIGNE-Framework.AI-Agent -> User: "8. Presents final answer"
```

For a deeper understanding of how MCP agents work, refer to the [MCP Agent](./developer-guide-agents-mcp-agent.md) documentation.

## Prerequisites

Before proceeding, ensure the following requirements are met:

- **Node.js**: Version 20.0 or higher. You can download it from [nodejs.org](https://nodejs.org).
- **GitHub Personal Access Token**: A token with appropriate repository permissions is required. You can generate one from your [GitHub settings](https://github.com/settings/tokens).
- **AI Model Provider API Key**: An API key from a provider like OpenAI is necessary for the AI agent to function. Get your key from the [OpenAI platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly without any local installation using `npx`.

First, set your GitHub token as an environment variable.

```sh Set GitHub Token icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

Next, run the example.

```sh Run Example icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### Connecting to an AI Model

The first time you run the example, you will be prompted to connect to an AI model. You have several options:

1.  **AIGNE Hub (Official)**: Select this option to connect via the official AIGNE Hub. A browser window will open for you to complete the connection. New users receive a complimentary token grant.
2.  **AIGNE Hub (Self-hosted)**: If you host your own AIGNE Hub instance, choose this option and provide its URL to connect.
3.  **Third-Party Model Provider**: To use a direct provider like OpenAI, set the corresponding API key as an environment variable.

For example, to use OpenAI, export your API key and re-run the command:

```sh Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
npx -y @aigne/example-mcp-github
```

For more details on configuring other providers, see the example environment file in the repository.

## Installation from Source

For development or modification, you can clone the repository and run the example locally.

1.  **Clone the Repository**

    ```sh Clone Repository icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **Navigate to Directory and Install Dependencies**

    ```sh Install Dependencies icon=lucide:terminal
    cd aigne-framework/examples/mcp-github
    pnpm install
    ```

3.  **Run the Example**

    You can run the agent in its default one-shot mode, in an interactive chat mode, or by piping input directly.

    ```sh Run in one-shot mode icon=lucide:terminal
    pnpm start
    ```

    ```sh Run in interactive chat mode icon=lucide:terminal
    pnpm start -- --chat
    ```

    ```sh Run with pipeline input icon=lucide:terminal
    echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
    ```

### Command-Line Options

The application supports several command-line arguments for customized execution.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `--chat` | Runs the agent in interactive chat mode. | Disabled |
| `--model <provider[:model]>` | Specifies the AI model to use (e.g., `openai` or `openai:gpt-4o-mini`). | `openai` |
| `--temperature <value>` | Sets the temperature for model generation. | Provider default |
| `--top-p <value>` | Sets the top-p sampling value. | Provider default |
| `--presence-penalty <value>`| Sets the presence penalty value. | Provider default |
| `--frequency-penalty <value>`| Sets the frequency penalty value. | Provider default |
| `--log-level <level>` | Sets the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`). | `INFO` |
| `--input`, `-i <input>` | Provides input directly as an argument. | None |

## Code Example

The following TypeScript code illustrates the core logic for setting up and running the GitHub agent. It initializes the AI model and the GitHub MCP agent, combines them using `AIGNE`, and then invokes an `AIAgent` to perform a task.

```typescript usages.ts icon=logos:typescript
import assert from "node:assert";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// Ensure environment variables are set
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

// 1. Initialize the AI Model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Initialize the GitHub MCP Agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 3. Create an AIGNE instance with the model and GitHub skills
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 4. Create an AI Agent with specific instructions
const agent = AIAgent.from({
  instructions: `\
## GitHub Interaction Assistant
You are an assistant that helps users interact with GitHub repositories.
You can perform various GitHub operations like:
1. Searching repositories
2. Getting file contents
3. Creating or updating files
4. Creating issues and pull requests
5. And many more GitHub operations

Always provide clear, concise responses with relevant information from GitHub.
`,
  inputKey: "message",
});

// 5. Invoke the agent to perform a task
const result = await aigne.invoke(agent, {
  message: "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
});

console.log(result);
// Expected Output:
// I found the following repositories related to 'modelcontextprotocol':
// 1. **modelcontextprotocol/modelcontextprotocol**: The main repository for the Model Context Protocol.
// 2. **modelcontextprotocol/servers**: A collection of MCP servers for various APIs and services.
// 3. **AIGNE-io/aigne-framework**: The framework for building agentic AI applications.

// 6. Shutdown the AIGNE instance
await aigne.shutdown();
```

This script demonstrates a complete workflow: setting up the necessary components, defining the agent's purpose, and executing a specific task.

## Available GitHub Operations

The GitHub MCP server exposes a wide range of functionalities. The AI agent can be instructed to perform operations across several categories:

- **Repository Operations**: Search, create, and retrieve repository information.
- **File Operations**: Get file contents, create or update files, and push multiple files in a single commit.
- **Issue and PR Operations**: Create issues and pull requests, add comments, and merge pull requests.
- **Search Operations**: Search code, issues, and users across GitHub.
- **Commit Operations**: List commits and get details for a specific commit.

## Summary

This example provides a practical demonstration of how to build a functional AI agent capable of interacting with external services like GitHub through the Model Context Protocol. By following the steps outlined, you can quickly set up and experiment with an agent that automates repository-related tasks.

For more information on other available examples and advanced workflows, please explore the following sections:

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    Learn the core concepts behind the MCPAgent and how it connects to external tools.
  </x-card>
  <x-card data-title="All Examples" data-icon="lucide:binary" data-href="/examples">
    Browse the full list of examples to discover other capabilities of the AIGNE Framework.
  </x-card>
</x-cards>