This document provides a comprehensive guide to the `Agent` class, which serves as the foundational building block for all agents within the AIGNE framework. You will learn about its core concepts, lifecycle, and how to create your own custom agents.

## Agent Class Diagram

The following diagram illustrates the architecture of the `Agent` class, including its key properties and methods.

```d2
direction: down

Agent: {
  shape: class

  # Properties
  + id: string
  + name: string
  + description: string
  - state: AgentState
  # llm: LLM
  # tools: Tool[]

  # Lifecycle Methods
  + constructor(options)
  + run(input): Promise<any>
  + onStart(): void
  + onMessage(message): void
  + onStop(): void

  # Internal Methods
  - useTool(toolName, args): any
}
```

## Introduction

The `Agent` is the base class for all agents in the system. It provides a robust framework for defining input/output schemas, implementing processing logic, and managing the agent's lifecycle. By extending the `Agent` class, you can create custom agents with a wide range of capabilities, including:

*   Processing structured input and output data with validation.
*   Communicating with other agents through a message-passing system.
*   Supporting both streaming and non-streaming responses.
*   Maintaining a memory of past interactions.
*   Delegating tasks to other agents (known as "skills").

## Core Concepts

Understanding these core concepts is key to effectively using the `Agent` class.

### Agent Identification

*   **`name`**: A `string` used for identification and logging. It defaults to the constructor's name if not provided.
*   **`alias`**: A `string[]` of alternative names that can be used to refer to the agent, particularly useful in the AIGNE CLI.
*   **`description`**: A human-readable `string` explaining what the agent does. This is useful for documentation and debugging.

### Data Schemas

*   **`inputSchema`**: A Zod schema that defines the structure of the agent's input. It ensures that incoming messages conform to the expected format.
*   **`outputSchema`**: A Zod schema that validates the agent's output, ensuring it adheres to the defined structure before being sent.
*   **`defaultInput`**: An object providing default or partial values for the input schema, simplifying agent invocation.

### Communication

*   **`subscribeTopic`**: A `string` or `string[]` of topics the agent listens to. The agent will process messages published on these topics. Every agent also automatically subscribes to a default topic: `$agent_[agent_name]`.
*   **`publishTopic`**: A `string`, `string[]`, or a function that determines which topic(s) the agent's output should be sent to.

### Capabilities and Behavior

*   **`skills`**: An array of other `Agent` instances or `FunctionAgentFn` that this agent can invoke. This allows for creating complex behaviors by composing smaller, specialized agents.
*   **`memory`**: One or more `MemoryAgent` instances that the agent can use to store and retrieve information from past interactions.
*   **`guideRails`**: A list of `GuideRailAgent` instances that act as validators or controllers. They can inspect the agent's input and output and even abort the process if certain conditions aren't met.
*   **`retryOnError`**: Configuration for automatically retrying the agent's `process` method upon failure. You can specify the number of retries, backoff strategy, and custom logic to decide if a retry should occur.

## Agent Lifecycle and Processing

### Invocation

The primary way to execute an agent is by calling the `invoke()` method. This method handles the entire lifecycle of an agent run.

*   **Input**: The first argument to `invoke()` is the input `message` for the agent.
*   **Options**: The second argument is an `options` object, which must include a `context`. The context provides the runtime environment for the agent.
*   **Streaming vs. Non-Streaming**: The `streaming` flag in the options determines the return type.
    *   If `streaming: true`, `invoke()` returns a `ReadableStream` that emits chunks of the response as they are generated. This is ideal for real-time applications like chatbots.
    *   If `false` or undefined, `invoke()` returns a `Promise` that resolves with the final, complete output object.

Here is an example of how to invoke an agent:
```typescript
// Non-streaming invocation
const result = await myAgent.invoke({ text: "Hello, world!" });
console.log(result);

// Streaming invocation
const stream = await myAgent.invoke({ text: "Tell me a story." }, { streaming: true });
for await (const chunk of stream) {
    // Process each chunk as it arrives
    process.stdout.write(chunk.delta.text?.content || "");
}
```

### The `process()` Method

This is the core abstract method that you must implement in your custom agent. It contains the primary logic for the agent. The `process` method receives the validated input and invocation options and should return the agent's output.

The return value can be:
*   An `object`: The final output.
*   An `AgentResponseStream`: A readable stream for streaming output.
*   An `AsyncGenerator`: For yielding chunks of the response.
*   Another `Agent` instance: To transfer control to another agent.

### Pre- and Post-processing

The `Agent` class provides `preprocess()` and `postprocess()` methods that are called automatically during the `invoke` lifecycle.

*   **`preprocess(input, options)`**: Called before the `process` method. It's responsible for checking context status and agent invocation limits.
*   **`postprocess(input, output, options)`**: Called after the `process` method successfully completes. It handles publishing the output to the appropriate topics and recording interactions to memory.

### Hooks

Hooks allow you to tap into the agent's lifecycle to add custom logic for logging, monitoring, or modifying behavior without changing the agent's core implementation. You can provide hooks in the `AgentOptions` or `AgentInvokeOptions`.

Key hooks include:
*   `onStart`: Before processing begins.
*   `onEnd`: When processing completes (successfully or not).
*   `onSuccess`: On successful completion.
*   `onError`: When an error is thrown.
*   `onSkillStart`/`onSkillEnd`: Before and after a skill is invoked.

## Creating Custom Agents

### Extending the `Agent` Class

To create a custom agent, extend the base `Agent` class and implement the `process` method.

**Example: A Simple Greeting Agent**
```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

class GreetingAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreetingAgent",
      description: "An agent that generates a greeting.",
      inputSchema: z.object({
        name: z.string(),
      }),
      outputSchema: z.object({
        greeting: z.string(),
      }),
    });
  }

  async process(input: GreetingInput, options: AgentInvokeOptions): Promise<GreetingOutput> {
    const { name } = input;
    return {
      greeting: `Hello, ${name}!`,
    };
  }
}

// Usage
const agent = new GreetingAgent();
const result = await agent.invoke({ name: "Alice" });
console.log(result.greeting); // Output: Hello, Alice!
```

### Using `FunctionAgent`

For simpler agents that don't require complex state or methods, you can use a `FunctionAgent`. This allows you to create an agent from a single function.

**Example: A `FunctionAgent` for Addition**
```typescript
import { FunctionAgent, Message } from "@aigne/core";
import { z } from "zod";

interface AddInput extends Message {
  a: number;
  b: number;
}

const addAgent = new FunctionAgent({
  name: "AddAgent",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  process: async (input: AddInput) => {
    return { result: input.a + input.b };
  },
});

// Usage
const result = await addAgent.invoke({ a: 5, b: 3 });
console.log(result.result); // Output: 8
```

## API Reference

### AgentOptions

Configuration options for the `Agent` constructor.

| Option                 | Type                                        | Description                                                                                             |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `name`                 | `string`                                    | The name of the agent. Defaults to the class name.                                                      |
| `alias`                | `string[]`                                  | Alternative names for the agent.                                                                        |
| `description`          | `string`                                    | A description of what the agent does.                                                                   |
| `subscribeTopic`       | `string \| string[]`                        | Topic(s) the agent should subscribe to for messages.                                                    |
| `publishTopic`         | `string \| string[] \| (output) => string`  | Topic(s) to publish the agent's output to.                                                              |
| `inputSchema`          | `ZodObject`                                 | A Zod schema to validate the input message.                                                             |
| `outputSchema`         | `ZodObject`                                 | A Zod schema to validate the output message.                                                            |
| `defaultInput`         | `Partial<I>`                                | Default values for the agent's input.                                                                   |
| `includeInputInOutput` | `boolean`                                   | If true, merges the input fields into the output object.                                                |
| `skills`               | `(Agent \| FunctionAgentFn)[]`              | A list of other agents or functions that this agent can use.                                            |
| `memory`               | `MemoryAgent \| MemoryAgent[]`              | Memory agent(s) for storing and retrieving conversation history.                                        |
| `hooks`                | `AgentHooks \| AgentHooks[]`                | Lifecycle hooks for tracing, logging, or custom behavior.                                               |
| `guideRails`           | `GuideRailAgent[]`                          | A list of agents that validate or control the message flow.                                             |
| `retryOnError`         | `boolean \| object`                         | Configuration for retrying the agent on failure.                                                        |
| `disableEvents`        | `boolean`                                   | If true, disables the emission of events like `agentStarted` or `agentSucceed`.                         |
| `model`                | `ChatModel`                                 | The default chat model to be used by the agent and its skills.                                          |

### Agent Methods

Key methods available on an `Agent` instance.

| Method       | Signature                                                              | Description                                                                                               |
| ------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `invoke`     | `(input: I, options?: AgentInvokeOptions) => Promise<O \| Stream>`     | Invokes the agent's processing logic and returns the result, either as a final object or a stream.        |
| `process`    | `(input: I, options: AgentInvokeOptions) => PromiseOrValue<Result<O>>` | **Abstract method.** The core logic of the agent must be implemented here.                                |
| `addSkill`   | `(...skills: (Agent \| FunctionAgentFn)[]) => void`                    | Adds one or more skills (sub-agents) to the agent.                                                        |
| `attach`     | `(context: Context) => void`                                           | Attaches the agent to a context, subscribing to its topics.                                               |
| `shutdown`   | `() => Promise<void>`                                                  | Cleans up resources, such as unsubscribing from topics and shutting down memory connections.              |