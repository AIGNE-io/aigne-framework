# Agent Hooks

Agent Hooks provide a powerful mechanism to tap into the lifecycle of an agent's execution. They allow you to insert custom logic at key points—such as before an agent starts, after it succeeds, or when an error occurs—without altering the agent's core implementation. This makes hooks ideal for logging, monitoring, tracing, modifying input/output, and implementing custom error-handling strategies.

## Core Concepts

### Lifecycle Events

You can attach custom logic to various lifecycle events of an agent. Each hook is triggered at a specific point in the execution process and receives relevant context, such as the input, output, or error.

Here are the available lifecycle hooks:

| Hook           | Trigger                                                               | Purpose                                                                                                                                                             |
| :------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onStart`      | Before the agent's `process` method is called.                        | Pre-process or validate input, log the start of an execution, or set up required resources. It can modify the input before the agent receives it.               |
| `onSuccess`    | After the agent's `process` method completes successfully.            | Post-process or validate the output, log successful results, or perform cleanup. It can modify the final output.                                                |
| `onError`      | When an error is thrown during the agent's execution.                 | Log errors, send notifications, or implement custom retry logic. It can signal the agent to retry the operation.                                                |
| `onEnd`        | After `onSuccess` or `onError` has been called.                       | Perform cleanup operations regardless of the outcome, such as closing connections or releasing resources. It can also modify the final output or trigger a retry. |
| `onSkillStart` | Before a skill (a sub-agent) is invoked by the current agent.         | Intercept and log skill invocations or modify the input being passed to the skill.                                                                                |
| `onSkillEnd`   | After a skill has completed its execution (successfully or not).      | Log the result or error from a skill, perform cleanup specific to that skill, or handle skill-specific errors.                                                    |
| `onHandoff`    | When one agent transfers control to another agent.                    | Track the flow of control in multi-agent systems and monitor how tasks are delegated between agents.                                                            |

### Hook Priority

Hooks can be assigned a `priority` to control their execution order when multiple hooks are registered for the same event. This is useful for ensuring that certain hooks, like authentication or validation, run before others.

The available priority levels are:
- `high`
- `medium`
- `low` (default)

Hooks are executed in order from `high` to `low` priority. This is handled by the `sortHooks` utility, ensuring a predictable execution sequence.

```typescript
// From packages/core/src/utils/agent-utils.ts
const priorities: NonNullable<AgentHooks["priority"]>[] = ["high", "medium", "low"];

export function sortHooks(hooks: AgentHooks[]): AgentHooks[] {
  return hooks
    .slice(0)
    .sort(({ priority: a = "low" }, { priority: b = "low" }) =>
      a === b ? 0 : priorities.indexOf(a) - priorities.indexOf(b),
    );
}
```

## Implementing Hooks

Hooks can be implemented in two ways: as simple callback functions or as separate, reusable `Agent` instances.

### 1. Function Hooks

For straightforward logic, you can define a hook as a function directly within an `AgentOptions` object. This is the most common and direct way to use hooks.

**Example: A Simple Logging Hook**

This example demonstrates a basic hook that logs the start and end of an agent's execution.

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // Assuming path to agent.ts

// Define a logging hook object
const loggingHook = {
  priority: "high",
  onStart: ({ agent, input }) => {
    console.log(`[INFO] Agent '${agent.name}' started with input:`, JSON.stringify(input));
  },
  onEnd: ({ agent, output, error }) => {
    if (error) {
      console.error(`[ERROR] Agent '${agent.name}' failed with error:`, error.message);
    } else {
      console.log(`[INFO] Agent '${agent.name}' succeeded with output:`, JSON.stringify(output));
    }
  }
};

// Create a new agent and attach the hook
const myAgent = new Agent({
  name: "DataProcessor",
  hooks: [loggingHook],
  // ... other agent options
});
```

### 2. Agent Hooks

For more complex or reusable logic, you can implement a hook as its own `Agent`. This allows you to encapsulate hook logic, manage its state, and reuse it across multiple agents. The input to the hook agent will be the event payload (e.g., `{ agent, input, error }`).

**Example: An Agent-Based Error Handler**

Here, `ErrorHandlingAgent` is an agent designed to act as an `onError` hook. It could contain logic to send alerts to a monitoring service.

```typescript
import { FunctionAgent, Agent, Message } from "./agent"; // Assuming path to agent.ts

// An agent that handles errors by sending alerts
const errorHandlingAgent = new FunctionAgent({
  name: "ErrorAlerter",
  process: async ({ agent, error }) => {
    console.log(`Alert! Agent ${agent.name} encountered an error: ${error.message}`);
    // In a real-world scenario, you might call an external monitoring API here.
  }
});

// An agent that might fail
class RiskyAgent extends Agent<{ command: string }, { result: string }> {
  async process(input) {
    if (input.command === "fail") {
      throw new Error("This operation was designed to fail.");
    }
    return { result: "Success!" };
  }
}

// Attach the error-handling agent as a hook
const riskyAgent = new RiskyAgent({
  name: "RiskyOperation",
  hooks: [
    {
      onError: errorHandlingAgent,
    }
  ],
});
```

## Modifying Execution Flow

Hooks are not just for observation; they can actively modify the agent's execution flow.

- **Modifying Input**: An `onStart` hook can return an object with a new `input` property, which will replace the original input passed to the agent's `process` method.
- **Modifying Output**: An `onSuccess` or `onEnd` hook can return an object with a new `output` property, which will replace the agent's original result.
- **Triggering Retries**: An `onError` or `onEnd` hook can return `{ retry: true }` to instruct the agent to re-run its `process` method. This is useful for handling transient errors.

**Example: Input Transformation and Retry Logic**

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // Assuming path to agent.ts

const transformationAndRetryHook = {
  onStart: ({ input }) => {
    // Standardize input before processing
    const transformedInput = { ...input, data: input.data.toLowerCase() };
    return { input: transformedInput };
  },
  onError: ({ error }) => {
    // Retry on network errors
    if (error.message.includes("network")) {
      console.log("Network error detected. Retrying...");
      return { retry: true };
    }
  }
};

const myAgent = new Agent({
  name: "NetworkAgent",
  hooks: [transformationAndRetryHook],
  // ... other agent options
});
```

## Declarative Configuration (YAML)

Hooks can also be defined declaratively in YAML configuration files, which is particularly useful when working with the AIGNE CLI. You can define hooks inline or reference them from other files.

**Example from `test-agent-with-hooks.yaml`**

This example shows a team agent that uses a variety of hooks, including an inline AI agent and hooks defined in an external file (`test-hooks.yaml`).

```yaml
# From: packages/core/test-agents/test-agent-with-hooks.yaml
type: team
name: test_agent_with_default_input
hooks:
  priority: high
  on_start:
    type: ai
    name: test_hooks_inline # An inline agent serving as a hook
  on_success: test-hooks.yaml # Reference to an external hook definition
  on_error: test-hooks.yaml
  on_end: test-hooks.yaml
  on_skill_start: test-hooks.yaml
  on_skill_end: test-hooks.yaml
  on_handoff: test-hooks.yaml
skills:
  - url: ./test-agent-with-default-input-skill.yaml
    hooks:
      # Hooks can also be attached to specific skills
      on_start: test-hooks.yaml
  - type: ai
    name: test_agent_with_default_input_skill2.yaml
    hooks:
      on_start: test-hooks.yaml
```

This declarative approach allows for clean separation of concerns, where the agent's logic is decoupled from cross-cutting concerns like logging, security, and error handling.