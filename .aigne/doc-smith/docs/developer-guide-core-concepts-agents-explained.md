# Agents Explained

The `Agent` is the fundamental building block in the AIGNE framework. Conceptually, an agent is an autonomous entity designed to perform a specific task. It receives input, processes it according to its defined logic, and produces an output. Every specialized agent in the framework, such as `AIAgent` or `TeamAgent`, inherits from this base `Agent` class.

This section details the structure, properties, and lifecycle of the base `Agent` class, providing the foundational knowledge needed to create custom agents.

## Core Properties

An `Agent` is configured through its options, which define its identity, behavior, and capabilities. The primary properties are outlined below.

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="A unique identifier for the agent. If not provided, it defaults to the class constructor name. It's used for logging and identification purposes."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A human-readable description of what the agent does. This is useful for documentation and for other agents to understand its purpose."></x-field>
  <x-field data-name="inputSchema" data-type="ZodObject" data-required="false" data-desc="A Zod schema that defines the expected structure of the input data. The agent uses this to validate incoming messages."></x-field>
  <x-field data-name="outputSchema" data-type="ZodObject" data-required="false" data-desc="A Zod schema that defines the structure of the agent's output. This ensures the agent produces consistent and valid results."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="A list of other agents that this agent can invoke. Skills allow you to compose complex behaviors by delegating tasks to specialized sub-agents."></x-field>
  <x-field data-name="memory" data-type="MemoryAgent | MemoryAgent[]" data-required="false" data-desc="One or more memory agents that this agent can use to store and retrieve information from past interactions, enabling stateful conversations."></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="The topic(s) the agent subscribes to on the message queue. The agent will process any message published to these topics."></x-field>
  <x-field data-name="publishTopic" data-type="string | string[] | Function" data-required="false" data-desc="The topic(s) the agent publishes its output to. This allows other agents to react to its results."></x-field>
</x-field-group>

## The Agent Lifecycle

When an agent is called, it proceeds through a well-defined lifecycle of methods. This ensures that execution is predictable and provides hooks for pre-processing, post-processing, and error handling.

The primary entry point for executing an agent is the `invoke()` method.

```typescript Agent Lifecycle Flow icon=lucide:workflow
direction: right
style: {
  fill: "#f2f2f2"
}

invoke: Start

subgraph Pre-Process {
  style.label: {
    "font-size": 12
  }
  call_hooks: Call 'onStart' hooks
  validate_input: Validate Input Schema
  preprocess: Run preprocess()
}

subgraph Core-Logic {
  style.label: {
    "font-size": 12
  }
  process: Run abstract process()
}

subgraph Post-Process {
  style.label: {
    "font-size": 12
  }
  validate_output: Validate Output Schema
  postprocess: Run postprocess()
  call_hooks_2: Call 'onSuccess'/'onEnd' hooks
  publish: Publish to Topics
}

error_handling: {
  shape: cylinder
  label: Error Handling
}

invoke -> call_hooks -> validate_input -> preprocess -> process
process -> validate_output -> postprocess -> call_hooks_2 -> publish

validate_input -> error_handling: fail
process -> error_handling: fail
validate_output -> error_handling: fail
postprocess -> error_handling: fail

```

1.  **Invocation**: The `invoke(input, options)` method is called. It sets up the execution context and initiates the lifecycle.
2.  **Start Hooks**: The `onStart` lifecycle hooks are executed. These can be used for logging or modifying the input before processing.
3.  **Input Validation**: The incoming `input` is validated against the agent's `inputSchema`. An error is thrown if the validation fails.
4.  **Preprocessing**: The `preprocess()` method is called. This internal method handles tasks like checking context status and usage limits.
5.  **Core Processing**: The `process(input, options)` method is executed. This is the abstract method that every agent subclass must implement. It contains the core logic of the agent and is where the main work is done.
6.  **Output Validation**: The result from the `process()` method is validated against the agent's `outputSchema`.
7.  **Postprocessing**: The `postprocess()` method is called. This internal method handles tasks like publishing results to topics and recording interactions to memory.
8.  **End Hooks**: The `onSuccess` and `onEnd` hooks are executed, allowing for final logging, cleanup, or result transformation.
9.  **Return Value**: The final, validated output is returned to the original caller.

If an error occurs at any stage, the flow is interrupted, and the `onError` and `onEnd` hooks are executed as part of the `processAgentError` routine.

## The `process()` Method

The `process()` method is the heart of every agent. It's an `abstract` method in the base class, meaning you **must** implement it in your own custom agent. This method defines the agent's unique behavior.

The `process()` method is highly flexible and can return several types of values, enabling different execution patterns:

1.  **Direct Object**: For simple, synchronous-like operations, you can return the final output object directly.

    ```typescript Direct Object Return icon=logos:typescript
    import { Agent, type AgentInvokeOptions } from "@aigne/core";

    class EchoAgent extends Agent<{ message: string }, { response: string }> {
      process(input: { message: string }, options: AgentInvokeOptions) {
        // Return the final object directly
        return { response: `You said: ${input.message}` };
      }
    }
    ```

2.  **Streaming Response (`ReadableStream`)**: For long-running tasks or real-time updates, you can return a `ReadableStream` of `AgentResponseChunk` objects.

    ```typescript Streaming Response icon=logos:typescript
    import { Agent, type AgentInvokeOptions, objectToAgentResponseStream } from "@aigne/core";

    class TickerAgent extends Agent<{ count: number }, { tick: number }> {
      process(input: { count: number }, options: AgentInvokeOptions) {
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 1; i <= input.count; i++) {
              await new Promise(resolve => setTimeout(resolve, 500));
              const chunk = { delta: { json: { tick: i } } };
              controller.enqueue(chunk);
            }
            controller.close();
          }
        });
        return stream;
      }
    }
    ```

3.  **Async Generator**: As a more syntactically convenient way to create streams, you can use an `async* function` (an async generator).

    ```typescript Async Generator icon=logos:typescript
    import { Agent, type AgentInvokeOptions } from "@aigne/core";

    class AsyncTickerAgent extends Agent<{ count: number }, { tick: number }> {
      async* process(input: { count: number }, options: AgentInvokeOptions) {
        for (let i = 1; i <= input.count; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          // Yield each chunk of data
          yield { delta: { json: { tick: i } } };
        }
      }
    }
    ```

4.  **Another Agent (Handoff)**: You can return another `Agent` instance to transfer control or hand off the task. The framework will automatically invoke the returned agent with the original input.

    ```typescript Agent Handoff icon=logos:typescript
    import { Agent, type AgentInvokeOptions, FunctionAgent } from "@aigne/core";

    const SpecialistAgent = new FunctionAgent({
      name: "Specialist",
      process: async (input: { task: string }) => ({ result: `Completed ${input.task}` })
    });

    class RouterAgent extends Agent<{ task: string }, { result: string }> {
      process(input: { task: string }, options: AgentInvokeOptions) {
        if (input.task === "special") {
          // Handoff to another agent
          return SpecialistAgent;
        }
        return { result: "Completed generic task" };
      }
    }
    ```

## Summary

The base `Agent` class provides a robust foundation for creating specialized AI workers. It establishes a clear lifecycle, handles data validation, and offers a flexible `process` method to implement any desired behavior. Understanding these core concepts is the first step toward building powerful, modular AI applications.

To see how this base class is extended into concrete implementations, proceed to the [Agent Types & Examples](./developer-guide-agent-types-and-examples.md) section.