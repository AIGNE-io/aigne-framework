# Building Your First Agent

[English](./build-your-first-agent.md) | [中文](./build-your-first-agent.zh.md)

Creating a basic AI Agent in the AIGNE framework is intuitive and efficient. This guide will walk you through building and running your first intelligent Agent from scratch.

## Basic Process

Creating and using a basic Agent mainly involves the following key steps:

1. **Import Necessary Modules** - Import framework core components and model interfaces
2. **Create AIGNE Instance** - Configure framework runtime environment and underlying models
3. **Configure and Create Agent** - Define Agent role and behavioral guidelines
4. **Use Agent to Process User Input** - Invoke Agent and get response results

Let's understand the implementation details of each step:

### Import Necessary Modules

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent" only_imports
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

Here we import three key components:

* **AIAgent** - Core class for creating and managing AI Agents, encapsulating Agent behavior and capabilities
* **AIGNE** - Main framework entry point, responsible for coordinating Agent workflows and lifecycle management
* **OpenAIChatModel** - Provides interface for interacting with OpenAI models, enabling Agents to access powerful LLM capabilities

### Create AIGNE Instance

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

Key points of this step:

* AIGNE instance serves as the core runtime environment, connecting Agents with underlying LLM models
* We chose OpenAI's "gpt-4o-mini" model as the Agent core, providing a good balance of performance and cost
* API key is securely read from environment variables, following development best practices
* Framework supports flexible switching between different provider models, such as Anthropic Claude, Google Gemini, etc.

### Configure and Create Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
});
```

In this concise yet powerful configuration:

* Use `AIAgent.from()` factory method to create Agent instance, simplifying the initialization process
* Define Agent's professional domain and behavioral boundaries through the `instructions` parameter
* This seemingly simple configuration is actually sufficient to create an intelligent assistant focused on cryptocurrency market cap information
* Framework automatically handles underlying prompt engineering and context management, allowing you to focus on business logic

### Use Agent to Process User Input

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent-invoke-agent" exclude_imports
const result = await aigne.invoke(agent, "What is crypto?");
console.log(result);
// Output: { $message: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security" }
```

This invocation process demonstrates:

* Use `aigne.invoke()` method to pass user questions to Agent for processing
* This method returns a Promise, requiring `await` to wait for response completion
* Input parameters include Agent instance and user's question text
* Response result uses standardized format, where `$message` field contains Agent-generated answer

## Example Code

Below is a complete example showing how to create a basic Agent and use it to respond to user questions:

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-build-first-agent"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market cap",
});

const result = await aigne.invoke(agent, "What is crypto?");
console.log(result);
// Output: { $message: "Cryptocurrency, often referred to as crypto, is a type of digital or virtual currency that uses cryptography for security" }
```

## Tips

* **Precise Instruction Design**: Agent performance and behavior largely depend on the `instructions` parameter; clear, specific instructions can significantly improve response quality
* **Model Selection Strategy**: Different models have trade-offs in capabilities, speed, and cost; choose the most suitable model based on specific application scenarios
* **Security and Privacy Protection**:
  * Always manage API keys through environment variables or secure services
  * Implement appropriate access control and permission boundaries
  * Validate and filter user input to prevent potential injection attacks
* **Unified Response Handling**: The AIGNE framework returns standardized response format `{ $message: "..." }`, facilitating consistent processing in applications
