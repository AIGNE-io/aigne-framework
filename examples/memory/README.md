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

### Run the Example

```bash
# Run the chatbot with memory
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'

# Run in interactive chat mode
npx -y @aigne/example-memory --chat
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the App Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

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
cd aigne-framework/examples/memory

pnpm install
```

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
