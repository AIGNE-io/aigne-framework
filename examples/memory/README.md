# Memory Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot with memory capabilities using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `FSMemory` plugin to provide persistence across chat sessions.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run the chatbot with memory
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'

# Run in interactive chat mode
npx -y @aigne/example-memory --chat
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/memory

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

## How Memory Works

The memory functionality in this example is implemented using the `history` module and `UserProfileMemory` module,
which are part of the AIGNE Framework's Augmented File System (AFS). Here's a brief overview of how memory is recorded and retrieved during conversations.

### Recording Conversations

1. When the user sends a message and got a response from the AI model,
  the conversation pair (user message and AI response) is stored in the `history` module of the `AFS`.
2. The `UserProfileMemory` module extracts relevant user profile information (by analyzing the conversation history)
  from the conversation and stores it in the `user_profile` module of the `AFS`.

### Retrieving Conversations

1. Load User Profile Memory and prepare to inject into the system prompt to let the agent know about the user profile.

```text
You are a friendly chatbot

<related-memories>
- |
  name:
    - name: Bob
  interests:
    - content: likes blue color

</related-memories>
```

2. Inject conversation history into the chat messages

```json
[
  {
    "role": "system",
    "content": "You are a friendly chatbot ..." // UserProfileMemory injected here
  },
  // Followed by nearby conversation history
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "I'm Bob and I like blue color"
      }
    ]
  },
  {
    "role": "agent",
    "content": [
      {
        "type": "text",
        "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?"
      }
    ]
  },
  // Here is the last user message
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "What is my favorite color?"
      }
    ]
  }
]
```

3. The AI model processes the injected messages and generates a response based on the user's profile and conversation history.

AI Response:

```text
You mentioned earlier that you like the color blue
```
