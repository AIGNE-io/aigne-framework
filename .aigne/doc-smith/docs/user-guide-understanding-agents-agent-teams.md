# Team Agent

A `TeamAgent` is a specialized agent that orchestrates a group of other agents (referred to as "skills") to perform complex tasks. It manages how these agents work together, handling the flow of information between them.

You can configure a `TeamAgent` to execute its skills in two main ways:
- **Sequential Mode**: Agents run one after another, with the output of one agent feeding into the next. This is ideal for creating multi-step workflows.
- **Parallel Mode**: All agents run simultaneously with the same input, and their outputs are combined. This is useful for tasks where multiple independent pieces of information need to be generated at once.

Beyond basic orchestration, `TeamAgent` offers advanced features like:
- **Iteration**: Automatically process each item in an input array, which is useful for batch processing.
- **Reflection**: Use a "reviewer" agent to validate and iteratively refine the team's output until it meets specific criteria, enabling self-correcting workflows.

This combination of features makes `TeamAgent` a powerful tool for building sophisticated, multi-agent systems that can handle complex, multi-step, and data-intensive operations.

## How It Works

A `TeamAgent` takes an input, passes it to its team of skill agents according to the configured mode, and then aggregates the results into a final output. The diagram below illustrates the different processing flows.

```d2
direction: down

Input

TeamAgent: {
  label: "Team Agent Orchestration"
  shape: rectangle
  style.stroke-dash: 2

  Sequential-Mode: {
    label: "Sequential Mode"
    shape: rectangle
    style.fill: "#f0f8ff"
    Skill-A: "Skill A"
    Skill-B: "Skill B"
    Skill-C: "Skill C"
    Skill-A -> Skill-B -> Skill-C
  }

  Parallel-Mode: {
    label: "Parallel Mode"
    shape: rectangle
    style.fill: "#f0fff0"
    Skill-X: "Skill X"
    Skill-Y: "Skill Y"
    Skill-Z: "Skill Z"
    Combine-Results: "Combine Results"
    Skill-X -> Combine-Results
    Skill-Y -> Combine-Results
    Skill-Z -> Combine-Results
  }

  Advanced-Workflow: {
    label: "Advanced Workflow (Reflection & Iteration)"
    shape: rectangle
    style.fill: "#fff8f0"
    Process-Item: {
      label: "For each item in input array..."
      shape: rectangle
      style.stroke-dash: 2
      Team-Execution: "Team Execution\n(Sequential or Parallel)"
      Initial-Output: "Initial Output"
      Reviewer-Agent: "Reviewer Agent"
      Meets-Criteria: {
        label: "Meets Criteria?"
        shape: diamond
      }
      Team-Execution -> Initial-Output
      Initial-Output -> Reviewer-Agent
      Reviewer-Agent -> Meets-Criteria
      Meets-Criteria -> Team-Execution: "No, Refine"
    }
  }
}

Final-Output

Input -> TeamAgent.Sequential-Mode.Skill-A: "Single Input"
TeamAgent.Sequential-Mode.Skill-C -> Final-Output

Input -> TeamAgent.Parallel-Mode.Skill-X
Input -> TeamAgent.Parallel-Mode.Skill-Y
Input -> TeamAgent.Parallel-Mode.Skill-Z
TeamAgent.Parallel-Mode.Combine-Results -> Final-Output

Input -> TeamAgent.Advanced-Workflow.Process-Item.Team-Execution: "Input Array"
TeamAgent.Advanced-Workflow.Process-Item.Meets-Criteria -> Final-Output: "Yes"

```

## Configuration

You can configure a `TeamAgent` using the following options.

### Basic Configuration

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="A unique identifier for the agent."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A brief description of the agent's purpose."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="An array of agent instances that this team will orchestrate."></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="The processing mode. Can be `sequential` for step-by-step execution or `parallel` for simultaneous execution."></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="A JSON schema defining the expected input format."></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="A JSON schema defining the expected output format."></x-field>
</x-field-group>

### Advanced Features

<x-field-group>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="Enables an iterative review-and-refine process to improve output quality. See the Reflection section for details."></x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="The name of an input field (which must be an array) to iterate over. Each item in the array is processed individually by the team."></x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="When using `iterateOn`, this sets the maximum number of items to process in parallel."></x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-desc="If `true`, the output from processing one item in an `iterateOn` array is merged back and made available to the next item's processing. Requires `concurrency` to be 1."></x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-desc="In `sequential` mode, if `true`, the output from every intermediate agent is included in the final result, not just the last one. Useful for debugging."></x-field>
</x-field-group>

---

## Core Concepts

### Processing Modes

The `mode` property dictates the execution flow for the agents (skills) within the team.

#### Sequential Mode

In `sequential` mode, agents are executed one after another in the order they are defined in the `skills` array. The output from each agent is merged with the original input and the outputs of all previous agents, forming the input for the next agent in the chain.

This mode is ideal for building workflows where each step builds upon the last, such as a pipeline for data processing, analysis, and reporting.

**Example Flow (`sequential`):**
1.  **Agent 1** receives the initial input `{ "topic": "AI" }`.
2.  **Agent 1** produces an output `{ "research": "..." }`.
3.  **Agent 2** receives a merged input `{ "topic": "AI", "research": "..." }`.
4.  **Agent 2** produces an output `{ "summary": "..." }`.
5.  The final output is `{ "topic": "AI", "research": "...", "summary": "..." }`.

#### Parallel Mode

In `parallel` mode, all agents in the `skills` array are executed simultaneously. Each agent receives the exact same initial input. Their outputs are then combined to form the final result. If multiple agents produce an output with the same key, the system determines which agent "owns" that key to avoid conflicts.

This mode is efficient for tasks where multiple independent pieces of work can be done at the same time, such as gathering information from different sources or performing different analyses on the same dataset.

**Example Flow (`parallel`):**
1.  **Agent A** and **Agent B** both receive the initial input `{ "company": "Initech" }`.
2.  **Agent A** produces `{ "financials": "..." }`.
3.  **Agent B** produces `{ "news": "..." }`.
4.  The final output is a combination of both: `{ "financials": "...", "news": "..." }`.

### Iteration

The `iterateOn` feature enables batch processing. By specifying an input field that contains an array, you can instruct the `TeamAgent` to run its entire workflow (either sequential or parallel) for each item in that array.

-   **`concurrency`**: You can control how many items are processed at once. For example, `concurrency: 5` will process five items from the array in parallel.
-   **`iterateWithPreviousOutput`**: When set to `true` (and `concurrency` is 1), the output from processing item `N` is merged into the data for item `N+1`. This creates a cumulative effect, useful for tasks where each step depends on the last, like building a narrative or summarizing a series of events.

**YAML Example (`iterateOn`)**
This configuration processes an array from the `sections` input field, with a concurrency of 2.

```yaml
# sourceId: packages/core/test-agents/team.yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: Sections to iterate over
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
output_schema:
  type: object
  properties:
    sections:
      type: array
      description: Results from each section
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### Reflection

Reflection provides a mechanism for self-correction and quality control. When enabled, the `TeamAgent`'s initial output is passed to a designated `reviewer` agent. This reviewer evaluates the output against a set of criteria.

-   If the output is approved, the process finishes.
-   If the output is not approved, the reviewer's feedback is added to the context, and the original team of agents runs again to produce a revised output.

This loop continues until the output is approved or the `maxIterations` limit is reached.

The `reflection` configuration requires:
<x-field-group>
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="The agent responsible for evaluating the team's output."></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="A condition to determine if the output is approved. It can be a field name in the reviewer's output (e.g., `is_complete`) or a function that returns `true` for approval."></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-desc="The maximum number of review-refine cycles before stopping."></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-desc="If `true`, the agent will return the last generated output even if it wasn't approved after reaching `maxIterations`. If `false`, it will throw an error."></x-field>
</x-field-group>

This feature is powerful for tasks that require high accuracy, adherence to specific formats, or complex validation that can be automated by another agent.