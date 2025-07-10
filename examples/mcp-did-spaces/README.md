# MCP DID Spaces Example

This example demonstrates how to create a chatbot with MCP (Model Context Protocol) DID Spaces integration using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes MCP to provide access to DID Spaces functionality through skills.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* DID Spaces MCP server credentials
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run the chatbot with MCP DID Spaces integration
npx -y @aigne/example-mcp-did-spaces --input 'What DID Spaces features are available?'

# Run in interactive chat mode
npx -y @aigne/example-mcp-did-spaces --chat
```

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

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
```

#### Using Different Models

You can use different AI models by setting the `MODEL` environment variable along with the corresponding API key. The framework supports multiple providers:

* **OpenAI**: `MODEL="openai:gpt-4.1"` with `OPENAI_API_KEY`
* **Anthropic**: `MODEL="anthropic:claude-3-7-sonnet-latest"` with `ANTHROPIC_API_KEY`
* **Google Gemini**: `MODEL="gemini:gemini-2.0-flash"` with `GEMINI_API_KEY`
* **AWS Bedrock**: `MODEL="bedrock:us.amazon.nova-premier-v1:0"` with AWS credentials
* **DeepSeek**: `MODEL="deepseek:deepseek-chat"` with `DEEPSEEK_API_KEY`
* **OpenRouter**: `MODEL="openrouter:openai/gpt-4o"` with `OPEN_ROUTER_API_KEY`
* **xAI**: `MODEL="xai:grok-2-latest"` with `XAI_API_KEY`
* **Ollama**: `MODEL="ollama:llama3.2"` with `OLLAMA_DEFAULT_BASE_URL`

For detailed configuration examples, please refer to the `.env.local.example` file in this directory.

### Run the Example

```bash
pnpm start
```

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

Try using the chatbot in these ways to test its MCP DID Spaces capabilities:

1. Ask about available DID Spaces features
2. Request to read or write data to DID Spaces
3. Explore the metadata of your DID Space
4. List objects in your DID Space directories

The chatbot can perform various DID Spaces operations through the MCP integration.

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