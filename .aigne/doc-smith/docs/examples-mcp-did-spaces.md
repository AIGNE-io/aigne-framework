# MCP DID Spaces

This guide demonstrates how to build a chatbot integrated with DID Spaces via the Model Context Protocol (MCP). By following these steps, you will create an agent capable of interacting with decentralized storage, performing operations like reading, writing, and listing files using predefined skills.

## Overview

This example showcases the integration of the AIGNE Framework with a DID Spaces service through the Model Context Protocol (MCP). The primary goal is to equip a chatbot agent with a set of skills that allow it to perform file and data operations within a user's DID Space. This provides a practical demonstration of how agents can securely interact with external, decentralized services.

The following diagram illustrates the interaction between the chatbot agent, the MCP server, and the DID Space:

```d2
direction: down

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  MCPAgent: {
    label: "Chatbot Agent\n(MCPAgent)"
  }
}

MCP-Server: {
  label: "MCP Server"
  shape: rectangle
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

AIGNE-Framework.MCPAgent -> MCP-Server: "1. Connect & Discover Skills"
MCP-Server -> AIGNE-Framework.MCPAgent: "2. Provide Skills (e.g., list_objects, write_object)"
AIGNE-Framework.MCPAgent -> MCP-Server: "3. Execute Skill (e.g., write 'report.md')"
MCP-Server -> DID-Spaces: "4. Perform File Operation"
DID-Spaces -> MCP-Server: "5. Return Result"
MCP-Server -> AIGNE-Framework.MCPAgent: "6. Send Result to Agent"
```

Key functionalities demonstrated include:
- Connecting to a DID Spaces MCP server.
- Dynamically loading available skills (e.g., `list_objects`, `write_object`).
- Executing basic file operations such as checking metadata, listing objects, and writing a new file.
- Saving a markdown report of the results.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

*   **Node.js**: Version 20.0 or higher.
*   **AI Model Provider API Key**: An API key from a provider like OpenAI is required.
*   **DID Spaces MCP Server Credentials**: You will need the URL and authorization key for your DID Spaces instance.

The following dependencies are optional and are only required if you intend to run the example from the cloned source code:

*   **pnpm**: For package management.
*   **Bun**: For running tests and examples.

## Quick Start

You can run this example directly without a local installation using `npx`.

### 1. Set Environment Variables

First, you need to configure the credentials for your DID Spaces server. Open your terminal and export the following environment variables.

To get your `DID_SPACES_AUTHORIZATION` key:
1.  Navigate to your Blocklet.
2.  Go to **Profile -> Settings -> Access Keys**.
3.  Click **Create** and set the **Auth Type** to "Simple".
4.  Copy the generated key.

```bash Set Environment Variables icon=lucide:terminal
# Replace with your DID Spaces URL
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# Replace with your generated Access Key
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. Connect to an AI Model

The agent requires a connection to a Large Language Model (LLM) to function. When you run the example for the first time, you will be prompted to connect to an AI model with several options.

#### Option A: Connect via AIGNE Hub (Recommended)

You can choose to connect via the official AIGNE Hub. Your browser will open a page to guide you through the process. New users receive a complimentary token allocation to get started. Alternatively, if you have a self-hosted AIGNE Hub instance, you can select that option and enter its URL.

#### Option B: Connect via a Third-Party Provider

You can configure an API key from a third-party provider like OpenAI directly through an environment variable.

```bash Configure OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="sk-..." # Set your OpenAI API key here
```

For more examples of configuring different model providers (e.g., DeepSeek, Google Gemini), refer to the `.env.local.example` file in the source code.

### 3. Run the Example

Once your environment is configured, run the following command to start the chatbot:

```bash Run the example icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

The script will execute the following steps:
1.  Test the connection to the MCP DID Spaces server.
2.  Perform three operations: check metadata, list objects, and write a file.
3.  Display the results in the console.
4.  Save a complete markdown report to your local file system and show the file path.

## How It Works

This example leverages an `MCPAgent` to connect to a DID Spaces server. The Model Context Protocol (MCP) acts as a standardized interface, allowing the agent to discover and utilize skills provided by the server.

-   **Dynamic Skill Loading**: The `MCPAgent` queries the MCP server and dynamically loads all available skills. This means you don't need to predefine the agent's capabilities in your code.
-   **Secure Authentication**: The connection to DID Spaces is secured using the provided authorization credentials.
-   **Real-time Interaction**: The agent interacts with DID Spaces in real-time to perform operations.

The available skills typically include:

| Skill | Description |
| :--- | :--- |
| `head_space` | Get metadata about the DID Space. |
| `read_object` | Read content from an object in the DID Space. |
| `write_object` | Write content to an object in the DID Space. |
| `list_objects` | List objects in a directory within the DID Space. |
| `delete_object` | Delete an object from the DID Space. |

## Configuration

In a production environment, you would typically host your own MCP server for DID Spaces. The `MCPAgent` can be configured to point to your custom endpoint and use your specific authentication tokens.

The following code snippet shows how to initialize the `MCPAgent` with custom parameters:

```typescript MCPAgent Initialization
import { MCPAgent } from '@aigne/mcp-agent';

const mcpAgent = await MCPAgent.from({
  url: 'YOUR_MCP_SERVER_URL',
  transport: 'streamableHttp',
  opts: {
    requestInit: {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    },
  },
});
```

## Running from Source

If you prefer to run the example from a local clone of the repository, follow these steps.

### 1. Clone the Repository

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example directory and install the necessary packages using `pnpm`.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. Run the Example

Start the application with the `pnpm start` command.

```bash Run the example icon=lucide:terminal
pnpm start
```

## Testing and Debugging

### Running Tests

To verify that the integration is working correctly, you can run the test suite. The tests will connect to the MCP server, list the available skills, and execute basic DID Spaces operations.

```bash Run the test suite icon=lucide:terminal
pnpm test:llm
```

### Observing Agent Behavior

The `aigne observe` command starts a local web server for monitoring and analyzing agent execution data. This tool is essential for debugging, performance tuning, and understanding how your agent interacts with models and tools. It provides a user-friendly interface to inspect traces and view detailed call information.

```bash Start the observation server icon=lucide:terminal
aigne observe
```

## Summary

This example provides a practical guide to integrating AIGNE agents with external services like DID Spaces using the Model Context Protocol. You have learned how to configure, run, and test an agent that can perform decentralized storage operations.

For more information on related concepts, refer to the following documentation:

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-href="/developer-guide/agents/mcp-agent" data-icon="lucide:box">Learn more about the MCPAgent and how it interacts with external services.</x-card>
  <x-card data-title="DID Spaces Memory" data-href="/examples/memory-did-spaces" data-icon="lucide:database">See an example of using DID Spaces for persistent agent memory.</x-card>
</x-cards>