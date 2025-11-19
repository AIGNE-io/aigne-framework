# MCP Server

This guide provides instructions on how to run AIGNE Framework agents as a Model Context Protocol (MCP) Server. By following these steps, you will be able to expose your custom agents as tools to any MCP-compatible client, such as Claude Code, extending their functionality.

## Overview

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard designed to enable AI assistants to securely connect with various data sources and tools. By operating AIGNE agents as MCP servers, you can augment MCP-compatible clients with the specialized capabilities of your agents.

## Prerequisites

Before proceeding, ensure the following requirements are met:

*   **Node.js:** Version 20.0 or higher must be installed. You can download it from [nodejs.org](https://nodejs.org).
*   **AI Model Provider:** An API key from a provider like [OpenAI](https://platform.openai.com/api-keys) is required for the agents to function.

## Quick Start

You can start the MCP server directly without a local installation by using `npx`.

### 1. Run the MCP Server

Execute the following command in your terminal to start the server on port `3456`:

```bash server.js icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

Upon successful execution, the server will start, and you will see the following output, indicating that the MCP server is active and accessible.

```bash
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. Connect to an AI Model

The agents require a connection to a Large Language Model (LLM) to process requests. If you run the server without configuring a model provider, you will be prompted to select a connection method.

![Initial connection prompt for AI model setup.](../../../examples/mcp-server/run-example.png)

You have three primary options for connecting to an AI model.

#### Option A: Connect to the Official AIGNE Hub

This is the recommended method for new users.

1.  Select the first option, "Connect to the Arcblock official AIGNE Hub."
2.  Your web browser will open to the AIGNE Hub authorization page.
3.  Follow the on-screen instructions to approve the connection. New users are automatically granted 400,000 tokens for evaluation purposes.

![AIGNE Hub authorization dialog.](../../../examples/images/connect-to-aigne-hub.png)

#### Option B: Connect to a Self-Hosted AIGNE Hub

If you operate your own instance of AIGNE Hub, select the second option.

1.  You will be prompted to enter the URL of your self-hosted AIGNE Hub.
2.  Provide the URL and follow the subsequent prompts to complete the connection.

For instructions on deploying a self-hosted AIGNE Hub, please visit the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![Prompt to enter self-hosted AIGNE Hub URL.](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### Option C: Connect via a Third-Party Model Provider

You can connect directly to a third-party model provider, such as OpenAI, by setting the appropriate API key as an environment variable.

For example, to use OpenAI, set the `OPENAI_API_KEY` variable:

```bash .env icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

After setting the environment variable, restart the MCP server command. For a list of supported variables for other providers like DeepSeek or Google Gemini, refer to the example configuration file in the repository.

## Available Agents

This example exposes several pre-built agents as MCP tools, each with a distinct function:

| Agent             | File Path                  | Description                           |
| ----------------- | -------------------------- | ------------------------------------- |
| Current Time      | `agents/current-time.js`   | Provides the current date and time.   |
| Poet              | `agents/poet.yaml`         | Generates poetry and creative text.   |
| System Info       | `agents/system-info.js`    | Reports information about the system. |

## Connecting to an MCP Client

Once the server is running, you can connect it to an MCP-compatible client. The following example uses [Claude Code](https://claude.ai/code).

1.  Add the running MCP server to Claude Code with the following command:

    ```bash icon=lucide:terminal
    claude mcp add -t http test http://localhost:3456/mcp
    ```

2.  Invoke the agents from within the client. For instance, you can request system information or ask for a poem.

    **Example: Invoking the System Info Agent**
    ![Invoking the system info agent from Claude Code.](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

    **Example: Invoking the Poet Agent**
    ![Invoking the poet agent from Claude Code.](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## Observing Agent Activity

AIGNE includes an observability tool that allows you to monitor and debug agent executions in real-time.

1.  Start the observability server by running the following command in a new terminal window:

    ```bash icon=lucide:terminal
    npx aigne observe --port 7890
    ```

    ![Terminal output after starting the AIGNE observe server.](../../../examples/images/aigne-observe-execute.png)

2.  Open your web browser and navigate to `http://localhost:7890`.

The dashboard provides a user-friendly interface to inspect execution traces, view detailed call information, and understand agent behavior. This is an essential tool for debugging, performance tuning, and gaining insight into how your agents process information.

![List of recent executions in the observability UI.](../../../examples/images/aigne-observe-list.png)

Below is an example of a detailed trace for a request handled by the Poet Agent.

![Detailed trace view for the Poet Agent.](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## Summary

You have successfully started an MCP server, connected it to an AI model, and exposed AIGNE agents as tools to an MCP client. This allows you to extend the capabilities of AI assistants with custom logic and data sources.

For more advanced examples and agent types, please explore the following sections:

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    Learn how to connect to and interact with external systems via the Model Context Protocol (MCP).
  </x-card>
  <x-card data-title="MCP GitHub Example" data-icon="lucide:github" data-href="/examples/mcp-github">
    See an example of interacting with GitHub repositories using an MCP Server.
  </x-card>
</x-cards>