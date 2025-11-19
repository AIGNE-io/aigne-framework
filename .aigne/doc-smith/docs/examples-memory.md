# Memory

This guide provides a step-by-step process for building a chatbot that remembers previous conversations. By following these instructions, you will create a stateful agent that uses the `FSMemory` plugin to persist session data, enabling continuous and context-aware interactions.

## Overview

This example demonstrates how to implement memory in a chatbot using the AIGNE Framework. The agent leverages the `FSMemory` plugin, which stores conversation history and user profile information on the local file system. This allows the chatbot to recall past interactions within a session, providing a more personalized and coherent user experience.

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js**: Version 20.0 or higher.
*   **npm**: Included with Node.js installation.
*   **OpenAI API Key**: Required for connecting to OpenAI models. You can obtain a key from the [OpenAI API keys](https://platform.openai.com/api-keys) page.

## Quick Start

You can run this example directly without a local installation using `npx`.

### Run the Example

Execute the following commands in your terminal to interact with the memory-enabled chatbot. The first command informs the bot of your preference, and the second command tests its ability to recall that information.

```bash Run the chatbot with memory icon=lucide:terminal
# Send the first message to establish a fact
npx -y @aigne/example-memory --input 'I like blue color'

# Send a second message to test the chatbot's memory
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

To engage in a continuous conversation, run the chatbot in interactive mode:

```bash Run in interactive chat mode icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### Connecting to an AI Model

The chatbot requires a connection to a Large Language Model (LLM) to function. If you have not configured a model provider, the CLI will prompt you to choose a connection method upon the first run.

![Initial connection prompt for the AI model](../../../examples/memory/run-example.png)

You have three primary options for connecting to an AI model:

#### 1. Connect via the Official AIGNE Hub (Recommended)

This is the simplest method. AIGNE Hub is a service that provides access to various models and includes free credits for new users.

1.  Select the first option: `Connect to the Arcblock official AIGNE Hub`.
2.  Your web browser will open to the AIGNE Hub authorization page.
3.  Follow the on-screen instructions to approve the connection. New users will receive a complimentary grant of 400,000 tokens.

![Authorize AIGNE CLI to connect to AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. Connect via a Self-Hosted AIGNE Hub

If your organization runs a private instance of AIGNE Hub, you can connect to it directly.

1.  Select the second option: `Connect to your self-hosted AIGNE Hub`.
2.  Enter the URL of your self-hosted AIGNE Hub instance when prompted.
3.  Follow the subsequent prompts to complete the connection.

For instructions on deploying a self-hosted AIGNE Hub, refer to the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

![Enter the URL for a self-hosted AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. Connect via a Third-Party Model Provider

You can connect directly to a third-party model provider, such as OpenAI, by configuring the appropriate API key as an environment variable.

For example, to connect to OpenAI, set the `OPENAI_API_KEY` environment variable:

```bash Set the OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key" # Replace with your actual key
```

After setting the environment variable, run the example again. For a list of supported providers and their corresponding environment variables, refer to the [`.env.local.example`](https://github.com/AIGNE-io/aigne-framework/blob/main/examples/memory/.env.local.example) file.

## How Memory Works

The memory functionality is implemented using the `history` and `UserProfileMemory` modules, which are components of the AIGNE Framework's Augmented File System (AFS).

The following diagram illustrates how the chatbot records and retrieves information to maintain context across conversations.

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
  }

  UserProfileMemory: {
    label: "UserProfileMemory"
  }

  AFS: {
    label: "Augmented File System (AFS)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }

    history: {
      label: "history"
      shape: cylinder
    }

    user-profile: {
      label: "user_profile"
      shape: cylinder
    }
  }
}

AI-Model: {
  label: "AI Model (LLM)"
}

# Recording Flow
User -> AIGNE-Framework.AI-Agent: "1. Sends message"
AIGNE-Framework.AI-Agent -> User: "2. Receives response"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "3. Saves conversation"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.history: "4. Analyzes history"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.user-profile: "5. Stores extracted profile"

# Retrieval Flow
User -> AIGNE-Framework.AI-Agent: "6. Sends new message"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.user-profile: "7. Loads user profile"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "8. Loads chat history"
AIGNE-Framework.AI-Agent -> AI-Model: "9. Sends prompt with context"
AI-Model -> AIGNE-Framework.AI-Agent: "10. Generates response"
AIGNE-Framework.AI-Agent -> User: "11. Delivers informed response"
```

### Recording Conversations

1.  After the user sends a message and receives a response, the conversation pair (user input and AI output) is saved to the `history` module in AFS.
2.  Simultaneously, the `UserProfileMemory` module analyzes the conversation history to extract and infer user profile details (e.g., name, preferences). This information is then stored in the `user_profile` module in AFS.

### Retrieving Conversations

When a new user message is received, the framework retrieves stored information to provide context to the AI model.

1.  **Load User Profile**: The agent loads the data from `UserProfileMemory` and injects it into the system prompt. This ensures the AI is aware of the user's profile from the start.

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

2.  **Inject Conversation History**: Recent conversation turns from the `history` module are appended to the message list, providing immediate conversational context.

    ```json Chat Messages with History
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..."
      },
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

3.  **Generate Response**: The AI model processes the complete context—including the system prompt with the user profile and the recent chat history—to generate an informed response.

    **AI Response:**

    ```text
    You mentioned earlier that you like the color blue
    ```

## Debugging

To monitor and analyze agent behavior, you can use the `aigne observe` command. This tool starts a local web server that provides a user interface for inspecting execution traces, call details, and other runtime data.

1.  Start the observation server:

    ```bash Start the AIGNE observer icon=lucide:terminal
    aigne observe
    ```

    ![Terminal output showing the observability server is running](../../../examples/images/aigne-observe-execute.png)

2.  Open your browser and navigate to the local URL provided (typically `http://localhost:7893`) to view a list of recent agent executions and inspect their traces.

    ![Aigne Observability web interface showing a list of traces](../../../examples/images/aigne-observe-list.png)

## Summary

This example has demonstrated the implementation of a chatbot with persistent memory using the AIGNE Framework. By leveraging the `FSMemory` plugin, the chatbot can record and retrieve conversation history and user profile information, leading to more context-aware and personalized interactions.

For more advanced memory persistence options, see the [DID Spaces Memory](./examples-memory-did-spaces.md) example, which demonstrates using decentralized storage.
