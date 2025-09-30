# AIGNE & Context

At the heart of the AIGNE framework lie two fundamental concepts: `AIGNE` and `Context`. The `AIGNE` class acts as the central engine or orchestrator, responsible for managing and executing agents. For every task you run, `AIGNE` creates a `Context` object, which serves as an isolated environment that manages state, enforces limits, and tracks the entire lifecycle of that operation.

Understanding how these two components work together is key to building robust and predictable AI applications.

## The AIGNE Class

The `AIGNE` class is the main entry point for interacting with the framework. You create an instance of it, configure it with models and agents, and then use it to invoke tasks.

### Creating an AIGNE Instance

To get started, you need to instantiate the `AIGNE` class. At a minimum, it requires a model to be provided, which will be used by the agents it manages.

```javascript AIGNE Instantiation icon=logos:javascript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks/mock-models.js"; // Your model import

// Instantiate the main execution engine
const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});
```

### Running an Agent with `invoke`

The most direct way to execute a task is with the `aigne.invoke()` method. You pass the agent you want to run and the necessary input data. The method handles the entire execution and returns the final result.

```javascript Simple Invocation icon=logos:javascript
// Define a simple agent to run
const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

// Invoke the agent with input and wait for the result
const result = await aigne.invoke(agent, { message: "hello" });

console.log(result); 
// Expected output: { message: "Hello, How can I assist you today?" }
```

### Streaming Responses

For interactive applications like chatbots, you often want to stream the response back to the user as it's being generated. You can achieve this by setting the `streaming: true` option in the `invoke` method. This returns a `ReadableStream` that you can iterate over.

```javascript Streaming Invocation icon=logos:javascript
const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });

let text = "";
for await (const chunk of stream) {
  if (chunk.delta?.text?.message) { // Check for text deltas in the stream
    text += chunk.delta.text.message;
  }
}

console.log(text); 
// Output: Hello, How can I assist you today?
```

### Maintaining Conversation State

What if you want to have a continuous conversation where the agent remembers previous messages? Instead of providing input directly to `invoke`, you can call it with just the agent. This returns a `UserAgent` instance that maintains the conversation history for you.

```javascript Conversational State icon=logos:javascript
// Get a UserAgent instance that maintains its own state
const userAgent = aigne.invoke(agent);

// First interaction
const result1 = await userAgent.invoke({ message: "hello" });
console.log(result1); // { message: "Hello, How can I assist you today?" }

// Second interaction, the agent remembers the context
const result2 = await userAgent.invoke({ message: "I'm Bob!" });
console.log(result2); // { message: "Nice to meet you, Bob!" }
```

## The Context Object

Every call to `aigne.invoke()` creates a new `Context`. This object is crucial for managing the execution flow and ensuring stability. While you often don't interact with it directly, its configuration options provide powerful controls.

### Setting Execution Limits

To prevent runaway executions or excessive costs, you can set limits on the `AIGNE` instance. These limits are enforced by the `Context` for each invocation.

- `maxAgentInvokes`: The maximum number of times agents can call other agents within a single operation.
- `maxTokens`: The total number of tokens that can be consumed.
- `timeout`: The maximum execution time in milliseconds.

```javascript Configuring Limits icon=logos:javascript
const aigne = new AIGNE({
  limits: {
    maxAgentInvokes: 10, // Max 10 agent-to-agent calls
    maxTokens: 4096,       // Max 4096 tokens per operation
    timeout: 30000,        // Timeout after 30 seconds
  },
});
```

### Passing Custom Data with `userContext`

You can attach your own application-specific data to an invocation using the `userContext` option. This data will be available to all agents running within that context, which is useful for passing information like user IDs or session details without mixing it into the AI prompt.

```javascript Passing User Context icon=logos:javascript
const result = await aigne.invoke(
  agent,
  { message: "hello" },
  {
    userContext: { userId: "user-123", theme: "dark" },
  }
);
```

## Advanced: Publish/Subscribe for Agent Communication

For more complex workflows, `AIGNE` includes a built-in message bus that allows agents to communicate indirectly using a publish-subscribe pattern. Instead of calling each other directly, agents can publish messages to named `topics`, and other agents can subscribe to those topics to react to events.

This decouples your agents and allows for more flexible and scalable system designs.

```javascript Publish and Subscribe icon=logos:javascript
// Define an agent that subscribes to 'test_topic' and publishes to 'result_topic'
const listeningAgent = AIAgent.from({
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [listeningAgent], // Register the agent with the engine
});

// Subscribe to the result topic to get the final output
const subscription = aigne.subscribe("result_topic");

// Publish a message to the input topic to trigger the agent
aigne.publish("test_topic", { message: "hello" });

// Wait for the message from the subscription
const { message } = await subscription;

console.log(message); // { message: "Hello, How can I assist you today?" }
```

## Resource Management

An `AIGNE` instance may hold onto resources like network connections. It's important to clean them up when you're done.

### Manual Shutdown

You can explicitly call the `shutdown()` method to release all resources.

```javascript Manual Shutdown icon=logos:javascript
await aigne.invoke(agent, { message: "hello" });

// Manually shut down the AIGNE instance
await aigne.shutdown();
```

### Automatic Shutdown with `using`

Modern JavaScript supports the `using` declaration for automatic resource management. This is the recommended approach as it ensures `shutdown()` is called automatically when the variable goes out of scope, even if errors occur.

```javascript Automatic Shutdown with 'using' icon=logos:javascript
await using aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

await aigne.invoke(agent, { message: "hello" });

// aigne.shutdown() is automatically called here
```

## Summary

The `AIGNE` class is your primary tool for executing AI tasks, while the `Context` provides a safe and observable environment for each run. By mastering `invoke`, streaming, and the publish/subscribe system, you can build a wide range of AI-powered applications.

Now that you understand the orchestrator, let's dive deeper into the actors it manages. 

[Next: Agents](./core-agents.md)
