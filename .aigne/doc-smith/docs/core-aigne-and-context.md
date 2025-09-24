# AIGNE & Context

At the heart of any AIGNE-powered application are two core components that work together like a brain and its memory: the **AIGNE engine** and the **Context** object. Think of the AIGNE engine as the project manager in charge of getting a job done, and the Context as the shared whiteboard where all the important notes and progress are tracked.

Understanding how these two pieces interact is key to grasping how the AIGNE framework coordinates complex tasks. This section will break down each component and show you how they collaborate to bring your AI agents to life.

## The AIGNE Engine: The Orchestrator

The AIGNE engine is the central coordinator of the entire system. It doesn't perform the tasks itself, but it's responsible for orchestrating the different agents that do. Just like a project manager delegates work to team members, the AIGNE engine receives a user's request and decides which agent (or sequence of agents) is best suited to handle it.

Its main jobs are to:

- **Receive Initial Requests**: It's the first point of contact when a new task begins.
- **Delegate Tasks**: It analyzes the request and assigns it to the appropriate agent, whether that's an AI agent for generating text, a Function agent for running a specific tool, or a Team of agents for a multi-step process.
- **Manage the Flow**: It ensures that information flows correctly from one agent to another, making sure each step happens in the right order.

In short, the AIGNE engine is the director that makes sure the entire operation runs smoothly from start to finish.

## The Context: The Shared Memory

If the AIGNE engine is the director, the **Context** is the script and the production notes all rolled into one. It's an object that holds all the current information about a task. Every agent has access to the Context, allowing them to see what has already happened and to add their own results for others to use.

This shared memory is crucial for several reasons:

- **State Management**: It keeps track of the entire conversation or workflow history, so the system always knows what's going on. This is how an agent can remember what you talked about five minutes ago.
- **Information Sharing**: It allows different agents to collaborate by passing data between them. For example, one agent might fetch user data, and another might use that data to compose a personalized email. The data is passed through the Context.
- **Observability**: It provides a complete log of every step taken, every decision made, and every piece of data generated. This is incredibly useful for debugging and understanding how your application arrived at a particular result.

Essentially, the Context ensures that all agents are on the same page and have the information they need to do their jobs effectively.

## How They Work Together

The real power of the framework comes from the seamless interaction between the AIGNE engine and the Context. A typical workflow looks something like this:

```d2 AIGNE and Context Interaction Flow icon=lucide:workflow
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  AIGNE-Engine: {
    label: "AIGNE Engine\n(Orchestrator)"
    shape: rectangle
  }

  Context: {
    label: "Context\n(Shared Memory)"
    shape: cylinder
  }

  Agent: {
    label: "Agent\n(Worker)"
    shape: rectangle
  }
}

User -> AIGNE-Framework.AIGNE-Engine: "1. Sends Request"
AIGNE-Framework.AIGNE-Engine <-> AIGNE-Framework.Context: "2. Reads/Writes State"
AIGNE-Framework.AIGNE-Engine -> AIGNE-Framework.Agent: "3. Dispatches Task"
AIGNE-Framework.Agent -> AIGNE-Framework.Context: "4. Updates with Result"
AIGNE-Framework.AIGNE-Engine -> User: "5. Sends Final Response"
```

1.  **A User Sends a Request**: A task begins, for example, "Summarize my latest sales report."
2.  **The AIGNE Engine Takes Action**: The engine receives the request and consults the `Context` to see if there's any relevant existing information.
3.  **An Agent is Dispatched**: The engine determines the best agent for the job and gives it the task, along with access to the `Context`.
4.  **The Agent Updates the Context**: The agent performs its work (e.g., finds and reads the sales report) and writes the summary back into the `Context`.
5.  **The Cycle Repeats**: The AIGNE engine checks the `Context` again, sees the summary is ready, and either dispatches another agent for the next step or delivers the final result to the user.

## Summary

The AIGNE engine and the Context object are the foundational pillars of the framework. The engine provides the **orchestration** and decision-making, while the Context provides the **memory** and state management. Together, they create a robust environment where multiple specialized agents can collaborate to solve complex problems.

Now that you understand the roles of the orchestrator and the shared memory, it's time to meet the workers. Let's dive into the different types of [Agents](./core-agents.md) you can use in your applications.