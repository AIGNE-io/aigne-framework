# Hooks

Hooks provide a powerful mechanism to observe, intercept, and inject custom logic into an agent's execution lifecycle. They allow you to add functionalities like logging, monitoring, input/output transformation, and custom error handling without altering the core implementation of an agent.

This guide details the agent execution lifecycle, the available hooks, and how to implement them effectively.

## Agent Execution Lifecycle

Understanding the agent's execution lifecycle is crucial for using hooks correctly. When an agent is invoked, it proceeds through a series of steps, with hooks being triggered at specific points.

The following diagram illustrates the sequence of events and the corresponding hooks that are called during an agent's invocation.

```d2 AIGNE Hooks Lifecycle icon=material-symbols:account-tree-outline
direction: down
style: {
  font-size: 14
}

InvokeAgent: "AIGNE.invoke(agent, input)" {
  shape: step
  style.fill: "#D5E8D4"
}

onStart: "onStart Hook" {
  shape: hexagon
  style.fill: "#F8CECC"
}

InputValidation: "Input Schema Validation" {
  shape: step
}

Preprocess: "agent.preprocess()" {
  shape: step
}

Process: "agent.process()" {
  shape: rectangle
  style.fill: "#DAE8FC"
}

Postprocess: "agent.postprocess()" {
  shape: step
}

OutputValidation: "Output Schema Validation" {
  shape: step
}

Result: {
  shape: diamond
  style.fill: "#E1D5E7"
}

onSuccess: "onSuccess Hook" {
  shape: hexagon
  style.fill: "#F8CECC"
}

onError: "onError Hook" {
  shape: hexagon
  style.fill: "#F8CECC"
}

onEnd: "onEnd Hook" {
  shape: hexagon
  style.fill: "#F8CECC"
}

ReturnOutput: "Return Output" {
  shape: step
  style.fill: "#D5E8D4"
}

ThrowError: "Throw Error" {
  shape: step
  style.fill: "#F8CECC"
}

InvokeAgent -> onStart -> InputValidation -> Preprocess -> Process

Process -> Postprocess -> OutputValidation -> Result

Result -> "Success" -> onSuccess -> onEnd -> ReturnOutput
Result -> "Failure" -> onError -> onEnd -> ThrowError

subgraph "Skill Invocation (within process)" {
  label: "Skill Invocation (within process)"
  direction: down
  style.stroke-dash: 2

  onSkillStart: "onSkillStart Hook" {
    shape: hexagon
    style.fill: "#FFF2CC"
  }

  InvokeSkill: "invokeSkill()" {
    shape: rectangle
  }

  onSkillEnd: "onSkillEnd Hook" {
    shape: hexagon
    style.fill: "#FFF2CC"
  }

  onSkillStart -> InvokeSkill -> onSkillEnd
}
```

## Available Hooks

Hooks are defined within an `AgentHooks` object. Each hook can be implemented as either a function or a separate, dedicated agent.

<x-field-group>
  <x-field data-name="onStart" data-type="function | Agent">
    <x-field-desc markdown>Triggered at the very beginning of an agent's invocation, before input validation. It can be used to modify the initial `input` or `options`.</x-field-desc>
  </x-field>
  <x-field data-name="onSuccess" data-type="function | Agent">
    <x-field-desc markdown>Triggered after the agent's `process` method completes successfully and the output has been validated. It can be used to transform the final `output`.</x-field-desc>
  </x-field>
  <x-field data-name="onError" data-type="function | Agent">
    <x-field-desc markdown>Triggered when an error is thrown during any stage of the execution. It can be used to implement custom error logging or a retry mechanism by returning `{ retry: true }`.</x-field-desc>
  </x-field>
  <x-field data-name="onEnd" data-type="function | Agent">
    <x-field-desc markdown>Triggered at the very end of an agent's invocation, regardless of whether it succeeded or failed. It's suitable for cleanup tasks, final logging, or metric collection.</x-field-desc>
  </x-field>
  <x-field data-name="onSkillStart" data-type="function | Agent">
    <x-field-desc markdown>Triggered just before an agent invokes one of its skills (a sub-agent). This is useful for tracing the delegation of tasks between agents.</x-field-desc>
  </x-field>
  <x-field data-name="onSkillEnd" data-type="function | Agent">
    <x-field-desc markdown>Triggered after a skill invocation completes, whether it succeeds or fails. It receives the skill's result or the error.</x-field-desc>
  </x-field>
  <x-field data-name="onHandoff" data-type="function | Agent">
    <x-field-desc markdown>Triggered when an agent's `process` method returns another agent instance, effectively handing off control. This allows for monitoring of agent-to-agent transfers.</x-field-desc>
  </x-field>
</x-field-group>

## Implementing Hooks

Hooks can be attached to an agent in three ways:
1.  During agent instantiation via the `hooks` property in `AgentOptions`.
2.  At invocation time via the `hooks` property in `AgentInvokeOptions`.
3.  Globally on the `AIGNEContext` instance.

### Example 1: Basic Logging

Here is a simple example of a hook that logs the start and end of an agent's execution.

```typescript Agent Logging Hook icon=logos:typescript
import { Agent, AIGNE, type AgentHooks } from "@aigne/core";

// Define the logging hook
const loggingHook: AgentHooks = {
  onStart: ({ agent, input }) => {
    console.log(`[${agent.name}] Starting execution with input:`, input);
  },
  onEnd: ({ agent, input, output, error }) => {
    if (error) {
      console.error(`[${agent.name}] Execution failed for input:`, input, "Error:", error);
    } else {
      console.log(`[${agent.name}] Execution succeeded with output:`, output);
    }
  },
};

// Define a simple agent
class MyAgent extends Agent {
  async process(input: { message: string }) {
    return { reply: `You said: ${input.message}` };
  }
}

// Instantiate the agent with the hook
const myAgent = new MyAgent({
  name: "EchoAgent",
  hooks: [loggingHook],
});

const aigne = new AIGNE();
await aigne.invoke(myAgent, { message: "hello" });

// Console Output:
// [EchoAgent] Starting execution with input: { message: 'hello' }
// [EchoAgent] Execution succeeded with output: { reply: 'You said: hello' }
```

### Example 2: Modifying Input with `onStart`

The `onStart` hook can return an object to modify the `input` that the agent will receive.

```typescript Modifying Agent Input icon=logos:typescript
import { Agent, AIGNE, type AgentHooks } from "@aigne/core";

const inputModificationHook: AgentHooks = {
  onStart: ({ input }) => {
    // Add a timestamp to the input message
    const newInput = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    return { input: newInput };
  },
};

class GreeterAgent extends Agent {
  async process(input: { name: string; timestamp?: string }) {
    return { greeting: `Hello, ${input.name}! (processed at ${input.timestamp})` };
  }
}

const agent = new GreeterAgent({ hooks: [inputModificationHook] });

const aigne = new AIGNE();
const result = await aigne.invoke(agent, { name: "Alice" });

console.log(result);
// {
//   greeting: "Hello, Alice! (processed at 2023-10-27T10:00:00.000Z)"
// }
```

### Example 3: Custom Retry with `onError`

The `onError` hook can return `{ retry: true }` to signal that the AIGNE should re-attempt the agent's `process` method. This is useful for handling transient failures.

```typescript Custom Retry Hook icon=logos:typescript
import { Agent, AIGNE, type AgentHooks } from "@aigne/core";

let attempt = 0;

const retryHook: AgentHooks = {
  onError: ({ agent, error }) => {
    console.log(`[${agent.name}] Attempt failed: ${error.message}. Retrying...`);
    // Return true to signal a retry, but only for the first 2 attempts
    if (attempt < 2) {
      return { retry: true };
    }
    // Return nothing to let the error propagate
  },
};

class UnreliableAgent extends Agent {
  async process() {
    attempt++;
    if (attempt <= 2) {
      throw new Error("Service temporarily unavailable");
    }
    return { status: "OK" };
  }
}

const agent = new UnreliableAgent({ hooks: [retryHook] });

const aigne = new AIGNE();
const result = await aigne.invoke(agent, {});

console.log(result); // { status: 'OK' }
```

This agent will fail twice, and the `retryHook` will intercept the error and trigger a retry each time. On the third attempt, the agent succeeds.

## Hook Priority

Hooks can be defined on the agent, at invocation, and on the context. To manage the order of execution, hooks can have a `priority` property set to `"high"`, `"medium"`, or `"low"` (default).

Hooks are executed in the order of their priority: `high` > `medium` > `low`.

```typescript Hook Priority Example icon=logos:typescript
const highPriorityHook: AgentHooks = {
  priority: 'high',
  onStart: () => console.log('High priority hook executed.'),
};

const mediumPriorityHook: AgentHooks = {
  priority: 'medium',
  onStart: () => console.log('Medium priority hook executed.'),
};

const lowPriorityHook: AgentHooks = {
  // priority defaults to 'low'
  onStart: () => console.log('Low priority hook executed.'),
};

class MonitoredAgent extends Agent {
  async process(input: {}) {
    console.log('Agent processing...');
    return { success: true };
  }
}

const agent = new MonitoredAgent({
  hooks: [lowPriorityHook, highPriorityHook, mediumPriorityHook],
});

const aigne = new AIGNE();
await aigne.invoke(agent, {});


// Console Output:
// High priority hook executed.
// Medium priority hook executed.
// Low priority hook executed.
// Agent processing...
```

This predictable execution order is essential when one hook's logic depends on the outcome of another.

## Summary

Hooks are an essential tool for building robust and observable agent-based systems. They provide a clean, non-invasive way to add cross-cutting concerns like logging, instrumentation, and resilience patterns to your agents. By understanding the agent lifecycle and the capabilities of each hook, you can create sophisticated, production-ready AI applications.