# Memory Example

This example demonstrates how to create a chatbot with memory capabilities using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `FSMemory` plugin to provide persistence across chat sessions.

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
- Optional dependencies (if running the example from source code):
  - [Pnpm](https://pnpm.io) for package management
  - [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run the chatbot with memory
npx -y @aigne/example-memory
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

### Run the Example

```bash
pnpm start
```

## How Memory Works

This example uses the `FSMemory` plugin from `@aigne/agent-library` to persist conversation history. The memory is stored in files within the `memories` directory, allowing the chatbot to remember previous interactions across different chat sessions.

Key features of the memory implementation:

- Conversations are stored in a file system for persistence
- The chatbot can recall previous interactions even after restarting
- You can test this by chatting with the bot, closing the session, and starting a new one

## Example Usage

Try using the chatbot in these ways to test its memory capabilities:

1. Introduce yourself to the chatbot
2. Ask it a question or have a conversation
3. Close the session and restart the chatbot
4. Ask the chatbot if it remembers your previous conversation

The chatbot should be able to recall information from your previous interactions.
