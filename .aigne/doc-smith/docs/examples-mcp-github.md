
# MCP GitHub

This document provides a comprehensive guide to an example that demonstrates how to interact with GitHub repositories using the AIGNE Framework and the GitHub MCP (Model Context Protocol) Server. You will learn how to set up and run the example, enabling an AI agent to perform various GitHub operations like searching repositories and managing files.

## Overview

The example showcases the integration of an `MCPAgent` that connects to a GitHub MCP server. This agent equips the AI with a suite of tools (skills) to interact with the GitHub API. The workflow allows a user to make requests in natural language, which the AI agent then translates into specific function calls to the GitHub agent to perform actions such as searching for repositories, reading file contents, or creating issues.

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AIAgent: {
    label: "AI Agent\n(@aigne/core)"
    shape: rectangle
  }

  MCPAgent: {
    label: "GitHub MCP Agent\n(Skill)"
    shape: rectangle
  }

  AIAgent -> MCPAgent: "Uses skill"
}

GitHub-MCP-Server: {
  label: "GitHub MCP Server\n(@modelcontextprotocol/server-github)"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

AI-Model-Provider: {
  label: "AI Model Provider\n(e.g., OpenAI, AIGNE Hub)"
  shape: cylinder
}

AIGNE-Observe: {
  label: "AIGNE Observe\n(Debugging UI)"
  shape: rectangle
}

User -> AIGNE-Framework.AIAgent: "1. Natural language request"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "2. Process request"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "3. Return function call"
AIGNE-Framework.AIAgent -> AIGNE-Framework.MCPAgent: "4. Execute function call"
AIGNE-Framework.MCPAgent -> GitHub-MCP-Server: "5. Send command"
GitHub-MCP-Server -> GitHub-API: "6. Call GitHub API"
GitHub-API -> GitHub-MCP-Server: "7. Return API response"
GitHub-MCP-Server -> AIGNE-Framework.MCPAgent: "8. Return result"
AIGNE-Framework.MCPAgent -> AIGNE-Framework.AIAgent: "9. Return result"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "10. Process result"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "11. Return natural language response"
AIGNE-Framework.AIAgent -> User: "12. Final response"
AIGNE-Framework -> AIGNE-Observe: "Sends execution traces"
```

## Prerequisites

Before proceeding, ensure your system meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js.
*   **GitHub Personal Access Token**: A token with the necessary permissions for the repositories you intend to interact with. You can create one from your [GitHub settings](https://github.com/settings/tokens).
*   **AI Model Provider Account**: An API key from a provider like [OpenAI](https://platform.openai.com/api-keys) or a connection to an AIGNE Hub instance.

## Quick Start

You can run this example directly without a local installation using `npx`.

First, set your GitHub token as an environment variable.

```bash Set your GitHub token icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

Next, execute the example.

```bash Run the example icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### Connect to an AI Model

Upon first execution, if no AI model is configured, you will be prompted to connect one.


You have several options to proceed:

#### 1. Connect to the Official AIGNE Hub

This is the recommended approach. Selecting this option will open your browser to the official AIGNE Hub page. Follow the on-screen instructions to authorize the connection. New users receive complimentary credits to get started.


#### 2. Connect to a Self-Hosted AIGNE Hub

If you operate your own instance of AIGNE Hub, choose this option. You will be prompted to enter the URL of your self-hosted Hub to complete the connection.


#### 3. Configure a Third-Party Model Provider

You can also connect directly to a supported third-party model provider, such as OpenAI. To do this, set the provider's API key as an environment variable.

For example, to use OpenAI, configure your `OPENAI_API_KEY`:

```bash Set your OpenAI API key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

After setting the environment variable, run the `npx` command again. For a list of supported environment variables for other providers, refer to the `.env.local.example` file in the project source.

## Installation from Source

For developers who wish to inspect or modify the code, follow these steps to run the example from a local clone.

### 1. Clone the Repository

Clone the main AIGNE Framework repository from GitHub.

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and install the necessary dependencies using `pnpm`.

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-github
pnpm install
```

### 3. Run the Example

Execute the start script to run the example.

```bash Run in one-shot mode icon=lucide:terminal
pnpm start
```

The example also supports interactive chat mode and can accept input piped from other commands.

```bash Run in interactive chat mode icon=lucide:terminal
pnpm start -- --chat
```

```bash Use pipeline input icon=lucide:terminal
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

### Command-Line Options

You can customize the execution with the following command-line parameters:

| Parameter                 | Description                                                                                             | Default            |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat`                  | Run in interactive chat mode.                                                                           | Disabled           |
| `--model <provider[:model]>` | Specify the AI model to use (e.g., `openai` or `openai:gpt-4o-mini`).                                     | `openai`           |
| `--temperature <value>`   | Set the temperature for model generation.                                                               | Provider default   |
| `--top-p <value>`         | Set the top-p sampling value.                                                                           | Provider default   |
| `--presence-penalty <value>` | Set the presence penalty value.                                                                         | Provider default   |
| `--frequency-penalty <value>` | Set the frequency penalty value.                                                                        | Provider default   |
| `--log-level <level>`     | Set the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`).                                        | `INFO`             |
| `--input, -i <input>`     | Specify input directly as an argument.                                                                  | None               |

## Code Example

The following TypeScript code demonstrates the core logic of the example. It initializes an AI model, sets up the `MCPAgent` for GitHub, and invokes an `AIAgent` to perform a repository search.

```typescript index.ts
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Load environment variables
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;

// Initialize OpenAI model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// Initialize GitHub MCP agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// Create AIGNE instance with the model and GitHub skills
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// Create an AI agent with instructions for interacting with GitHub
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
});

// Invoke the agent to search for repositories
const result = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol'",
);

console.log(result);
// Expected Output:
// I found several repositories related to 'modelcontextprotocol':
//
// 1. **modelcontextprotocol/servers** - MCP servers for various APIs and services
// 2. **modelcontextprotocol/modelcontextprotocol** - The main ModelContextProtocol repository
// ...

// Shutdown the AIGNE instance when done
await aigne.shutdown();
```

## Available Operations

The GitHub MCP server exposes a wide range of GitHub functionalities as skills that the AI agent can use, including:

*   **Repository Operations**: Search, create, and get information about repositories.
*   **File Operations**: Get file contents, create or update files, and push multiple files in a single commit.
*   **Issue and PR Operations**: Create issues and pull requests, add comments, and merge pull requests.
*   **Search Operations**: Search code, issues, and users.
*   **Commit Operations**: List commits and get commit details.

## Debugging with AIGNE Observe

To inspect and analyze the behavior of your agent, you can use the `aigne observe` command. This tool starts a local web server that provides a user interface for viewing execution traces, call details, and other runtime data.

To start the observation server, run:

```bash Start the AIGNE observe server icon=lucide:terminal
aigne observe
```


Once the server is running, you can access the web interface in your browser to view a list of recent executions and drill down into the details of each trace.


This tool is invaluable for debugging, understanding how the agent interacts with tools and models, and optimizing performance.
