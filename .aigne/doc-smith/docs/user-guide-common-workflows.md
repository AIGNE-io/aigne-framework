This guide provides everything you need to get the AIGNE Framework installed and run your first AI application in just a few minutes. We'll walk through setting up your environment, installing the necessary packages, and building a simple yet powerful multi-agent workflow.

## 1. Prerequisites

Before you begin, ensure you have Node.js installed on your system. The AIGNE Framework requires a modern version of Node.js to function correctly.

*   **Node.js**: Version 20.0 or higher

You can check your Node.js version by running the following command in your terminal:

```bash
node -v
```

If you don't have Node.js installed or need to upgrade, we recommend using a version manager like `nvm` or downloading it from the official [Node.js website](https://nodejs.org/).

## 2. Installation

You can add the AIGNE Framework to your project using your preferred package manager: `npm`, `yarn`, or `pnpm`.

### Using npm

```bash
npm install @aigne/core
```

### Using yarn

```bash
yarn add @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/core
```

This command installs the core package, which provides the essential building blocks for creating AI agents and workflows.

## 3. Your First AIGNE Application

Let's build a simple application that demonstrates the "Handoff" workflow pattern. In this example, `AgentA` will receive an initial prompt and then hand off the conversation to `AgentB`, which has a different personality.

This example also requires a model provider to power the agents. We'll use OpenAI for this guide.

First, install the OpenAI model package:

```bash
npm install @aigne/openai
```

Now, create a new TypeScript file (e.g., `index.ts`) and add the following code:

```ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// For loading environment variables
import * as dotenv from "dotenv";
dotenv.config();

// 1. Configure the AI Model
// Ensure you have OPENAI_API_KEY set in your .env file
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables.");
}

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. Define a "Handoff" Skill
// This function defines the condition for transferring control from AgentA to AgentB.
function transferToB() {
  return agentB;
}

// 3. Define Your Agents
const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent. When the user asks to talk to agent b, use the transferToB skill.",
  outputKey: "A",
  skills: [transferToB], // Attach the handoff skill
  inputKey: "message",
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
  inputKey: "message",
});

// 4. Initialize the AIGNE Framework
const aigne = new AIGNE({ model });

// The main function to run the application
async function main() {
  // 5. Start a session with AgentA
  const userAgent = aigne.invoke(agentA);

  // 6. First interaction: Trigger the handoff
  console.log("User: transfer to agent b");
  const result1 = await userAgent.invoke({ message: "transfer to agent b" });
  console.log("Agent:", result1);
  // Expected Output:
  // {
  //   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
  // }

  // 7. Second interaction: Chat with AgentB
  // The session is now permanently with AgentB
  console.log("\nUser: It's a beautiful day");
  const result2 = await userAgent.invoke({ message: "It's a beautiful day" });
  console.log("Agent:", result2);
  // Expected Output:
  // {
  //   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
  // }
}

main().catch(console.error);
```

### Code Breakdown

1.  **Configure the AI Model**: We import `OpenAIChatModel` and initialize it with an API key. It's best practice to load secrets like API keys from environment variables.
2.  **Define a "Handoff" Skill**: The `transferToB` function is a *skill*. When executed, it returns the definition of `agentB`, signaling to the AIGNE engine that control should be transferred to that agent.
3.  **Define Your Agents**: We create two distinct agents using `AIAgent.from()`.
    *   `agentA` is the initial point of contact. Its `skills` array includes the `transferToB` function, making it capable of performing the handoff.
    *   `agentB` has a specific personality—it only speaks in haikus.
4.  **Initialize the AIGNE Framework**: We create an instance of the `AIGNE` engine, passing in the model it will use to power the agents.
5.  **Start a Session**: `aigne.invoke(agentA)` creates a stateful user session, starting with `agentA`.
6.  **Trigger the Handoff**: The first message, "transfer to agent b," matches the instructions for `agentA`, which then executes the `transferToB` skill. The conversation is now permanently handed off to `agentB`. The output key is `B`, indicating the response came from `agentB`.
7.  **Chat with AgentB**: The second message is sent to the same `userAgent` session. Because the handoff has already occurred, `agentB` receives the message and responds with a haiku, as per its instructions.

## 4. Running the Code

To run the example, follow these steps:

1.  **Create a `.env` file** in your project's root directory to store your OpenAI API key:
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

2.  **Install `dotenv` and `ts-node`** to manage environment variables and run TypeScript directly:
    ```bash
    npm install dotenv ts-node typescript
    ```

3.  **Execute the script** using `ts-node`:
    ```bash
    npx ts-node index.ts
    ```

You will see the output in your console as the agents interact and perform the handoff.

## Next Steps

Congratulations! You've successfully built and run your first AIGNE application.

From here, you can explore the framework's more advanced capabilities:

*   **Discover Key Features**: Learn about the modular design, multi-model support, and code execution capabilities.
*   **Explore Workflow Patterns**: Dive into other powerful patterns like Sequential, Router, and Concurrency to build more sophisticated applications.
*   **Consult the API Reference**: Get detailed information on all the available classes, methods, and configurations.