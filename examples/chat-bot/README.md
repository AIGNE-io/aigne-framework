# Chatbot Example

This example demonstrates how to create and run an agent-based chatbot using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example now supports both one-shot and interactive chat modes, along with customizable model settings and pipeline input/output.

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services

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
| `--model <provider[:model]>` | AI model to use in format 'provider[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | Temperature for model generation | Provider default |
| `--top-p <value>` | Top-p sampling value | Provider default |
| `--presence-penalty <value>` | Presence penalty value | Provider default |
| `--frequency-penalty <value>` | Frequency penalty value | Provider default |
| `--log-level <level>` | Set logging level (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | Specify input directly | None |
