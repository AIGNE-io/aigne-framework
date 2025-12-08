# Parallel Tasks

In some situations, you need to perform several independent tasks at the same time to be more efficient. The parallel tasks workflow is designed for this purpose. It allows multiple AI agents to work simultaneously on the same initial information, with their individual results collected and combined at the end.

This approach is like hiring a team of specialists to analyze a business proposal. One specialist might focus on financial viability, another on market trends, and a third on legal risks. They all start with the same proposal and work at the same time, and their final reports are gathered to give a complete picture. This is much faster than if they had to wait for each other to finish.

This workflow is managed by an [Agent Team](./user-guide-understanding-agents-agent-teams.md) configured to operate in parallel mode. For a different approach where tasks are done one after another, see the [Sequential Tasks](./user-guide-common-workflows-sequential-tasks.md) workflow.

## How It Works

The parallel workflow follows a clear, efficient process for handling tasks that don't depend on each other. The flow is designed to maximize speed by running all agents at once.

The following diagram illustrates this process:

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Parallel Tasks](assets/diagram/parallel-tasks-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

1.  **Single Input**: The process begins with a single piece of information, like a document, a user query, or a set of data.
2.  **Simultaneous Distribution**: The Agent Team takes this input and distributes the *exact same information* to every agent in the team.
3.  **Independent Processing**: All agents start working at the same time. Each agent performs its specialized task based on its unique instructions, without waiting for or interacting with the other agents.
4.  **Result Aggregation**: As each agent finishes its work, its output is collected. The Agent Team then aggregates these individual outputs into a single, combined result. If multiple agents produce an output for the same field, the system typically accepts the result from whichever agent finishes first.

This structure ensures that the total time required to complete all tasks is determined by the longest-running agent, rather than the sum of all their times.

## Common Use Cases

The parallel workflow is best suited for scenarios where multiple, independent analyses or tasks are needed on the same piece of information, and speed is a priority.

<x-cards data-columns="2">
  <x-card data-title="Multi-Perspective Content Analysis" data-icon="lucide:scan-text">
    When analyzing a document, one agent could extract key features, another could analyze the emotional tone (sentiment), and a third could identify the target audience. All three tasks can happen at once.
  </x-card>
  <x-card data-title="Parallel Data Queries" data-icon="lucide:database-zap">
    If you need to search for information across different sources (e.g., a customer database, a product catalog, and a knowledge base), you can dispatch an agent for each source to search simultaneously.
  </x-card>
  <x-card data-title="Competitive Analysis" data-icon="lucide:bar-chart-3">
    To analyze a competitor's product, one agent could gather recent customer reviews, another could find pricing information, and a third could look up technical specifications, all in parallel.
  </x-card>
  <x-card data-title="Code Review" data-icon="lucide:code-2">
    For a piece of code, one agent can check for security vulnerabilities while another checks for adherence to style guidelines. The feedback is then combined for the developer.
  </x-card>
</x-cards>

## Summary

The parallel tasks workflow is a powerful pattern for improving efficiency. By allowing multiple agents to work independently and simultaneously, it significantly reduces the time needed to complete complex jobs that involve several unrelated sub-tasks. This makes it a fundamental workflow for building responsive and powerful AI applications.

To see how agents can work together in a different way, read about the [Sequential Tasks](./user-guide-common-workflows-sequential-tasks.md) workflow next.