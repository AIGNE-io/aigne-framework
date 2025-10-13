This document provides a developer-oriented guide to the foundational components of the AIGNE framework. Understanding these concepts is essential for building robust and sophisticated multi-agent systems. We'll cover the `Agent`, the `AIGNE Context`, and the mechanisms that enable them to communicate, remember, and extend their capabilities.

### Core Components Diagram

To begin, let's visualize how the core components of AIGNE interact. The following diagram illustrates the relationships between an Agent, the AIGNE Context, Topics, Memory, and Skills.

```d2
direction: down

AIGNE-Context: {
  label: "AIGNE Context"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Agent: {
    label: "Agent"
    shape: rectangle
    style: {
      fill: "#e6f7ff"
      stroke: "#91d5ff"
    }
  }

  Topics: {
    label: "Topics\n(Communication Bus)"
    shape: rectangle
  }

  Memory: {
    label: "Memory\n(State & History)"
    shape: cylinder
  }

  Skills: {
    label: "Skills\n(Extended Capabilities)"
    shape: rectangle
  }
}

AIGNE-Context.Agent <-> AIGNE-Context.Topics: "Communicates via"
AIGNE-Context.Agent <-> AIGNE-Context.Memory: "Reads/Writes"
AIGNE-Context.Agent <-> AIGNE-Context.Skills: "Uses"
```

---

## The Agent Class

The `Agent` is the fundamental building block in the AIGNE framework. It is an autonomous entity that can perform tasks, process information, and communicate with other agents. Every custom agent you create will extend this base class.

### Key Concepts

*   **`name` & `description`**: Each agent has a `name` for identification and an optional `description` explaining its purpose. This is crucial for debugging and for other agents to understand its capabilities.
*   **Schemas (`inputSchema`, `outputSchema`)**: Agents define their input and output structures using Zod schemas. This ensures that all data passed to and from an agent is validated, preventing errors and ensuring predictable interactions.
*   **`process` Method**: The core logic of an agent resides in its `process` method. This is an abstract method that you must implement in your subclass. It receives the input message and invocation options (including the context) and returns the result. The result can be a direct object, a data stream, or even another agent to which the task is handed off.

### Core Responsibilities

The `Agent` base class provides a robust foundation for:
*   Processing structured input and output.
*   Communicating with other agents via a topic-based messaging system.
*   Maintaining memory of past interactions.
*   Utilizing `Skills` (other agents) to delegate tasks and extend functionality.
*   Supporting both streaming and non-streaming responses.

### Example: Creating a Custom Agent

Here is a basic example of a custom agent that takes a name and returns a greeting.

```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

// Define the input and output message types
interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

// Create the custom agent
class GreeterAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreeterAgent",
      description: "An agent that generates a personalized greeting.",
      inputSchema: z.object({
        name: z.string().describe("The name of the person to greet."),
      }),
      outputSchema: z.object({
        greeting: z.string().describe("The generated greeting message."),
      }),
    });
  }

  // Implement the core logic in the process method
  async process(input: GreetingInput, options: AgentInvokeOptions) {
    const { name } = input;
    return {
      greeting: `Hello, ${name}! Welcome to the AIGNE framework.`,
    };
  }
}
```

## The AIGNE Context

The `Context` (`AIGNEContext`) is the runtime environment in which an agent operates. It is passed to the agent during invocation and is essential for its execution. The context is not a passive object; it's the gateway to the entire AIGNE ecosystem.

### Key Responsibilities

*   **Inter-Agent Communication**: The context provides the `publish` and `subscribe` methods, allowing agents to communicate through named topics without being directly coupled.
*   **State and Memory Management**: It manages the overall state and provides access to memory systems.
*   **Event Management**: The context includes an event emitter that broadcasts key lifecycle events (e.g., `agentStarted`, `agentSucceed`, `agentFailed`). This is crucial for monitoring, logging, and debugging the system.
*   **Resource and Limit Enforcement**: It tracks resource usage, such as the number of agent invocations, and can enforce limits to prevent runaway processes.

## Communication via Topics

Agents in AIGNE communicate using a publish-subscribe (pub/sub) messaging model, orchestrated by the `Context`. This decouples agents from one another, allowing for a flexible and scalable architecture.

*   **`subscribeTopic`**: An agent can declare one or more topics it wants to listen to. When a message is published to a subscribed topic, the context will automatically trigger the agent's `onMessage` handler, which in turn invokes the agent.
*   **`publishTopic`**: After processing, an agent can publish its output to one or more topics. This allows other interested agents to react to the result. The `publishTopic` can be a static string or a function that dynamically determines the topic based on the output message.

This system enables you to build complex workflows where agents react to events and data produced by others, forming a collaborative multi-agent system.

## Memory

For an agent to be truly intelligent, it needs to remember past interactions. AIGNE provides a `MemoryAgent` that can be attached to any agent.

When configured, an agent will automatically:
1.  **Record Interactions**: After successfully processing a message, the agent records the input and output pair into its associated memory.
2.  **Retrieve Memories**: Before processing, an agent can query its memory to retrieve relevant past interactions, providing valuable context for its current task.

This allows agents to learn from experience, maintain conversation history, and perform tasks that require knowledge of previous events.

## Skills

To promote modularity and reuse, an agent's capabilities can be extended with **`Skills`**. A skill is simply another `Agent`. By adding a skill to an agent, you give it the ability to delegate specific tasks to that skill.

For example, a complex "TripPlanner" agent might use several skills:
*   A `FlightSearchAgent` to find flights.
*   A `HotelBookingAgent` to book accommodation.
*   A `WeatherAgent` to check the forecast.

The `TripPlanner` agent doesn't need to know the implementation details of these tasks. It simply invokes them as skills, orchestrating their results to achieve its main goal. This follows the "composition over inheritance" principle and is key to building complex, maintainable agent systems.

## Agent Lifecycle and Hooks

Every agent invocation goes through a defined lifecycle, and you can tap into this lifecycle using **`Hooks`**. Hooks allow you to execute custom logic at key stages of the process without modifying the agent's core implementation.

Key lifecycle events include:
*   **`onStart`**: Before the agent's `process` method is called.
*   **`onEnd`**: After the agent has finished, regardless of success or failure.
*   **`onSuccess`**: After the agent completes successfully.
*   **`onError`**: When an error occurs during processing.
*   **`onSkillStart` / `onSkillEnd`**: Before and after a skill is invoked.

Hooks are incredibly powerful for logging, monitoring, metric collection, and implementing cross-cutting concerns like authentication or caching.