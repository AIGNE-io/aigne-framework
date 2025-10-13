# TeamAgent

## Overview

The `TeamAgent` is a specialized agent that orchestrates a group of other agents (referred to as "skills") to accomplish complex tasks. It acts as a manager, directing the workflow and data flow between its skilled agents. This allows for the creation of sophisticated, multi-step AI systems where each agent can focus on a specific area of expertise.

`TeamAgent` supports several powerful workflow patterns:

*   **Sequential Processing**: Agents execute one after another, forming a processing pipeline.
*   **Parallel Processing**: Agents execute simultaneously, useful for tasks that can be performed independently.
*   **Reflection**: An iterative process where a "reviewer" agent provides feedback to refine the output until it meets certain criteria.
*   **Iteration**: Batch processing over a list of items, applying the same workflow to each item.

By combining these patterns, you can build modular, scalable, and highly capable AI solutions.

## Key Concepts

### Processing Modes

The `TeamAgent` can operate in two primary modes, defined by the `ProcessMode` enum. The mode determines how the agents within the team are executed.

*   `ProcessMode.sequential`: In this mode, agents are executed in a sequence. The output from the first agent is combined with the initial input and passed to the second agent, and so on. This creates a pipeline where each step builds upon the previous one. It's ideal for tasks with clear dependencies.

*   `ProcessMode.parallel`: In this mode, all agents execute at the same time. Each agent receives the exact same initial input. Their individual outputs are then merged to form the final result. This is efficient for independent sub-tasks that can be run concurrently.

## Creating a TeamAgent

You create a `TeamAgent` by providing it with a list of `skills` (the agents it will manage) and a processing `mode`.

### Sequential Processing

In sequential mode, agents form a chain. The output of each agent is passed as additional input to the next, making it perfect for multi-stage workflows.

**Use Case**: A content creation pipeline where text is first generated, then translated, and finally reviewed for formatting.

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1: Translates content to Chinese
const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

// Agent 2: Polishes the translated text
const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

// Create a sequential team
const sequentialTeam = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

When this team is invoked, `translatorAgent` runs first. Its output, `{ translation: "..." }`, is merged with the original input and passed to `prettierAgent`.

### Parallel Processing

In parallel mode, all agents receive the same input and run concurrently. Their outputs are collected and merged. This is ideal for tasks that require multiple independent analyses of the same data.

**Use Case**: Analyzing a product description to extract both its key features and its target audience simultaneously.

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1: Extracts product features
const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify and list the key features of the product.",
  outputKey: "features",
});

// Agent 2: Identifies the target audience
const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify the target audience for this product.",
  outputKey: "audience",
});

// Create a parallel team
const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

When this team is invoked with a product description, `featureAnalyzer` and `audienceAnalyzer` run at the same time, and their outputs are combined into a single result: `{ features: "...", audience: "..." }`.

## Advanced Workflows

Beyond simple sequential and parallel execution, `TeamAgent` offers advanced features for more complex scenarios.

### Reflection Mode

Reflection enables an iterative refinement workflow. The team's output is reviewed by a designated `reviewer` agent. If the output is not approved, the process repeats, using the previous output and feedback as context for the next attempt. This loop continues until the output is approved or a maximum number of iterations is reached.

This is useful for quality assurance, self-correction, and tasks that require a high degree of accuracy.

**Configuration (`ReflectionMode`)**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="The agent responsible for evaluating the team's output."></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean>) | string" data-required="true" data-desc="A function or a field name in the reviewer's output that determines if the result is approved. If it's a string, the corresponding field's truthiness is checked."></x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="The maximum number of review cycles before throwing an error."></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="If true, returns the last generated output when max iterations are reached, instead of throwing an error."></x-field>
</x-field-group>

### Iterator Mode

Iterator mode is designed for batch processing. When you specify an input field with the `iterateOn` option, the `TeamAgent` will iterate over each item in that field's array. The entire team workflow is executed for each item.

**Configuration**

<x-field-group>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="true" data-desc="The key of the input field that contains the array to iterate over."></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="The maximum number of items to process concurrently."></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="If true, the output from processing an item is merged back, making it available for subsequent items in the array. This requires concurrency to be 1."></x-field>
</x-field-group>

## API Reference

### TeamAgentOptions

These are the configuration options available when creating a `TeamAgent` with `TeamAgent.from()`.

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="A unique name for the agent."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of the agent's purpose."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="An array of agents that form the team."></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="ProcessMode.sequential" data-required="false" data-desc="The processing mode for the team, either 'sequential' or 'parallel'."></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="Configuration for enabling the iterative reflection workflow."></x-field>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="false" data-desc="The input field key to iterate on for batch processing."></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="The concurrency level for iterator mode."></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="Whether to feed the output of one iteration into the next during batch processing."></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="In sequential mode, if true, the final output will include the outputs from all intermediate steps, not just the last one."></x-field>
</x-field-group>