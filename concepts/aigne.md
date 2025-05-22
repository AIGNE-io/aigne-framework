# AIGNE

[English](./aigne.md) | [中文](./aigne.zh.md)

AIGNE is a powerful framework for orchestrating multiple Agents to build complex AI applications. It serves as a central coordination point for Agent interactions, message passing, and execution flow.

## Basic Concepts

The core of AIGNE is Agent orchestration. It achieves this through the following mechanisms:

* **Agent Management** - AIGNE allows you to add and manage multiple Agents, each of which can access AIGNE's resources. Agents are divided into two categories: primary Agents (agents) and skill Agents (skills).
* **Context Isolation** - AIGNE uses contexts to isolate the state of different processes or conversations, ensuring clear separation of data and execution environments.
* **Unified Model** - AIGNE provides global model configuration that can be used by all Agents that don't specify their own model, simplifying the setup of multi-Agent systems.
* **Message Communication** - AIGNE implements a message queue system that supports publish/subscribe patterns, enabling asynchronous communication between Agents.

## Configuration Options

When creating an AIGNE instance, you can provide the following configuration options:

* **name** - Optional name identifier for the AIGNE instance
* **description** - Optional description of the AIGNE instance's purpose or functionality
* **model** - Global model used by all Agents that don't specify their own model
* **skills** - Collection of skill Agents available to the AIGNE instance
* **agents** - Collection of primary Agents managed by the AIGNE instance
* **limits** - Usage limits applied to AIGNE instance execution, such as timeouts, maximum tokens, etc.

## Usage

The following examples demonstrate how to use the AIGNE framework in real projects, from basic setup to advanced feature applications.

### Importing Modules

Before using AIGNE, you need to import the necessary modules. The following code imports the AIGNE core framework and OpenAI chat model, which are the foundational components for building AI applications.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic" only_imports
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

### Creating an AIGNE Instance

The following code demonstrates how to create a basic AIGNE instance and configure a global model. Here we use OpenAI's GPT-4o-mini model, which will serve as the default model for all Agents that don't specify their own model.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

### Loading AIGNE from Configuration File

For more complex applications, AIGNE supports loading instance configuration from configuration files. This approach is suitable for scenarios that need to manage multiple Agents and complex settings. The following code shows how to load AIGNE configuration from a specified path and provide available model types.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-load" exclude_imports
const path = join(import.meta.dirname, "../../test-aigne"); // "/PATH/TO/AIGNE_PROJECT";

const aigne = await AIGNE.load(path, { models: [OpenAIChatModel] });
```

### Adding Agents

After creating an AIGNE instance, you can add various Agents to it. The following code demonstrates how to create a basic AI Agent and add it to the AIGNE instance. This Agent is configured as a helpful assistant that can respond to user queries.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-add-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});

aigne.addAgent(agent);
```

### Invoking Agents

After adding Agents, you can invoke them through the AIGNE instance. The following code shows how to send a message to a specified Agent and get a response. In this example, the Agent is asked about AIGNE information and the response result is output.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent" exclude_imports
const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

### Streaming Response

For application scenarios that require real-time feedback, AIGNE supports streaming responses. This approach allows receiving partial results while the Agent is generating responses, particularly suitable for scenarios requiring immediate feedback such as chat applications. The following code demonstrates how to invoke an Agent in streaming mode and progressively process response content.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-streaming" exclude_imports
const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });
let response = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

### User Agent

AIGNE provides the concept of user Agents, allowing the creation of user sessions associated with specific Agents. This approach is suitable for scenarios that need to maintain conversational context, enabling multiple interactions to remain coherent. The following code shows how to create a user Agent and interact with the target Agent through it.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-invoke-agent-user-agent" exclude_imports
const userAgent = aigne.invoke(agent);
const result1 = await userAgent.invoke("What is AIGNE?");
console.log(result1);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

### Shutdown and Cleanup

To ensure resources are properly released and avoid potential memory leaks, proper shutdown operations should be performed after completing the use of an AIGNE instance. The following code demonstrates how to safely shut down an AIGNE instance. This step is particularly important in long-running applications or services.

```ts file="../../docs-examples/test/concepts/aigne.test.ts" region="example-aigne-basic-shutdown" exclude_imports
await aigne.shutdown();
```

Through the above examples, you can understand the basic usage of the AIGNE framework, from creating instances, configuring models, adding Agents to invoking and managing Agents - the complete workflow. AIGNE's flexible architecture enables it to adapt to various complex AI application scenarios, supporting the construction of everything from simple conversational systems to complex multi-Agent collaborative systems.
