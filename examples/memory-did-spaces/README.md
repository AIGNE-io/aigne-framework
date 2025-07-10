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

# Run the memory test example
npx -y @aigne/example-memory-did-spaces
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

Create a `.env.local` file and configure the required environment variables. See [CONFIG.md](CONFIG.md) for detailed configuration instructions.

**Quick Setup:**
```bash
# Copy the example configuration
cp CONFIG.md .env.local

# Edit the file and add your API keys
OPENAI_API_KEY=your_openai_api_key_here
DID_SPACES_URL=https://your-did-spaces-url.com/app
DID_SPACES_AUTHORIZATION=Bearer your-did-spaces-token
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

For detailed configuration examples, please refer to the [CONFIG.md](CONFIG.md) file in this directory.

### Run the Example

```bash
pnpm start
```

The example will:
1. Test DID Spaces memory with 3 simple tests (store profile, recall preferences, create portfolio)
2. Display all results in the console with proper markdown formatting
3. Automatically save a complete markdown report file
4. Show you the filename where results are saved for easy viewing

## How DID Spaces Memory Works

This example uses the `DIDSpacesMemory` plugin from `@aigne/agent-library` to persist conversation history using DID Spaces. The memory is stored in a decentralized manner, allowing the chatbot to remember previous interactions across different chat sessions.

Key features of the DID Spaces memory implementation:

* Conversations are stored in DID Spaces for decentralized persistence
* The chatbot can recall previous interactions even after restarting
* Secure and private memory storage using DID technology
* You can test this by chatting with the bot, closing the session, and starting a new one

## Example Usage

The example demonstrates memory persistence by:

1. Storing user profile information (name, profession, investment preferences)
2. Recalling stored information in subsequent interactions
3. Creating personalized recommendations based on remembered data

All conversation history is persisted in DID Spaces across sessions.

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