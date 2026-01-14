# Agent Teams

While a single, specialized agent is useful for a specific task, some problems are too large or complex for one agent to handle alone. Just as in a human organization, when a task requires multiple steps or diverse skills, you assemble a team. In AIGNE, an Agent Team is a group of agents organized to collaborate on solving a larger goal.

Think of it this way: if a [Basic Agent](./user-guide-understanding-agents-basic-agents.md) is a specialist like a graphic designer, an Agent Team is the entire marketing department, including a copywriter, a strategist, and the designer, all working together on a campaign.

## How Agent Teams Collaborate

Agent Teams can be configured to work together in different ways, depending on the nature of the task. The two primary modes of collaboration are sequential and parallel.

### Sequential Workflow: The Assembly Line

In a sequential workflow, agents execute tasks one after another in a specific order. The output of the first agent becomes the input for the second agent, and so on, much like an assembly line. This approach is ideal for processes where each step depends on the completion of the previous one.

For example, to write a blog post, a team might work as follows:
1.  **Researcher Agent:** Gathers information and key facts about a topic.
2.  **Writer Agent:** Takes the research and drafts the blog post.
3.  **Editor Agent:** Reviews the draft for grammar and style, and provides the final version.

### Parallel Workflow: The Brainstorming Session

In a parallel workflow, all agents in the team work on the same initial input simultaneously. Each agent performs its specialized task independently, and their individual outputs are then combined to form a final result. This is similar to a brainstorming session where different experts contribute their unique perspectives on a problem at the same time.

For example, to analyze market sentiment, a team could work in parallel:
*   **Input:** A company's name.
*   **Social Media Agent:** Scans Twitter for mentions.
*   **News Agent:** Searches for recent news articles.
*   **Financial Agent:** Looks up recent stock performance.
*   **Output:** All three reports are combined into a single, comprehensive market analysis.

### Reflection: The Quality Assurance Loop

A more advanced pattern is "reflection," which introduces a quality control step. In this model, the team completes its task, and then a special **Reviewer Agent** examines the output.

*   If the work meets the required standard, the Reviewer approves it, and the process is complete.
*   If the work is not satisfactory, the Reviewer provides feedback and sends it back to the team for another attempt.

This loop continues until the output is approved or a maximum number of attempts is reached. It ensures a higher quality result by building a review-and-refine cycle directly into the workflow.

The diagram below illustrates these three primary collaboration patterns.

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Agent Teams](assets/diagram/agent-teams-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## Summary

By organizing agents into teams, you can automate more complex, multi-step workflows. This collaborative approach allows for building sophisticated solutions that mirror real-world business processes, from content creation pipelines to data analysis and quality assurance checks.

To see these concepts in action, explore our guides on [Common Workflows](./user-guide-common-workflows.md), which provide practical examples of agent teams solving real problems. For technical details on implementation, developers can refer to the [Team Agent documentation](./developer-guide-agents-team-agent.md).