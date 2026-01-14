# Agents

In the AIGNE Framework, the **`Agent`** is the fundamental unit of work. It is an abstract class that establishes a standard contract for all specialized agent types. An agent can be conceptualized as a distinct worker capable of executing a specific task, processing information, and interacting with other agents within the system.

Every specialized agent, whether designed for interacting with an AI model, transforming data, or orchestrating a team of other agents, inherits its core structure and behavior from this base `Agent` class. This architectural principle ensures consistency and predictability across the framework.

Further reading on specialized agent types can be found in the [Agent Types](./developer-guide-agents.md) section.

## Core Concepts

The `Agent` class is designed around several core concepts that define its identity, data contracts, and operational behavior. These are configured via the `AgentOptions` object during the agent's instantiation.

### Key Properties

The following properties define an agent's configuration:

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | A unique identifier for the agent, used for logging and referencing. It defaults to the constructor's class name if not specified. |
| `description` | `string` | A human-readable summary of the agent's purpose and capabilities, useful for documentation and debugging. |
| `inputSchema` | `ZodType` | A Zod schema defining the structure and validation rules for the agent's input data. This ensures data integrity. |
| `outputSchema` | `ZodType` | A Zod schema defining the structure and validation rules for the agent's output data. |
| `skills` | `Agent[]` | A list of other agents that this agent can invoke to perform delegated sub-tasks, enabling compositional behavior. |
| `memory` | `MemoryAgent` | An optional memory unit allowing the agent to persist and recall state across multiple interactions. |
| `hooks` | `AgentHooks[]` | A set of lifecycle hooks (e.g., `onStart`, `onEnd`) for observing or modifying agent behavior at runtime. |
| `guideRails` | `GuideRailAgent[]` | A list of specialized agents that enforce rules, policies, or constraints on the agent's inputs and outputs. |

### The `process` Method

The `process` method is the central component of every agent. It is defined as an `abstract` method in the base `Agent` class, which mandates that any concrete agent class must provide an implementation. This method contains the core logic that defines what the agent does.

The method receives the validated input message and invocation options, including the execution `Context`, and is responsible for producing an output.

```typescript Agent.ts icon=logos:typescript
export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ... constructor and other properties

  /**
   * Core processing method of the agent, must be implemented in subclasses
   *
   * @param input Input message
   * @param options Options for agent invocation
   * @returns Processing result
   */
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;

  // ... other methods
}
```

The return value, `AgentProcessResult`, can be a direct object, a streaming response, an async generator, or another agent instance for task forwarding.

## Agent Lifecycle

The execution of an agent adheres to a structured lifecycle, which provides clear points for extension via hooks.

<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->
![Agents](assets/diagram/agents-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

1.  **Invocation**: An agent's execution is initiated by calling its `invoke()` method with an input payload.
2.  **`onStart` Hook**: The `onStart` hooks are triggered, providing an opportunity for pre-processing logic, such as logging or input transformation.
3.  **Input Validation**: The input data is automatically validated against the agent's `inputSchema`. If validation fails, the process is aborted.
4.  **`process()` Execution**: The core logic defined in the agent's `process()` method is executed.
5.  **Output Validation**: The result from the `process()` method is validated against the agent's `outputSchema`.
6.  **`onEnd` Hook**: The `onEnd` hooks are triggered with the final output or any error that occurred. This is the designated point for post-processing, logging results, or implementing custom failure handling.
7.  **Return Value**: The final, validated output is returned to the original caller.

This systematic lifecycle ensures that data is consistently validated and offers clear, non-invasive extension points for custom logic.

## Implementation Example

To create a functional agent, extend the base `Agent` class and implement the `process` method. The following example defines an agent that accepts two numbers and returns their sum.

```typescript title="adder-agent.ts" icon=logos:typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

// 1. Define the input and output schemas using Zod for validation.
const inputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const outputSchema = z.object({
  sum: z.number(),
});

// 2. Infer TypeScript types from the Zod schemas.
type AddAgentInput = z.infer<typeof inputSchema>;
type AddAgentOutput = z.infer<typeof outputSchema>;

// 3. Create the custom agent class by extending Agent.
export class AddAgent extends Agent<AddAgentInput, AddAgentOutput> {
  constructor() {
    super({
      name: "AddAgent",
      description: "An agent that adds two numbers.",
      inputSchema,
      outputSchema,
    });
  }

  // 4. Implement the core logic in the process method.
  async process(input: AddAgentInput, options: AgentInvokeOptions): Promise<AddAgentOutput> {
    const { a, b } = input;
    const sum = a + b;
    return { sum };
  }
}
```

This example illustrates the standard implementation pattern:
1.  Define Zod schemas for input and output data structures.
2.  Extend the `Agent` class with the corresponding input and output types.
3.  Provide the schemas and other metadata to the `super()` constructor.
4.  Implement the agent's specific logic within the `process` method.

## Summary

The `Agent` class is the foundational abstraction in the AIGNE Framework. It provides a consistent and robust contract for all operational units, ensuring they are identifiable, adhere to clear data schemas, and follow a predictable execution lifecycle. By abstracting this common machinery, the framework allows developers to focus exclusively on implementing the unique logic required for their tasks within the `process` method.

For details on how agents are executed and managed by the central engine, refer to the [AIGNE](./developer-guide-core-concepts-aigne-engine.md) documentation. To explore the various specialized agent implementations available, see the [Agent Types](./developer-guide-agents.md) section.