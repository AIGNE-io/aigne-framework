# Team Agent

Think of the `TeamAgent` as a project manager for your AI workforce. While a single agent, like an [AIAgent](./core-agents-ai-agent.md), is great for specific tasks, some problems are too complex for one agent to handle alone. That's where the `TeamAgent` comes in.

It orchestrates a group of specialized agents, assigning them sub-tasks and coordinating their efforts to achieve a larger goal. You can build a team with different types of agents, such as an `AIAgent` for writing content and a `FunctionAgent` for performing calculations, and make them work together seamlessly.

## How It Works

A `TeamAgent` manages a workflow. When it receives a task, it passes the input to the first agent in the team. The output of one agent becomes the input for the next, following a specific pattern based on the team's designated **working mode**.

There are three primary working modes you can choose from to define how your team collaborates.

### 1. Sequential Mode

In `sequential` mode, agents work one after another in a predefined order, like an assembly line. The output of the first agent is passed as input to the second, and so on. This is perfect for multi-step processes where each step depends on the previous one.

**Use Case:** Imagine you want to create a blog post. You could set up a sequential team where:
1.  **Agent 1 (Researcher):** Gathers information on a given topic.
2.  **Agent 2 (Writer):** Uses the research to write a draft.
3.  **Agent 3 (Editor):** Reviews the draft for grammar and style.

```d2 Sequential Mode Flowchart
direction: down

Task-Input: "Write a blog post about AI"
Agent-1: "Researcher Agent"
Agent-2: "Writer Agent"
Agent-3: "Editor Agent"
Final-Output: "Polished Blog Post"

Task-Input -> Agent-1: "Topic"
Agent-1 -> Agent-2: "Research Data"
Agent-2 -> Agent-3: "Draft"
Agent-3 -> Final-Output: "Final Version"
```

Here’s how you would configure this mode in your code:

```typescript TeamAgent in Sequential Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { researcherAgent, writerAgent, editorAgent } from './my-agents';

const blogCreationTeam = new TeamAgent({
  name: 'Blog Creation Team',
  agents: [researcherAgent, writerAgent, editorAgent],
  mode: 'sequential', // Agents run one after another
});
```

### 2. Parallel Mode

In `parallel` mode, all agents in the team receive the same initial input and work simultaneously. Their individual outputs are then collected into a single combined result. This is useful for tasks that can be broken down into independent sub-tasks that don't rely on each other.

**Use Case:** Suppose you're analyzing competitors. You could create a parallel team where:
*   **Agent A:** Analyzes Competitor X's website.
*   **Agent B:** Analyzes Competitor Y's social media.
*   **Agent C:** Analyzes Competitor Z's pricing page.

All three agents run at the same time, and their findings are gathered at the end.

```d2 Parallel Mode Flowchart
direction: down

Task-Input: "Analyze Competitors"

Team: {
  shape: rectangle
  style.stroke-dash: 4
  
  Agent-A: "Analyze Competitor X"
  Agent-B: "Analyze Competitor Y"
  Agent-C: "Analyze Competitor Z"
}

Combined-Output: "Comprehensive Report"

Task-Input -> Team
Team -> Combined-Output
```

Configuring this mode is just as simple:

```typescript TeamAgent in Parallel Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { agentA, agentB, agentC } from './my-agents';

const competitorAnalysisTeam = new TeamAgent({
  name: 'Competitor Analysis Team',
  agents: [agentA, agentB, agentC],
  mode: 'parallel', // All agents run at the same time
});
```

### 3. Iterate Mode

In `iterate` mode, the team of agents runs through its workflow multiple times, creating a feedback loop. The final output from the last agent is fed back as the new input to the first agent, allowing the team to refine its work with each cycle. You can control how many times it iterates.

**Use Case:** Developing a new software feature. The workflow could be:
1.  **Agent 1 (Planner):** Writes the feature specification.
2.  **Agent 2 (Developer):** Writes the code based on the spec.
3.  **Agent 3 (Tester):** Reviews the code and provides feedback.

The feedback is then passed back to the Planner to start the next iteration, refining the spec and code until it's perfect.

```d2 Iterate Mode Flowchart
direction: down

Agent-1: "Planner Agent"
Agent-2: "Developer Agent"
Agent-3: "Tester Agent"

Agent-1 -> Agent-2: "Specification"
Agent-2 -> Agent-3: "Code"
Agent-3 -> Agent-1: "Feedback"
```

This mode is ideal for tasks requiring refinement and improvement over several cycles.

```typescript TeamAgent in Iterate Mode icon=logos:typescript
import { TeamAgent } from '@aigner/core';
import { plannerAgent, developerAgent, testerAgent } from './my-agents';

const featureDevelopmentTeam = new TeamAgent({
  name: 'Feature Development Team',
  agents: [plannerAgent, developerAgent, testerAgent],
  mode: 'iterate',
  iterations: 3, // Run the cycle 3 times
});
```

## Creating a TeamAgent

To create a `TeamAgent`, you need to provide an array of agent instances and specify a working mode.

### Parameters

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="A unique name for the team agent."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A brief description of what the team does."></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="true">
    <x-field-desc markdown>An array of agent instances that will be part of the team. These can be `AIAgent`, `FunctionAgent`, or even other `TeamAgent` instances.</x-field-desc>
  </x-field>
  <x-field data-name="mode" data-type="'sequential' | 'parallel' | 'iterate'" data-required="true" data-default="sequential">
    <x-field-desc markdown>The working mode for the team. Determines how agents collaborate: `sequential` (one after another), `parallel` (all at once), or `iterate` (in a loop).</x-field-desc>
  </x-field>
  <x-field data-name="iterations" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>Specifies the number of cycles for the `iterate` mode. This parameter is ignored for other modes.</x-field-desc>
  </x-field>
</x-field-group>

### Full Example

Here is a complete example of setting up and running a `TeamAgent`.

```typescript Full TeamAgent Example icon=logos:typescript
import { AIAgent, FunctionAgent, TeamAgent, Aigne } from '@aigner/core';

// 1. Define specialized agents
const researcher = new AIAgent({
  name: 'Researcher',
  description: 'Gathers facts and data on a topic.',
  model: 'openai:gpt-4o',
  prompt: 'You are a world-class researcher. Find the top 3 key points about {{input}}.',
});

const writer = new AIAgent({
  name: 'Writer',
  description: 'Writes a short paragraph based on research.',
  model: 'openai:gpt-4o',
  prompt: 'Write a compelling, short paragraph based on these key points: {{input}}.',
});

// 2. Create the team
const contentTeam = new TeamAgent({
  name: 'Content Team',
  agents: [researcher, writer],
  mode: 'sequential',
});

// 3. Run the team with an initial input
async function runTeam() {
  const aigne = new Aigne();
  const result = await aigne.run(contentTeam, 'the future of renewable energy');
  console.log(result.content);
}

runTeam();
```

### Example Response

```json Response
{
  "content": "The future of renewable energy hinges on monumental advancements in solar and wind technologies, making them more efficient and affordable than ever before. Key to this transition is the development of next-generation energy storage solutions, like solid-state batteries, which promise to solve the intermittency problem by storing excess power for when the sun isn't shining or the wind isn't blowing. Furthermore, a global push towards decentralized smart grids is empowering communities to generate and manage their own clean energy, fostering resilience and reducing reliance on traditional power infrastructures."
}
```

## Summary

The `TeamAgent` is a powerful tool for automating complex, multi-step workflows. By combining different agents and choosing the right working mode, you can build sophisticated AI systems capable of tackling challenges far beyond the scope of a single agent.

To learn more about the building blocks of a team, check out the documentation for:
*   [AIAgent](./core-agents-ai-agent.md)
*   [FunctionAgent](./core-agents-function-agent.md)
