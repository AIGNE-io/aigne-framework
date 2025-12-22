# Workflow Router

Have you ever needed to direct user queries to different specialized handlers based on their content? This guide provides a complete, step-by-step walkthrough for building a workflow that intelligently routes requests. You will learn how to create a "triage" agent that analyzes input and forwards it to the correct specialized agent, such as product support or feedback collection.

The router workflow is a common and powerful pattern for creating sophisticated, multi-agent systems. It acts as a smart dispatcher, ensuring that user requests are handled by the agent best equipped for the task. This example demonstrates a triage agent that routes questions to one of three specialized agents: `productSupport`, `feedback`, or `other`.

The diagram below illustrates the routing logic:

```d2
direction: down

User: {
  shape: c4-person
}

Triage-Agent: {
  label: "Triage Agent"
  shape: rectangle
}

Specialized-Agents: {
  label: "Specialized Agents"
  shape: rectangle

  productSupport: {
    label: "Product Support Agent"
  }

  feedback: {
    label: "Feedback Agent"
  }

  other: {
    label: "Other Agent"
  }
}

User -> Triage-Agent: "User Query"
Triage-Agent -> Specialized-Agents.productSupport: "Routes product questions"
Triage-Agent -> Specialized-Agents.feedback: "Routes feedback"
Triage-Agent -> Specialized-Agents.other: "Routes other questions"
Specialized-Agents.productSupport -> User: "Response"
Specialized-Agents.feedback -> User: "Response"
Specialized-Agents.other -> User: "Response"

```

## Prerequisites

Before proceeding, ensure your development environment meets the following requirements:

*   **Node.js:** Version 20.0 or higher.
*   **npm:** Comes bundled with Node.js.
*   **OpenAI API Key:** Required for the default model configuration. You can obtain one from the [OpenAI Platform](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly without a manual installation process using `npx`.

### Run the Example

The example can be executed in several modes.

1.  **One-Shot Mode (Default)**
    This command processes a single, hardcoded input and exits.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-router
    ```

2.  **Interactive Chat Mode**
    Use the `--chat` flag to start an interactive session where you can send multiple messages.

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-router --chat
    ```

3.  **Pipeline Mode**
    Pipe input directly into the command. This is useful for integrating with other scripts.

    ```bash icon=lucide:terminal
    echo "How do I return a product?" | npx -y @aigne/example-workflow-router
    ```

### Connect to an AI Model

When you run the example for the first time, it will detect that no AI model has been configured and will prompt you for setup.

![Initial setup prompt for AI model connection](../../../examples/workflow-router/run-example.png)

You have several options to connect to an AI model:

#### 1. Connect to the AIGNE Hub (Recommended)

This is the easiest way to get started. The official AIGNE Hub provides free credits for new users.

1.  Select the first option: `Connect to the Arcblock official AIGNE Hub`.
2.  Your web browser will open an authorization page.
3.  Follow the on-screen instructions to approve the connection.

![Authorize AIGNE CLI to connect to AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. Connect to a Self-Hosted AIGNE Hub

If you are running your own instance of AIGNE Hub:

1.  Select the second option: `Connect to your self-hosted AIGNE Hub`.
2.  Enter the URL of your AIGNE Hub instance when prompted.

![Enter the URL of your self-hosted AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. Connect via a Third-Party Model Provider

You can also connect directly to a model provider like OpenAI by setting an environment variable.

```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

Replace `"YOUR_OPENAI_API_KEY"` with your actual key. After setting the environment variable, run the example command again. For other providers like Google Gemini or DeepSeek, refer to the `.env.local.example` file in the source code for the correct variable names.

## Full Example and Source Code

The core logic involves defining several `AIAgent` instances: three specialized agents (`productSupport`, `feedback`, `other`) and one `triage` agent that acts as the router. The `triage` agent is configured with `toolChoice: "router"`, which instructs it to select one of its available `skills` (the other agents) to handle the input.

Below is the complete TypeScript code for this example.

```typescript index.ts
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const productSupport = AIAgent.from({
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  skills: [productSupport, feedback, other],
  toolChoice: "router", // Set toolChoice to "router" to enable router mode
});

const aigne = new AIGNE({ model });

// Example 1: Route to Product Support
const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);

// Example 2: Route to Feedback
const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);

// Example 3: Route to Other
const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
```

### Execution and Output

When the script runs, the `aigne.invoke` method sends the user's query to the `triage` agent. The agent then routes the query to the most appropriate specialized agent, and the final output is from that selected agent.

**Output for "How to use this product?"**
```json
{
  "product_support": "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?"
}
```

**Output for "I have feedback about the app."**
```json
{
  "feedback": "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app."
}
```

**Output for "What is the weather today?"**
```json
{
  "other": "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!"
}
```

## Command-Line Options

The example script accepts several command-line arguments to customize its behavior.

| Parameter | Description | Default |
|---|---|---|
| `--chat` | Run in interactive chat mode instead of one-shot. | Disabled |
| `--model <provider[:model]>` | Specify the AI model to use (e.g., `openai` or `openai:gpt-4o-mini`). | `openai` |
| `--temperature <value>` | Set the temperature for model generation. | Provider default |
| `--top-p <value>` | Set the top-p sampling value. | Provider default |
| `--presence-penalty <value>`| Set the presence penalty value. | Provider default |
| `--frequency-penalty <value>`| Set the frequency penalty value. | Provider default |
| `--log-level <level>` | Set the logging verbosity (e.g., `ERROR`, `WARN`, `INFO`, `DEBUG`). | `INFO` |
| `--input`, `-i <input>` | Provide input directly as an argument. | None |

#### Examples

```bash Run in interactive mode icon=lucide:terminal
npx -y @aigne/example-workflow-router --chat
```

```bash Set a specific model and temperature icon=lucide:terminal
npx -y @aigne/example-workflow-router --model openai:gpt-4o-mini --temperature 0.5 -i "Tell me about your product."
```

```bash Set logging level to debug icon=lucide:terminal
npx -y @aigne/example-workflow-router --log-level DEBUG
```

## Debugging

To inspect the execution flow and understand the agent's behavior, you can use the AIGNE observability tool.

First, start the observation server in a separate terminal window:

```bash icon=lucide:terminal
aigne observe
```

![AIGNE observe command running in the terminal](../../../examples/images/aigne-observe-execute.png)

The server will start, and you can access the web interface at `http://localhost:7893`. After running the example, the execution traces will appear in the dashboard, allowing you to see how the `triage` agent made its routing decision and what data was passed between agents.

![AIGNE observability interface showing a list of traces](../../../examples/images/aigne-observe-list.png)

## Summary

This example has demonstrated how to build a router workflow using the AIGNE Framework. By defining a `triage` agent with specialized agents as its skills and setting `toolChoice: "router"`, you can create a powerful system that intelligently delegates tasks.

For more complex patterns, explore the following examples:

<x-cards data-columns="2">
  <x-card data-title="Workflow Handoff" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">Create seamless transitions between specialized agents to solve complex problems.</x-card>
  <x-card data-title="Workflow Orchestration" data-icon="lucide:network" data-href="/examples/workflow-orchestration">Coordinate multiple agents working together in sophisticated processing pipelines.</x-card>
</x-cards>