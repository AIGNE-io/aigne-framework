# Core Concepts

The AIGNE Framework provides a powerful foundation for building AI-powered applications by orchestrating multiple agents to work together. This guide explains the fundamental concepts and components that make up the AIGNE Framework, including AIGNE, Context, Agents, and message passing.

```mermaid
flowchart TD
    A["AIGNE"] --> B["Context"]
    A --> C["Agents"]
    A --> D["Skills"]
    A --> E["Message Queue"]
    B --> F["Invocation"]
    B --> G["Memory"]
    B --> H["User Context"]
    C --> I["AI Agent"]
    C --> J["Team Agent"]
    C --> K["Transform Agent"]
    C --> L["Function Agent"]
    E --> M["Publish/Subscribe"]
    M --> N["Topics"]
</flowchart>
```

## AIGNE Class

The AIGNE class serves as the central coordination point for agent interactions, message passing, and execution flow. It's the primary entry point for building complex AI applications.

```typescript
import { AIGNE } from "@aigne/core";
import { AIAgent } from "@aigne/core";

// Create a new AIGNE instance
const aigne = new AIGNE({
  name: "My AIGNE App",
  description: "A simple AIGNE application",
  // Optional global model for agents that don't specify their own
  model: myCustomModel, 
  // Skills are agents that can be used by other agents
  skills: [myUtilityAgent],
  // Primary agents that drive your application
  agents: [myMainAgent]
});
```

The AIGNE constructor accepts the following options:

| Option | Type | Description |
|--------|------|-------------|
| name | string | Optional name identifier for this AIGNE instance |
| description | string | Optional description of this AIGNE instance's purpose |
| model | ChatModel | Global model to use for all agents not specifying a model |
| skills | Agent[] | Skills to use for the AIGNE instance (utility agents) |
| agents | Agent[] | Agents to use for the AIGNE instance (primary agents) |
| limits | ContextLimits | Limits for the AIGNE instance (timeout, max tokens, etc.) |
| observer | AIGNEObserver | Observer for tracking and debugging AIGNE operation |

You can also load an AIGNE instance from configuration files:

```typescript
// Load AIGNE from a directory containing aigne.yaml
const aigne = await AIGNE.load("./my-aigne-project", {
  // Override options if needed
  model: myCustomModel
});
```

This provides a convenient way to initialize an AIGNE system from configuration files, making it easier to manage complex setups.

## Context

The Context in AIGNE serves as an execution environment for agents, isolating state for different flows or conversations. It manages memories, user context, and maintains usage metrics.

```typescript
// Create a new context
const context = aigne.newContext();

// Create a context with initial user context
const userContext = { userId: "user123", sessionId: "session456" };
const context = aigne.newContext({ userContext });

// Create a context with initial memories
const memories = [{ content: "Previous conversation data..." }];
const context = aigne.newContext({ memories });
```

Contexts are typically created automatically when you invoke agents through AIGNE, but you can also create them explicitly when you need more control over the execution environment.

The Context provides these key capabilities:

1. **State isolation** - Each context maintains its own state, allowing multiple conversations to occur simultaneously
2. **Memory management** - Contexts store and retrieve memories for agents to use
3. **User context** - Custom user data can be attached to provide personalization
4. **Usage tracking** - Contexts track token usage, agent calls, and execution time
5. **Event handling** - Contexts emit events that can be used for monitoring and debugging

```typescript
// Tracking context usage
console.log(context.usage);
// {
//   inputTokens: 250,
//   outputTokens: 150,
//   agentCalls: 2,
//   duration: 1250 // milliseconds
// }
```

## Agent Invocation

The primary way to use AIGNE is by invoking agents to perform tasks. There are several ways to invoke agents, depending on your needs.

### Basic Invocation

```typescript
// Create an agent
const greeterAgent = new AIAgent({
  name: "greeter",
  description: "Greets users",
  prompt: "You are a friendly greeter. Greet the user by name.",
  model: myModel
});

// Add to AIGNE
aigne.addAgent(greeterAgent);

// Invoke the agent with a message
const response = await aigne.invoke(greeterAgent, {
  name: "Alice"
});

console.log(response.greeting); // "Hello, Alice! Welcome!"
```

This simple pattern allows you to quickly get responses from your agents.

### Streaming Responses

For larger responses or better user experience, you can use streaming to get partial results as they're generated:

```typescript
// Invoke with streaming enabled
const stream = await aigne.invoke(greeterAgent, {
  name: "Bob"
}, { streaming: true });

// Process the stream
for await (const chunk of stream) {
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text);
  }
  if (chunk.delta.json) {
    // Handle structured data updates
    console.log(chunk.delta.json);
  }
}
```

Streaming is particularly useful for long-running AI generations, allowing you to show progress to users in real-time.

### UserAgent Pattern

The UserAgent pattern provides a convenient way to interact consistently with an agent:

```typescript
// Create a user agent wrapper
const userAgent = aigne.invoke(greeterAgent);

// Use the user agent for multiple invocations
const response1 = await userAgent.send({ name: "Charlie" });
const response2 = await userAgent.send({ name: "Dana" });

// Stream responses
const stream = await userAgent.stream({ name: "Ellie" });
for await (const chunk of stream) {
  // Process stream chunks
}
```

This pattern is useful when you need to make multiple calls to the same agent with consistent context.

## Message Passing

AIGNE provides a publish/subscribe system for inter-agent communication. This allows agents to communicate asynchronously without direct coupling.

### Publishing Messages

```typescript
// Publish a message to a topic
aigne.publish("notifications", {
  type: "alert",
  message: "System status update"
});

// Publish to multiple topics
aigne.publish(["notifications", "logs"], {
  type: "info",
  message: "User logged in"
});
```

Messages can be published to one or more topics, allowing flexible communication patterns.

### Subscribing to Messages

```typescript
// Subscribe with a listener function
const unsubscribe = aigne.subscribe("notifications", (payload) => {
  console.log(`Received: ${payload.message.type} - ${payload.message.message}`);
});

// Later, unsubscribe when no longer needed
unsubscribe();

// Or wait for a single message
const nextMessage = await aigne.subscribe("notifications");
console.log(nextMessage);
```

Subscriptions can be persistent with callback functions, or you can use the Promise-based pattern to await the next message on a topic.

```mermaid
sequenceDiagram
    participant AgentA
    participant MessageQueue
    participant AgentB
    
    AgentA->>MessageQueue: publish("topic", message)
    MessageQueue->>AgentB: deliver message to subscriber
    AgentB->>MessageQueue: subscribe("topic")
    MessageQueue-->>AgentB: future messages
    
    Note over MessageQueue: Topics can have multiple subscribers
    Note over AgentA, AgentB: Agents can publish and subscribe to multiple topics
</flowchart>
```

## Context Usage and Limits

AIGNE provides mechanisms to track and limit resource usage to prevent runaway costs or excessive token consumption.

```typescript
// Configure limits when creating AIGNE
const aigne = new AIGNE({
  limits: {
    maxTokens: 10000,      // Maximum total tokens (input + output)
    maxAgentInvokes: 20,   // Maximum number of agent invocations
    timeout: 30000         // Maximum execution time in milliseconds
  }
});

// Check usage after running operations
const context = aigne.newContext();
await context.invoke(myAgent, { query: "..." });

console.log(context.usage);
// {
//   inputTokens: 500,
//   outputTokens: 800,
//   agentCalls: 3,
//   duration: 2500 // milliseconds
// }
```

When limits are exceeded, operations will be terminated gracefully with appropriate error messages.

## Agent Transfer

AIGNE supports a powerful pattern called Agent Transfer, where one agent can hand off execution to another agent. This allows for complex workflows where specialized agents handle different parts of a task.

```typescript
// A router agent that determines which specialist to use
const routerAgent = new AIAgent({
  name: "router",
  description: "Routes queries to the appropriate specialist",
  prompt: `Analyze the user query and transfer to the appropriate specialist:
  - For greetings, transfer to 'greeter'
  - For technical questions, transfer to 'techSupport'
  - For sales inquiries, transfer to 'sales'`,
  model: myModel
});

// Invoke the router, which may transfer to another agent
const response = await aigne.invoke(routerAgent, {
  query: "I'm having trouble with my account"
}, { 
  // Must be false to allow transfers
  disableTransfer: false 
});

// The response will come from the final agent in the chain
console.log(response);
```

Agent transfer is a powerful mechanism for building complex, multi-agent workflows while maintaining a simple interface for users.

```mermaid
sequenceDiagram
    participant User
    participant RouterAgent
    participant SpecialistA
    participant SpecialistB
    
    User->>RouterAgent: invoke(query)
    RouterAgent->>RouterAgent: Analyze query
    RouterAgent->>SpecialistA: transfer if appropriate
    SpecialistA->>SpecialistB: transfer if needed
    SpecialistB-->>User: final response
    
    Note over RouterAgent,SpecialistB: Transfer chain can be any length
</flowchart>
```

## Graceful Shutdown

AIGNE provides mechanisms for graceful shutdown, ensuring that resources are properly cleaned up:

```typescript
// Manually shut down
await aigne.shutdown();

// Or use with 'using' statement (in environments that support it)
using aigne = new AIGNE();
// AIGNE will be automatically disposed when the block exits
```

The framework automatically registers handlers for process exit events to ensure clean shutdown even when the process is terminated unexpectedly.

## Summary

The core concepts of the AIGNE Framework provide a solid foundation for building AI-powered applications:

- **AIGNE** serves as the central coordination point
- **Context** provides isolated execution environments
- **Agent Invocation** patterns support different interaction styles
- **Message Passing** enables flexible inter-agent communication
- **Usage Tracking and Limits** help control resource consumption
- **Agent Transfer** allows for complex, specialized workflows

By understanding these fundamentals, you can leverage the full power of the AIGNE Framework to build sophisticated AI applications that combine multiple agents seamlessly.

To continue your learning journey, explore:
- [Agents](./agents.md) - Detailed documentation on the different types of agents
- [Memory Management](./memory.md) - How to work with memories in AIGNE
- [Loading and Configuration](./configuration.md) - Advanced configuration techniques