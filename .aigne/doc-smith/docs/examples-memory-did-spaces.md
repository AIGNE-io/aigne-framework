This document will guide you through building a chatbot with persistent memory using DID Spaces and the AIGNE Framework. You will learn how to leverage the `DIDSpacesMemory` plugin, enabling your agent to retain conversation history across multiple sessions in a secure, decentralized manner.

# DID Spaces Memory

## Overview

This example demonstrates how to integrate persistent memory into an AI agent. Unlike stateless chatbots that forget past interactions, this example showcases an agent capable of storing user profile information, recalling preferences from previous conversations, and providing personalized responses based on stored memory.

This functionality is achieved using the `DIDSpacesMemory` plugin from the `@aigne/agent-library`, which connects to a DID Spaces instance to store and retrieve conversation history.

## Prerequisites

Before proceeding, ensure the following are installed and configured:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js.
*   **OpenAI API Key**: Required for the language model. Obtain one from the [OpenAI platform](https://platform.openai.com/api-keys).
*   **DID Spaces Credentials**: Necessary for memory persistence.

## Quick Start

You can run this example directly from your terminal without a local installation by using `npx`.

### 1. Run the Example

Execute the following command in your terminal:

```bash memory-did-spaces icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. Connect to an AI Model

The agent requires a connection to a large language model. On your first run, you will be prompted to connect to a model provider.

![Connect to an AI Model](https://static.AIGNE.io/aigne-docs/images/examples/run-example.png)

You have several connection options:

*   **AIGNE Hub (Official)**: This is the simplest method. Your browser will open the official AIGNE Hub, where you can log in. New users receive complimentary tokens to begin experimenting immediately.

    ![Connect to Official AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-aigne-hub.png)

*   **AIGNE Hub (Self-Hosted)**: If you operate your own AIGNE Hub instance, choose this option and enter its URL. You can deploy a self-hosted AIGNE Hub from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

    ![Connect to Self-Hosted AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-self-hosted-aigne-hub.png)

*   **Third-Party Model Provider**: You can connect directly to a provider such as OpenAI. To do this, set your API key as an environment variable before executing the command.

    ```bash Export OpenAI Key icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    For additional configuration options with providers like DeepSeek or Google Gemini, consult the `.env.local.example` file in the source repository.

After configuring the model connection, run the `npx` command again to start the chatbot.

## Local Installation and Execution

For developers who want to examine the source code or make modifications, follow these steps to run the example locally.

### 1. Clone the Repository

First, clone the official AIGNE Framework repository:

```bash Clone Repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and install the required dependencies using pnpm.

```bash Install Dependencies icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. Run the Example

Start the application by executing the `start` script.

```bash Run Example icon=lucide:terminal
pnpm start
```

The script will run a series of tests to showcase the memory capabilities, save the results to a Markdown file, and display the file path in the console for your review.

## How It Works

This example utilizes the `DIDSpacesMemory` plugin to provide the agent with a persistent and decentralized memory. The following diagram illustrates this workflow:

```d2
direction: down

User: {
  shape: c4-person
}

AI-Agent: {
  label: "AI Agent"
  shape: rectangle

  DIDSpacesMemory-Plugin: {
    label: "DIDSpacesMemory Plugin"
  }
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

User -> AI-Agent: "2. User sends message"
AI-Agent -> User: "7. Agent sends context-aware response"

AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "1. Initialize with credentials"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "3. Retrieve conversation history"
DID-Spaces -> AI-Agent.DIDSpacesMemory-Plugin: "4. Provide context to agent"
AI-Agent -> AI-Agent.DIDSpacesMemory-Plugin: "5. Process new interaction"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "6. Save updated history"

```

The process is as follows:

1.  **Initialization**: The agent is initialized with the `DIDSpacesMemory` plugin, configured with the URL and authentication credentials for a DID Spaces instance.
2.  **Interaction**: As you converse with the chatbot, each user input and agent response is recorded.
3.  **Storage**: The `DIDSpacesMemory` plugin automatically saves the conversation history to your designated DID Space.
4.  **Retrieval**: In subsequent sessions, the plugin retrieves the past conversation history, supplying the agent with the context needed to remember previous interactions.

This decentralized method ensures that the memory is secure, private, and portable, under the control of the user's DID.

## Configuration

The example includes a pre-configured DID Spaces endpoint for demonstration purposes. For a production environment, you must update the configuration to point to your own instance.

This configuration is applied when instantiating the `DIDSpacesMemory` plugin:

```typescript memory-config.ts icon=logos:typescript
import { DIDSpacesMemory } from '@aigne/agent-library';

// ...

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_AUTHENTICATION_TOKEN",
  },
});
```

Replace `"YOUR_DID_SPACES_URL"` and `"Bearer YOUR_AUTHENTICATION_TOKEN"` with your specific endpoint and credentials.

## Debugging

To monitor and analyze the agent's behavior, use the `aigne observe` command. This tool launches a local web server that offers a detailed view of the agent's execution traces. It is an essential tool for debugging, understanding information flow, and optimizing performance.

To start the observation server, run:

```bash aigne-observe icon=lucide:terminal
aigne observe
```

![AIGNE Observe Execution](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-execute.png)

The web interface will show a list of recent executions, allowing you to inspect the inputs, outputs, tool calls, and model interactions for each run.

![AIGNE Observe List](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-list.png)

## Summary

This example provides a functional demonstration of integrating persistent, decentralized memory into an AI agent using the AIGNE Framework and DID Spaces. By following this guide, you can create more intelligent and context-aware chatbots.

For further reading, please see the following sections:
<x-cards data-columns="2">
  <x-card data-title="Memory Concepts" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:book-open">Learn more about how memory works in the AIGNE Framework.</x-card>
  <x-card data-title="Framework Examples" data-href="/examples" data-icon="lucide:layout-template">Explore other practical examples and use cases.</x-card>
</x-cards>