# Chatbot Example

This example demonstrates how to create and run an agent-based chatbot using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example now supports both one-shot and interactive chat modes, along with customizable model settings and pipeline input/output.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run in one-shot mode (default)
npx -y @aigne/example-chat-bot

# Run in interactive chat mode
npx -y @aigne/example-chat-bot --chat

# Use pipeline input
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

## Installation

### Install AIGNE CLI

```bash
npm install -g @aigne/cli
```

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework

cd aigne-framework/examples/chat-bot
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file (you can rename `.env.local.example` to `.env.local`):

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
aigne run # Run in one-shot mode (default)

# Run in interactive chat mode
aigne run --chat

# Use pipeline input
echo "Tell me about AIGNE Framework" | aigne run
```

### Run Options

The example supports the following command-line parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--chat` | Run in interactive chat mode | Disabled (one-shot mode) |
| `--model <provider[:model]>` | AI model to use in format 'provider\[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | Temperature for model generation | Provider default |
| `--top-p <value>` | Top-p sampling value | Provider default |
| `--presence-penalty <value>` | Presence penalty value | Provider default |
| `--frequency-penalty <value>` | Frequency penalty value | Provider default |
| `--log-level <level>` | Set logging level (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | Specify input directly | None |
