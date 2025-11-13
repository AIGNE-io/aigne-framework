# Memory

Want to build a chatbot that remembers you? This guide demonstrates how to create a chatbot with persistent memory using the AIGNE Framework and the `FSMemory` plugin. You'll learn how to enable an agent to recall information from previous conversations, leading to more continuous and context-aware interactions.

## Overview

For a chatbot to be truly effective, it needs to remember past interactions. This example showcases how to achieve this using the `FSMemory` plugin, which saves conversation data to the local file system. This allows the chatbot to maintain state across different sessions, providing a more personalized user experience.

This document will guide you through running the example, connecting it to an AI model, and understanding the mechanics of how memory is recorded and retrieved. For an alternative persistence method using decentralized storage, refer to the [DID Spaces Memory](./examples-memory-did-spaces.md) example.

## Prerequisites

Before you begin, ensure you have the following:

*   **Node.js**: Version 20.0 or higher.
*   **OpenAI API Key**: An API key is required to connect to OpenAI models. You can get one from the [OpenAI Platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly from your terminal without a local installation, thanks to `npx`.

### Run the Example

Execute the following commands. The first command gives the chatbot a piece of information, and the second tests its ability to recall it.

```sh Run the chatbot with memory icon=lucide:terminal
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

For a more natural, back-and-forth conversation, you can launch the chatbot in interactive mode.

```sh Run in interactive chat mode icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### Connect to an AI Model

The agent needs to connect to an AI model to function. The first time you run the example, you'll be prompted to choose a connection method.

#### 1. AIGNE Hub (Recommended)

The simplest method is to connect via the official AIGNE Hub. Choose the first option, and your browser will open for authentication. New users automatically receive a generous token allocation to get started.

![Connect to AIGNE Hub](../images/connect-to-aigne-hub.png)

#### 2. Self-Hosted AIGNE Hub

If your organization uses a self-hosted AIGNE Hub, select the second option and provide your instance's URL to connect.

![Connect to a self-hosted AIGNE Hub](../images/connect-to-self-hosted-aigne-hub.png)

#### 3. Third-Party Model Provider

You can also connect directly to a third-party provider like OpenAI. To do this, configure your API key as an environment variable before running the example.

```sh Set your OpenAI API key icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

After setting the key, run the `npx` command again. For more configuration examples, see the `.env.local.example` file in the project source.

## Local Installation

If you prefer to examine the code or make modifications, you can set up the project locally.

### 1. Clone the Repository

Start by cloning the `aigne-framework` repository from GitHub.

```sh Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate into the example's directory and install the required packages using `pnpm`.

```sh Install dependencies icon=lucide:terminal
cd aigne-framework/examples/memory
pnpm install
```

### 3. Run the Example

With the dependencies installed, you can execute the example with the `start` script.

```sh Run the example locally icon=lucide:terminal
pnpm start
```

## How Memory Works

The memory functionality is powered by two core modules within the AIGNE Framework's Augmented File System (AFS): `history` and `UserProfileMemory`.

### Recording Conversations

1.  **History Logging**: When a user sends a message and the AI responds, this conversational pair is saved into the `history` module of AFS.
2.  **Profile Extraction**: The `UserProfileMemory` module analyzes the conversation and extracts key details about the user, such as their name or preferences. This information is then stored separately in the `user_profile` module of AFS.

### Retrieving Conversations

When the user sends a new message, the framework retrieves the stored information to provide the AI model with the necessary context.

1.  **Inject User Profile**: The system first loads the user's profile and injects it directly into the system prompt within a `<related-memories>` block. This ensures the agent is immediately aware of key facts.

    ```text System Prompt with Memory
    You are a friendly chatbot
    
    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color
    
    </related-memories>
    ```

2.  **Inject Conversation History**: Next, the recent conversation history is formatted into a series of messages. This history, combined with the system prompt, is sent to the AI model.

    ```json Injected Chat Messages
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..." 
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "I'm Bob and I like blue color" }]
      },
      {
        "role": "agent",
        "content": [{ "type": "text", "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?" }]
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "What is my favorite color?" }]
      }
    ]
    ```

3.  **Generate Response**: The AI model processes the entire payload—system prompt, user profile, and chat history—to generate a contextually appropriate response.

    **AI Response:**
    ```text
    You mentioned earlier that you like the color blue
    ```

## Debugging

To inspect the agent's behavior, use the `aigne observe` command. This starts a local web server that provides a detailed, user-friendly interface for viewing execution traces. It is an essential tool for debugging, performance tuning, and understanding how your agent processes information.

![Execute aigne observe](../images/aigne-observe-execute.png)

Once running, you can access the web UI to see a list of recent executions and drill down into the details of each call.

![List of recent executions in aigne observe](../images/aigne-observe-list.png)

## Summary

This example has shown how to build a chatbot with persistent memory using the AIGNE Framework. By utilizing the `FSMemory` plugin, agents can store and recall conversation history and user profiles, creating more intelligent and personalized interactions.

For further reading, explore these related topics:

<x-cards data-columns="2">
  <x-card data-title="DID Spaces Memory" data-icon="lucide:database" data-href="/examples/memory-did-spaces">
    Learn how to use decentralized storage for memory persistence with DID Spaces.
  </x-card>
  <x-card data-title="Core Concepts: Memory" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/memory">
    Dive deeper into the architectural concepts behind memory in the AIGNE Framework.
  </x-card>
</x-cards>