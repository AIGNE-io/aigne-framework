# Agent

The `Agent` class is the cornerstone of the AIGNE framework. It serves as the base class for all agents, providing a robust mechanism for defining input/output schemas, implementing processing logic, and managing interactions within the agent system.

By extending the `Agent` class, you can create custom agents with a wide range of capabilities, from simple function-based utilities to complex, AI-driven entities. Agents are designed to be modular, reusable, and capable of communicating with each other through a message-passing system.

```d2
direction: down

Input-Message: {
  label: "Input Message\n(from subscribeTopic)"
  shape: oval
}

Output-Message: {
  label: "Output Message\n(to publishTopic)"
  shape: oval
}

Agent: {
  label: "Agent Instance"
  shape: rectangle
  style: {
    stroke-width: 3
  }

  invoke-method: {
    label: "invoke()"
    shape: rectangle
    style.fill: "#d0e0f0"
  }

  Pre-Processing: {
    label: "Pre-Processing"
    shape: rectangle
    style.stroke-dash: 2

    GuideRails-Pre: "GuideRails (pre)"
    onStart-Hook: "onStart Hook"
    Input-Schema-Validation: {
      label: "Input Schema Validation\n(Zod)"
    }
  }

  process-method: {
    label: "process()\n(Custom Core Logic)"
    shape: rectangle
    style.fill: "#e0f0d0"

    Skills: {
      label: "Skills\n(Other Agents)"
      shape: rectangle
    }
    Memory: {
      label: "Memory"
      shape: cylinder
    }
  }

  Post-Processing: {
    label: "Post-Processing"
    shape: rectangle
    style.stroke-dash: 2

    Output-Schema-Validation: {
      label: "Output Schema Validation\n(Zod)"
    }
    onSuccess-onError-Hooks: "onSuccess / onError Hooks"
    GuideRails-Post: "GuideRails (post)"
    onEnd-Hook: "onEnd Hook"
  }
}

FunctionAgent: {
  label: "FunctionAgent\n(Simplified Agent)"
  shape: rectangle
}

Input-Message -> Agent.invoke-method: "1. Call"

Agent.invoke-method -> Agent.Pre-Processing.GuideRails-Pre: "2. Pre-validation"
Agent.Pre-Processing.GuideRails-Pre -> Agent.Pre-Processing.onStart-Hook: "3. Trigger"
Agent.Pre-Processing.onStart-Hook -> Agent.Pre-Processing.Input-Schema-Validation: "4. Validate Input"
Agent.Pre-Processing.Input-Schema-Validation -> Agent.process-method: "5. Execute"

Agent.process-method -> Agent.process-method.Skills: "delegates to"
Agent.process-method <-> Agent.process-method.Memory: "accesses"

Agent.process-method -> Agent.Post-Processing.Output-Schema-Validation: "6. Validate Output"
Agent.Post-Processing.Output-Schema-Validation -> Agent.Post-Processing.onSuccess-onError-Hooks: "7. Trigger"
Agent.Post-Processing.onSuccess-onError-Hooks -> Agent.Post-Processing.GuideRails-Post: "8. Post-validation"
Agent.Post-Processing.GuideRails-Post -> Agent.Post-Processing.onEnd-Hook: "9. Trigger"
Agent.Post-Processing.onEnd-Hook -> Output-Message: "10. Publish Result"

FunctionAgent -> Agent.process-method: "Provides function for"
```

## Core Concepts

- **Message-Driven Architecture**: Agents operate on a publish-subscribe model. They subscribe to specific topics to receive input messages and publish their output to other topics, enabling seamless inter-agent communication.
- **Input/Output Schemas**: You can define `inputSchema` and `outputSchema` using Zod schemas to ensure that all data flowing into and out of an agent is validated and conforms to a predefined structure.
- **Skills**: Agents can possess `skills`, which are other agents or functions. This allows you to create complex agents that delegate tasks to more specialized agents, promoting a modular and hierarchical design.
- **Lifecycle Hooks**: The agent lifecycle can be intercepted with `hooks` (e.g., `onStart`, `onEnd`, `onError`). Hooks are invaluable for logging, monitoring, tracing, and implementing custom logic at various stages of an agent's execution.
- **Streaming Responses**: Agents can return responses in a streaming fashion, which is ideal for real-time applications like chatbots, where results can be displayed incrementally as they are generated.
- **GuideRails**: `guideRails` are specialized agents that act as validators or controllers for another agent's execution. They can inspect the input and expected output to enforce rules, policies, or business logic, and can even abort the process if necessary.
- **Memory**: Agents can be equipped with `memory` to persist state and recall information from past interactions, enabling more context-aware behavior.

## Key Properties

The `Agent` class is configured via an `AgentOptions` object passed to its constructor. Here are some of the most important properties:

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | A unique name for the agent, used for identification and logging. Defaults to the class name. |
| `description` | `string` | A human-readable description of the agent's purpose and capabilities. |
| `subscribeTopic` | `string \| string[]` | The topic(s) the agent listens to for incoming messages. |
| `publishTopic` | `string \| string[] \| function` | The topic(s) where the agent sends its output messages. |
| `inputSchema` | `ZodType` | A Zod schema to validate the structure of input messages. |
| `outputSchema` | `ZodType` | A Zod schema to validate the structure of output messages. |
| `skills` | `(Agent \| FunctionAgentFn)[]` | A list of other agents or functions that this agent can invoke to perform sub-tasks. |
| `memory` | `MemoryAgent \| MemoryAgent[]` | One or more memory agents for storing and retrieving information. |
| `hooks` | `AgentHooks[]` | An array of hook objects to attach custom logic to the agent's lifecycle events. |
| `guideRails` | `GuideRailAgent[]` | A list of GuideRail agents to validate, transform, or control the message flow. |
| `retryOnError` | `boolean \| object` | Configuration for automatic retries upon failure. |

## Key Methods

### `invoke(input, options)`

This is the primary method for executing an agent. It takes an `input` message and an `options` object. The `invoke` method handles the entire lifecycle, including running hooks, validating schemas, executing the `process` method, and handling errors.

- **Regular Invocation**: By default, `invoke` returns a Promise that resolves with the final output object.
- **Streaming Invocation**: If you set `options.streaming` to `true`, `invoke` returns a `ReadableStream` that emits chunks of the response as they become available.

**Example: Regular Invocation**
```typescript
const result = await agent.invoke({ query: "What is AIGNE?" });
console.log(result);
```

**Example: Streaming Invocation**
```typescript
const stream = await agent.invoke(
  { query: "Tell me a story." },
  { streaming: true }
);

for await (const chunk of stream) {
  // Process each chunk as it arrives
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text.content);
  }
}
```

### `process(input, options)`

This is an **abstract method** that you must implement in your custom agent subclass. It contains the core logic of the agent. It receives the validated input and is responsible for returning the output. The `process` method can return a direct object, a `ReadableStream`, an `AsyncGenerator`, or even another `Agent` instance to transfer control.

**Example: Implementing `process`**
```typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

class EchoAgent extends Agent {
  constructor() {
    super({
      name: "EchoAgent",
      description: "An agent that echoes the input message.",
      inputSchema: z.object({ message: z.string() }),
      outputSchema: z.object({ response: z.string() }),
    });
  }

  async process(input: { message: string }, options: AgentInvokeOptions) {
    // Core logic of the agent
    return { response: `You said: ${input.message}` };
  }
}
```

### `shutdown()`

This method cleans up resources used by the agent, such as topic subscriptions and memory connections. It's important to call this method when an agent is no longer needed to prevent memory leaks.

## Agent Lifecycle and Hooks

The agent execution lifecycle is a well-defined process that can be monitored and modified using hooks.

1.  **`onStart`**: Triggered just before the agent's `process` method is called. You can use this hook to modify the input or perform setup tasks.
2.  **`onSkillStart` / `onSkillEnd`**: Triggered before and after a skill (another agent) is invoked.
3.  **`onSuccess`**: Triggered after the `process` method completes successfully and the output has been processed.
4.  **`onError`**: Triggered if an error occurs during processing. You can implement custom error handling or retry logic here.
5.  **`onEnd`**: Triggered at the very end of the invocation, regardless of whether it succeeded or failed. This is ideal for cleanup, logging, and metrics.

**Example: Using Hooks**
```typescript
const loggingHook = {
  onStart: async ({ agent, input }) => {
    console.log(`Agent ${agent.name} started with input:`, input);
  },
  onEnd: async ({ agent, error }) => {
    if (error) {
      console.error(`Agent ${agent.name} failed:`, error);
    } else {
      console.log(`Agent ${agent.name} finished successfully.`);
    }
  },
};

const agent = new MyAgent({
  hooks: [loggingHook],
});
```

## `FunctionAgent`

For simpler use cases, AIGNE provides the `FunctionAgent` class. It allows you to create an agent from a single function, abstracting away the need to create a new class that extends `Agent`. This is perfect for creating simple, stateless utility agents.

**Example: Creating a `FunctionAgent`**
```typescript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const multiplierAgent = new FunctionAgent({
  name: "Multiplier",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  process: async (input) => {
    return { result: input.a * input.b };
  },
});

const result = await multiplierAgent.invoke({ a: 5, b: 10 });
console.log(result); // { result: 50 }
```