# MCP DID Spaces Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot with MCP (Model Context Protocol) DID Spaces integration using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes MCP to provide access to DID Spaces functionality through skills.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* DID Spaces MCP server credentials
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

### Run the Example

```bash
# @example: https://spaces.staging.arcblock.io/app
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"
# In Blocklet, go to Profile -> Settings -> Access Keys, click Create, and set Auth Type to "Simple".
export DID_SPACES_AUTHORIZATION="blocklet-xxx"

# Run the MCP test example
npx -y @aigne/example-mcp-did-spaces
```

### Connect to an AI Model

As an example, running `TBD"` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the Blocklet Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![connect to self hosted aigne hub](../images/connect-to-self-hosted-aigne-hub.png)

- Connect via a third-party model provider

Using OpenAI as an example, you can configure the provider's API key via environment variables. After configuration, run the example again:

```bash
export OPENAI_API_KEY="" # Set your OpenAI API key here
```
For more details on third-party model configuration (e.g., OpenAI, DeepSeek, Google Gemini), see [.env.local.example](./.env.local.example).

After configuration, run the example again.

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent’s behavior during runtime. This tool is essential for debugging, performance tuning, and gaining insight into how your agent processes information and interacts with tools and models.

Start the observation server.

![aigne-observe-execute](../images/aigne-observe-execute.png)

View a list of recent executions.

![aigne-observe-list](../images/aigne-observe-list.png)

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/mcp-did-spaces

pnpm install
```

### Run the Example

```bash
pnpm start
```

The example will:

1. Test MCP DID Spaces with 3 simple operations (check metadata, list objects, write file)
2. Display all results in the console with proper markdown formatting
3. Automatically save a complete markdown report file
4. Show you the filename where results are saved for easy viewing

## How MCP DID Spaces Integration Works

This example uses the Model Context Protocol (MCP) to connect to DID Spaces services. The MCP agent provides various skills that allow the chatbot to interact with DID Spaces functionality.

Key features of the MCP DID Spaces implementation:

* Dynamic skill loading from MCP server
* Real-time access to DID Spaces operations
* Secure authentication with DID Spaces
* Extensible architecture for adding new DID Spaces features

Available skills typically include:

* `head_space` - Get metadata about the DID Space
* `read_object` - Read content from objects in DID Space
* `write_object` - Write content to objects in DID Space
* `list_objects` - List objects in DID Space directories
* `delete_object` - Delete objects from DID Space

## Example Usage

The example demonstrates MCP DID Spaces capabilities by:

1. Checking DID Space metadata and configuration
2. Listing objects and directories in the DID Space
3. Writing new files to the DID Space

All operations are performed through MCP protocol integration.

## Configuration

The example uses a pre-configured MCP DID Spaces server endpoint and authentication. In a production environment, you would:

1. Set up your own MCP server for DID Spaces
2. Configure proper authentication credentials
3. Update the URL and auth parameters in the code

```typescript
const mcpAgent = await MCPAgent.from({
  url: "YOUR_MCP_SERVER_URL",
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  },
});
```

## MCP Skills

The MCP agent automatically discovers and loads available skills from the DID Spaces MCP server. These skills are then made available to the AI agent, allowing it to perform DID Spaces operations based on user requests.

## Testing

Run the test suite to verify MCP DID Spaces functionality:

```bash
pnpm test:llm
```

The test will:

1. Connect to the MCP server
2. List available skills
3. Test basic DID Spaces operations
4. Verify the integration is working correctly
