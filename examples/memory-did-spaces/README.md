# Memory DID Spaces Example

This example demonstrates how to create a chatbot with DID Spaces memory capabilities using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `DIDSpacesMemory` plugin to provide persistence across chat sessions using DID Spaces.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* DID Spaces credentials for memory persistence
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run the chatbot with DID Spaces memory
npx -y @aigne/example-memory-did-spaces --input 'I like Bitcoin and my work is engineering'
npx -y @aigne/example-memory-did-spaces --input 'What is my favorite cryptocurrency?'

# Run in interactive chat mode
npx -y @aigne/example-memory-did-spaces --chat
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/memory-did-spaces

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

## How DID Spaces Memory Works

This example uses the `DIDSpacesMemory` plugin from `@aigne/agent-library` to persist conversation history using DID Spaces. The memory is stored in a decentralized manner, allowing the chatbot to remember previous interactions across different chat sessions.

Key features of the DID Spaces memory implementation:

* Conversations are stored in DID Spaces for decentralized persistence
* The chatbot can recall previous interactions even after restarting
* Secure and private memory storage using DID technology
* You can test this by chatting with the bot, closing the session, and starting a new one

## Example Usage

Try using the chatbot in these ways to test its memory capabilities:

1. Introduce yourself to the chatbot and share your interests
2. Ask it a question or have a conversation about cryptocurrencies
3. Close the session and restart the chatbot
4. Ask the chatbot if it remembers your previous conversation

The chatbot should be able to recall information from your previous interactions stored in DID Spaces.

## Configuration

The example uses a pre-configured DID Spaces endpoint and authentication. In a production environment, you would:

1. Set up your own DID Spaces instance
2. Configure proper authentication credentials
3. Update the URL and auth parameters in the code

```typescript
memory: new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_TOKEN",
  },
})
``` 