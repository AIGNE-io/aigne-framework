# Sequential Tasks

A sequential task workflow processes a series of tasks in a specific, predetermined order. It operates like a digital assembly line, where the output of one step becomes the input for the next. This pattern is ideal for multi-stage processes where each step builds upon the work of the previous one.

In the AIGNE Framework, this is managed by a `TeamAgent` configured to run in `sequential` mode. Each agent in the team completes its task before passing the result along, ensuring a logical and orderly progression from start to finish.

```d2
direction: down

Initial-Request: {
  label: "Initial Request"
  shape: oval
}

TeamAgent: {
  label: "TeamAgent (sequential mode)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-1: {
    label: "Agent 1"
    shape: rectangle
  }

  Agent-2: {
    label: "Agent 2"
    shape: rectangle
  }

  Final-Agent: {
    label: "Final Agent"
    shape: rectangle
  }
}

Final-Result: {
  label: "Final Result"
  shape: oval
}

Initial-Request -> TeamAgent.Agent-1: "1. Initial Input"
TeamAgent.Agent-1 -> TeamAgent.Agent-2: "2. Output 1 + Initial Input"
TeamAgent.Agent-2 -> TeamAgent.Final-Agent: "3. Output 2 + Previous Input"
TeamAgent.Final-Agent -> Final-Result: "4. Final Output"

```

## How It Works

Imagine a request entering the workflow.

1.  The first agent in the sequence receives the initial input and processes it.
2.  Once complete, its output is combined with the original input.
3.  This combined result is then passed to the second agent in the sequence.
4.  This handoff process continues down the line until the final agent completes its task.
5.  The output from the last agent is the final result of the entire workflow.

This ensures that each agent has the full context of the work done by all preceding agents, allowing for the creation of complex and sophisticated pipelines.

## Common Use Cases

Sequential workflows are highly effective for tasks that require a structured, step-by-step approach.

-   **Content Generation Pipeline**: An initial agent brainstorms a topic, a second agent writes a draft, a third agent proofreads it, and a final agent formats it for publication.
-   **Data Processing (ETL)**: One agent extracts data from a source, another transforms it into a standardized format, and a third loads it into a database.
-   **Customer Inquiry Escalation**: A frontline agent answers a basic customer question. If the issue is complex, it passes the conversation history to a specialized technical support agent for resolution.
-   **Report Generation**: An agent gathers raw data, a second agent analyzes it and generates key insights, and a third agent compiles the findings into a formatted report.

## Summary

The sequential tasks workflow provides a reliable and structured way to automate complex, multi-step processes. By chaining agents together, you can build powerful and consistent automation pipelines where the order of operations is critical to achieving the desired outcome.

For tasks that can be performed simultaneously, consider the [Parallel Tasks](./user-guide-common-workflows-parallel-tasks.md) workflow to improve efficiency.