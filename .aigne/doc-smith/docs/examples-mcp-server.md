# MCP Server

This guide provides a comprehensive walkthrough for running AIGNE Framework agents as a Model Context Protocol (MCP) Server. By following these steps, you will be able to expose your custom agents as tools for any MCP-compatible client, such as Claude Code, effectively extending the capabilities of your AI assistants.

## Overview

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard designed to enable AI assistants to securely connect with a wide range of data sources and tools. By implementing an MCP server, you can make your AIGNE agents available to any client that supports the protocol. This allows you to augment AI assistants with specialized skills and functionalities defined within your agents.

This example demonstrates how to use the [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) to serve agents from the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and connect them to clients like Claude Code.

The following diagram illustrates the workflow of running AIGNE Framework agents as an MCP Server and connecting them to an MCP-compatible client like Claude Code:

```d2
direction: down

Client: {
  label: "MCP Client\n(e.g., Claude Code)"
  shape: rectangle
}

Developer: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

MCP-Server-Container: {
  label: "MCP Server (localhost)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Server: {
    label: "@aigne/example-mcp-server"
  }

  AIGNE-Agents: {
    label: "AIGNE Framework Agents"
    shape: rectangle
    grid-columns: 3

    Current-Time-Agent: {
      label: "Current Time Agent"
    }
    Poet-Agent: {
      label: "Poet Agent"
    }
    System-Info-Agent: {
      label: "System Info Agent"
    }
  }
}

Model-Providers: {
  label: "AI Model Providers"
  shape: rectangle

  Official-AIGNE-Hub: {
    label: "Official AIGNE Hub"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "Self-Hosted AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "Third-Party Provider\n(e.g., OpenAI)"
  }
}

Observability-Server: {
  label: "AIGNE Observability Server"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. npx ... serve-mcp"
Developer -> Client: "2. claude mcp add ..."
Client -> MCP-Server-Container.MCP-Server: "3. Invokes agent skill"
MCP-Server-Container.MCP-Server -> MCP-Server-Container.AIGNE-Agents: "4. Executes agent logic"
MCP-Server-Container.AIGNE-Agents -> Model-Providers: "5. Connects to AI model"
Model-Providers -> MCP-Server-Container.AIGNE-Agents: "6. Returns model output"
MCP-Server-Container.AIGNE-Agents -> MCP-Server-Container.MCP-Server: "7. Sends result"
MCP-Server-Container.MCP-Server -> Client: "8. Returns skill output"
Developer -> AIGNE-CLI: "(Optional) npx aigne observe"
AIGNE-CLI -> Observability-Server: "Starts server"
MCP-Server-Container.MCP-Server -> Observability-Server: "Sends execution traces"
```

## Prerequisites

Before you begin, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with your Node.js installation.
*   **OpenAI API Key**: Required for agents that interact with OpenAI models. You can obtain one from the [OpenAI API keys page](https://platform.openai.com/api-keys).

## Quick Start

You can start the MCP server directly without any local installation using `npx`.

### 1. Run the MCP Server

Execute the following command in your terminal to start the server on port `3456`:

```bash serve-mcp.sh icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

Upon successful startup, you will see the following output, indicating that the server is running and ready to accept connections.

```bash Output
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. Connect to an AI Model

The agents served by the MCP server require an underlying AI model to function. When you run the server for the first time, you will be prompted to connect to a model provider. You have several options:

#### Option A: Connect via the Official AIGNE Hub

This is the recommended option for new users.
1.  Select the first option in the terminal prompt.
2.  Your web browser will open the official AIGNE Hub website.
3.  Follow the on-screen instructions to log in or sign up. New users automatically receive a starting balance of 400,000 tokens.

#### Option B: Connect via a Self-Hosted AIGNE Hub

If you have a self-hosted instance of AIGNE Hub:
1.  Choose the second option.
2.  Enter the URL of your self-hosted AIGNE Hub.
3.  Follow the prompts to complete the connection.
    - To set up your own AIGNE Hub, you can install it from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

#### Option C: Connect via a Third-Party Model Provider

You can connect directly to a third-party provider like OpenAI by setting an environment variable for the API key.

```bash configure-api-key.sh icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

After setting the environment variable, restart the MCP server command. For information on configuring other providers such as DeepSeek or Google Gemini, refer to the `.env.local.example` file within the example project.

## Available Agents

This example exposes several pre-built agents as MCP tools, each with a distinct function:

*   **Current Time Agent** (`agents/current-time.js`): Provides the current date and time.
*   **Poet Agent** (`agents/poet.yaml`): Generates poetry and other creative text formats.
*   **System Info Agent** (`agents/system-info.js`): Retrieves and displays information about the host system.

## Connecting to MCP Clients

Once your MCP server is running, you can connect it to any compatible client. The following example uses [Claude Code](https://claude.ai/code).

### Add the MCP Server to Claude Code

Run the following command to add your local MCP server as a tool source named `test` in Claude Code:

```bash add-mcp-server.sh icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

### Invoke Agents from Claude Code

You can now invoke the agents' skills directly from the Claude Code interface.

**Example 1: Invoking the System Info Agent**
To get system information, you can ask a question that triggers the `system-info` skill.

![Invoking the System Info agent from Claude Code](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

**Example 2: Invoking the Poet Agent**
To generate a poem, phrase a request that calls the `poet` skill.

![Invoking the Poet agent from Claude Code](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## Debugging and Observation

The AIGNE Framework includes a powerful observability tool that allows you to monitor and debug agent executions in real time.

### Start the Observability Server

To launch the local monitoring dashboard, run the following command in a new terminal window:

```bash aigne-observe.sh icon=lucide:terminal
npx aigne observe --port 7890
```

### View Execution Traces

Open your web browser and navigate to `http://localhost:7890`. The dashboard provides a user-friendly interface to inspect traces, view detailed information about each agent call, and understand the flow of execution. This is an essential tool for debugging, performance tuning, and gaining insight into your agent's behavior.

![Viewing a trace for the Poet Agent in the AIGNE observability dashboard.](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## Summary

You have now successfully started an MCP server, exposed AIGNE agents as tools, and connected them to an MCP client. This powerful pattern allows you to create custom, reusable skills and integrate them seamlessly into AI assistant workflows.

For more advanced examples and agent types, you can explore other documents in the [Examples](./examples.md) section. To learn more about creating your own agents, refer to the [Developer Guide](./developer-guide-core-concepts-agents.md).