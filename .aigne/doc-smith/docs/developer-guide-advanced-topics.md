This document provides a developer-focused guide to the core concepts of the AIGNE framework. It explains the fundamental building blocks, their interactions, and the overall architecture, enabling engineers to effectively build and integrate with the system.

### Core Concepts of the AIGNE Framework

The AIGNE framework is designed around a central component: the **Agent**. Understanding the Agent and its related concepts is key to harnessing the full power of the platform. This guide will walk you through the essential building blocks, from the Agent's lifecycle to its powerful composition features like Skills and Memory.

### What is an Agent?

An Agent is the fundamental actor in the AIGNE ecosystem. It is an autonomous entity designed to perform specific tasks by processing input, making decisions, and producing a structured output. Each agent encapsulates its own logic, configuration, and capabilities.

The base for all agents is the `Agent` class, defined in `packages/core/src/agents/agent.ts`. It provides the core structure for:

-   **Input and Output Schemas**: Using Zod schemas (`inputSchema`, `outputSchema`) to ensure data integrity.
-   **Core Processing Logic**: The abstract `process` method, which must be implemented by subclasses to define the agent's unique behavior.
-   **Lifecycle Hooks**: A mechanism to intercept and add functionality at various stages of an agent's execution (e.g., `onStart`, `onEnd`).
-   **Skills and Memory**: Features for composing complex behaviors and maintaining state.

```typescript
// packages/core/src/agents/agent.ts

export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ...
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;
  // ...
}
```

### The Agent Lifecycle

Every agent follows a well-defined lifecycle when it is invoked. This lifecycle ensures consistent execution, validation, and observability. The `invoke` method is the entry point that kicks off this process.

Here is a diagram illustrating the key stages of the agent lifecycle:

```d2
direction: down

invoke: {
  label: "invoke()"
  shape: oval
}

onStart: {
  label: "onStart Hook"
  shape: rectangle
}

validateInput: {
  label: "Validate Input\n(inputSchema)"
  shape: diamond
}

process: {
  label: "process() Method\n(Core Logic)"
  shape: rectangle
}

validateOutput: {
  label: "Validate Output\n(outputSchema)"
  shape: diamond
}

onEnd: {
  label: "onEnd Hook"
  shape: rectangle
}

returnResult: {
  label: "Return Result"
  shape: oval
}

returnError: {
  label: "Return Error"
  shape: oval
}

invoke -> onStart
onStart -> validateInput
validateInput -> process: "Valid"
validateInput -> returnError: "Invalid"
process -> validateOutput
validateOutput -> onEnd: "Valid"
validateOutput -> returnError: "Invalid"
onEnd -> returnResult
```

### Agent Specializations

The AIGNE framework provides several specialized agent types, each tailored for a specific purpose. These are defined in `packages/core/src/loader/agent-yaml.ts` and are typically specified by the `type` property in a YAML configuration file.

-   **AI Agent (`type: "ai"`)**: The most common type, designed to interact with Large Language Models (LLMs). It uses a `PromptBuilder` to construct a detailed prompt from instructions, input, memory, and available skills (tools), then processes the model's response.
-   **Team Agent (`type: "team"`)**: Acts as an orchestrator or manager for a group of other agents (skills). It can process inputs sequentially, in parallel, or in more complex workflows like reflection, where one agent reviews another's work.
-   **Function Agent (`type: "function"`)**: A lightweight wrapper that turns any JavaScript/TypeScript function into an agent. This is ideal for integrating custom business logic, calculations, or third-party API calls directly into the agent ecosystem.
-   **Transform Agent (`type: "transform"`)**: A utility agent that uses JSONata queries to restructure or transform JSON data from one format to another. It's perfect for adapting the output of one agent to match the input requirements of another.
-   **Image Agent (`type: "image"`)**: Specialized for interacting with image generation models. It takes instructions and generates images.
-   **MCP Agent (`type: "mcp"`)**: Facilitates interaction with external systems or command-line tools.

### Composition: Building Complex Systems

The true power of AIGNE lies in composing simple, specialized agents into complex, sophisticated systems. This is achieved through three primary mechanisms: Skills, Hooks, and Memory.

#### Skills

An agent can be equipped with a list of **Skills**, which are other agents it can invoke. This allows for a modular and hierarchical design. For example, a "Travel Planner" `TeamAgent` might use a "Flight Booker" `AIAgent`, a "Hotel Finder" `FunctionAgent`, and a "Currency Converter" `TransformAgent` as its skills. The parent agent can delegate tasks to the appropriate skill, orchestrating their combined outputs to achieve a complex goal.

```typescript
// packages/core/src/agents/agent.ts
export interface AgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<Pick<Agent, "guideRails">> {
  // ...
  skills?: (Agent | FunctionAgentFn)[];
  // ...
}
```

#### Hooks

**Hooks** provide a powerful mechanism for observability and extending agent behavior without modifying their core logic. They allow you to attach custom functionality to different stages of the agent lifecycle (`onStart`, `onEnd`, `onError`, `onSkillStart`, etc.). This is useful for:

-   Logging and tracing agent execution.
-   Implementing custom error handling and retry logic.
-   Modifying inputs or outputs on the fly.
-   Monitoring performance and costs.

#### Memory

Agents can be configured with **Memory** to maintain state and context across multiple invocations. A `MemoryAgent` can record the inputs and outputs of an agent's interactions. During subsequent invocations, the agent can retrieve this history, allowing it to "remember" past conversations or results. This is crucial for building conversational AI, multi-step workflows, and agents that learn from experience.

### Configuration with YAML

While agents can be defined and configured programmatically in TypeScript, the most common approach is to define them in `.yaml` files. The `loadAgentFromYamlFile` function in `packages/core/src/loader/agent-yaml.ts` parses these files and constructs the corresponding agent objects. This separation of configuration from logic makes agents easier to manage, share, and modify without changing code.

Here is a simple example of an `AIAgent` defined in YAML:

```yaml
type: ai
name: Greeter
description: A simple agent that greets the user.

instructions: "You are a friendly assistant. Greet the user based on their name and wish them a good day."

inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "The name of the person to greet."
  required:
    - name

outputSchema:
  type: object
  properties:
    greeting:
      type: string
      description: "The personalized greeting message."
  required:
    - greeting
```

### Prompt Engineering with `PromptBuilder`

For `AIAgent`, the `PromptBuilder` class (`packages/core/src/prompt/prompt-builder.ts`) is a critical component. It is responsible for dynamically constructing the final prompt that gets sent to the language model. It intelligently assembles various pieces of context:

-   **System Instructions**: The base instructions defined in the agent's configuration.
-   **User Input**: The specific input provided for the current invocation.
-   **Memory**: Past interactions retrieved from the `MemoryAgent`.
-   **Tools/Skills**: The definitions of the available skills, which the model can choose to use.

This sophisticated assembly allows for highly contextual and powerful interactions with the underlying AI models.

### Conclusion

The AIGNE framework provides a robust and flexible architecture centered around the **Agent**. By understanding the agent lifecycle, specializing agents for specific tasks, and composing them using skills, hooks, and memory, developers can build powerful and complex autonomous systems. The use of YAML for configuration further enhances modularity and ease of management.
