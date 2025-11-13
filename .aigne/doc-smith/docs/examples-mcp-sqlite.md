# MCP SQLite

This guide provides a comprehensive walkthrough for interacting with SQLite databases using the AIGNE Framework and the Model Context Protocol (MCP). By following this example, you will learn how to set up an agent that can execute database operations, such as creating tables, inserting data, and querying records, through natural language commands.

## Overview

The MCP SQLite example demonstrates how to connect an AI agent to an external SQLite database via an MCP server. This allows the agent to leverage a set of predefined skills for database management, including creating, reading, and writing data. The agent interprets user requests, translates them into the appropriate database commands, and executes them through the SQLite MCP server.

The fundamental workflow is as follows:
1.  A user provides a natural language command (e.g., "create a product table").
2.  The `AIAgent` processes the command.
3.  The agent identifies the appropriate skill (e.g., `create_table`) from the `MCPAgent` connected to the SQLite server.
4.  The `MCPAgent` executes the corresponding SQL command on the database.
5.  The result is returned to the agent, which then formulates a response for the user.

The following diagram illustrates this workflow:

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCP Agent \n(SQLite Skill)"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLite Database"
  shape: cylinder
}

User -> AIAgent: "1. Natural Language Command\n(e.g., 'create a table')"
AIAgent -> MCPAgent: "2. Selects & invokes skill\n(e.g., create_table)"
MCPAgent -> SQLite-DB: "3. Executes SQL command"
SQLite-DB -> MCPAgent: "4. Returns result"
MCPAgent -> AIAgent: "5. Forwards result"
AIAgent -> User: "6. Formulates & sends response"

```

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js.
*   **uv**: A Python virtual environment and package installer. See the [uv installation guide](https://github.com/astral-sh/uv) for setup instructions.
*   **AI Model API Key**: An API key from a supported provider, such as OpenAI.

## Quick Start

You can run this example directly without a local installation using `npx`. This is the fastest way to see the MCP SQLite integration in action.

### Run the Example

Execute the following commands in your terminal. The example supports a one-shot mode for single commands and an interactive chat mode.

1.  **One-Shot Mode (Default)**
    This mode takes a single command, executes it, and exits.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --input "create a product table with columns name, description, and createdAt"
    ```

2.  **Pipeline Input**
    You can also pipe input directly to the command.

    ```bash icon=lucide:terminal
    echo "how many products are in the table?" | npx -y @aigne/example-mcp-sqlite
    ```

3.  **Interactive Chat Mode**
    For a conversational experience, use the `--chat` flag.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --chat
    ```

### Connect to an AI Model

To execute commands, the agent needs to connect to a large language model. You have several options for this.

*   **AIGNE Hub (Recommended)**: The first time you run the example, you will be prompted to connect via the official AIGNE Hub. This is the simplest method and provides new users with free tokens to get started.
*   **Self-Hosted AIGNE Hub**: If you have your own instance of AIGNE Hub, you can connect to it by providing its URL.
*   **Third-Party Model Provider**: You can directly connect to a model provider like OpenAI by setting the required API key as an environment variable.

For example, to use OpenAI, export your API key:

```bash title="Set OpenAI API Key" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

Refer to the `.env.local.example` file in the source repository for more examples of configuring different model providers.

## Installation from Source

For development or customization, you can clone the repository and run the example locally.

1.  **Clone the Repository**

    ```bash icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **Install Dependencies**
    Navigate to the example directory and install the necessary packages using `pnpm`.

    ```bash icon=lucide:terminal
    cd aigne-framework/examples/mcp-sqlite
    pnpm install
    ```

3.  **Run the Example**
    Use the `pnpm start` command to execute the script.

    ```bash icon=lucide:terminal
    # Run in one-shot mode
    pnpm start -- --input "create 10 products for test"

    # Run in interactive chat mode
    pnpm start -- --chat
    ```

## Command-Line Options

The script accepts several command-line arguments to customize its behavior.

| Parameter                 | Description                                                                                       | Default          |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat`                  | Run in interactive chat mode.                                                                     | Disabled         |
| `--model <provider[:model]>` | Specify the AI model to use, e.g., `openai` or `openai:gpt-4o-mini`.                                | `openai`         |
| `--temperature <value>`   | Set the temperature for model generation.                                                         | Provider default |
| `--top-p <value>`         | Set the top-p sampling value.                                                                     | Provider default |
| `--presence-penalty <value>` | Set the presence penalty value.                                                                   | Provider default |
| `--frequency-penalty <value>`| Set the frequency penalty value.                                                                  | Provider default |
| `--log-level <level>`     | Set the logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`).                                  | `INFO`           |
| `--input`, `-i <input>`   | Provide input directly as an argument.                                                            | None             |

## Code Implementation

The core logic involves initializing the AI model, setting up the `MCPAgent` to connect to the SQLite server, and then creating an `AIGNE` instance that uses the agent and its skills.

The following example demonstrates the complete process of creating a table, inserting records, and querying the database.

```typescript index.ts
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Ensure the OpenAI API key is set in your environment variables
const { OPENAI_API_KEY } = process.env;

// 1. Initialize the AI model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Create an MCPAgent to manage the SQLite server process
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"), // Specify the database file path
  ],
});

// 3. Instantiate the AIGNE with the model and the SQLite skill
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. Define the AI agent with specific instructions
const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

// 5. Invoke the agent to perform database operations
console.log(
  "Creating table...",
  await aigne.invoke(
    agent,
    "create a product table with columns name, description, and createdAt",
  ),
);
// Expected output:
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(
  "Inserting test data...",
  await aigne.invoke(agent, "create 10 products for test"),
);
// Expected output:
// {
//   $message: "I have successfully created 10 test products in the database...",
// }

console.log(
  "Querying data...",
  await aigne.invoke(agent, "how many products?"),
);
// Expected output:
// {
//   $message: "There are 10 products in the database.",
// }

// 6. Shutdown the AIGNE instance to terminate the MCP server
await aigne.shutdown();
```

This script automates the entire lifecycle: it starts the MCP server, configures an AI agent to use it, executes a series of database tasks based on natural language, and shuts down cleanly.

## Debugging

To monitor and analyze the agent's behavior, you can use the `aigne observe` command. This tool launches a local web server that provides a detailed view of agent execution traces, including interactions with models and tools. It is invaluable for debugging and understanding the flow of information.

```bash icon=lucide:terminal
aigne observe
```

After running this command, you can open the provided URL in your browser to inspect recent agent invocations.

## Summary

This example illustrates the power of combining the AIGNE Framework with the Model Context Protocol to create agents capable of interacting with external systems like databases. By abstracting database operations into skills, developers can build sophisticated, language-driven applications with minimal effort.

For more advanced use cases and other examples, please refer to the following documents:

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    Learn more about how to connect to external systems via the Model Context Protocol.
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    Explore the primary agent for interacting with language models and using tools.
  </x-card>
</x-cards>