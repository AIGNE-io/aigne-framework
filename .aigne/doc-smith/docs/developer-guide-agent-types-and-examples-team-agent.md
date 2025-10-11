# Team Agent

The `TeamAgent` is a specialized agent designed to orchestrate a group of other agents, referred to as its "skills." It enables you to build complex workflows by coordinating how these agents work together. You can configure a team to execute its agents either one after another (sequentially) or all at the same time (in parallel).

This is particularly useful for creating sophisticated multi-step processes, such as a research team where one agent gathers information, another analyzes it, and a third summarizes the findings.

## Core Concepts

A `TeamAgent` manages a collection of agents and executes them according to a defined `mode`. The way agents are arranged and the mode of execution determine the flow of data and the final output.

### Processing Modes

There are two fundamental modes for processing agents within a team:

<x-cards data-columns="2">
  <x-card data-title="Sequential Mode" data-icon="lucide:arrow-right-circle">
    Agents are executed one by one in the order they are defined. The output of each agent is merged and passed as input to the next agent in the sequence. This is ideal for creating linear pipelines where each step builds upon the previous one.
  </x-card>
  <x-card data-title="Parallel Mode" data-icon="lucide:git-fork">
    All agents are executed simultaneously with the same initial input. Their outputs are then intelligently merged to form a single, combined result. This is useful when you need to perform multiple independent tasks at once and consolidate their outcomes.
  </x-card>
</x-cards>

## Configuration

You can configure a `TeamAgent` using the following options.

<x-field-group>
    <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="An array of agent instances that form the team."></x-field>
    <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
        <x-field-desc markdown>Determines how the agents are processed. Can be `ProcessMode.sequential` or `ProcessMode.parallel`.</x-field-desc>
    </x-field>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false">
        <x-field-desc markdown>Enables an iterative review-and-refine loop. A `reviewer` agent assesses the team's output, and if not approved, the team runs again with the feedback. See the **Advanced Features** section for details.</x-field-desc>
    </x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false">
        <x-field-desc markdown>Specifies an input field containing an array. The team will process each item in the array individually. This is useful for batch processing.</x-field-desc>
    </x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
        <x-field-desc markdown>When using `iterateOn`, this sets the maximum number of array items to process concurrently.</x-field-desc>
    </x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
        <x-field-desc markdown>If `true`, the output from processing one item in an `iterateOn` array is merged back, making it available for subsequent iterations. This cannot be used with `concurrency` greater than 1.</x-field-desc>
    </x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
        <x-field-desc markdown>In `sequential` mode, if `true`, the output from every intermediate agent is included in the final result, not just the output from the last agent.</x-field-desc>
    </x-field>
</x-field-group>

## Usage Examples

You can define a `TeamAgent` either programmatically using TypeScript or declaratively using YAML.

### Sequential Team Example

In this example, a `researcher` agent first gathers data, and then a `writer` agent uses that data to compose a response. The agents run in a sequence.

```typescript team-agent-sequential.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// Define the researcher agent
const researcher = AIAgent.from({
  name: "researcher",
  description: "Gathers information on a given topic.",
  instructions: "Find key facts about the user's topic: {{topic}}.",
});

// Define the writer agent
const writer = AIAgent.from({
  name: "writer",
  description: "Writes a summary based on research.",
  instructions: "Summarize the following facts into a paragraph: {{output}}",
});

// Create a sequential team
const researchTeam = TeamAgent.from({
  name: "research-team",
  mode: ProcessMode.sequential,
  skills: [researcher, writer],
});

// Run the team
async function run() {
  const result = await researchTeam.invoke({
    topic: "the history of artificial intelligence",
  });
  console.log(result);
}

run();
```

### Parallel Team Example

Here, two agents run simultaneously to generate different parts of a report, and their outputs are combined.

```typescript team-agent-parallel.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// Define an agent to write the introduction
const introWriter = AIAgent.from({
  name: "intro-writer",
  output: {
    json: {
      introduction: "A compelling introduction about {{topic}}",
    },
  },
});

// Define an agent to create bullet points
const keyPointsWriter = AIAgent.from({
  name: "key-points-writer",
  output: {
    json: {
      keyPoints: ["Three key bullet points about {{topic}}"],
    },
  },
});

// Create a parallel team
const reportTeam = TeamAgent.from({
  name: "report-team",
  mode: ProcessMode.parallel,
  skills: [introWriter, keyPointsWriter],
});

// Run the team
async function run() {
  const result = await reportTeam.invoke({
    topic: "the benefits of remote work",
  });
  console.log(JSON.stringify(result, null, 2));
  /*
  Expected output:
  {
    "introduction": "...",
    "keyPoints": [
      "...",
      "...",
      "..."
    ]
  }
  */
}

run();
```

### Declarative YAML Example

You can also define a team agent in a YAML file. This is useful for configuring agents without writing code. The following example defines a parallel team that iterates over an array of `sections`.

```yaml team.yaml icon=mdi:language-yaml
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
```

## Advanced Features

### Iterative Processing (`iterateOn`)

The `iterateOn` option allows the `TeamAgent` to perform batch operations on an array within the input message. When you specify a key with `iterateOn`, the team will execute its entire workflow for each item in that array.

For instance, if your input is `{ "articles": [{ "title": "A" }, { "title": "B" }] }` and you set `iterateOn: "articles"`, the team will run twice: once for `{"title": "A"}` and once for `{"title": "B"}`. The results are accumulated and returned as a single array in the final output. You can control the number of parallel runs with the `concurrency` option.

### Reflection Mode

Reflection enables a powerful self-correction loop. When `reflection` is configured, the team's output is passed to a designated `reviewer` agent. This reviewer then evaluates the output.

-   **Approval**: If the reviewer approves the output (based on the `isApproved` condition), the process finishes.
-   **Revision**: If the output is not approved, the reviewer's feedback is added to the context, and the team runs the process again to improve the result.

This cycle repeats until the output is approved or the `maxIterations` limit is reached, preventing infinite loops.

Here is an example of a YAML configuration for a team with reflection:

```yaml team-agent-with-reflection.yaml icon=mdi:language-yaml
type: team
name: test-team-agent-with-reflection
description: Test team agent with reflection
skills:
  - chat.yaml
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

### Nested Teams

A `TeamAgent` can include another `TeamAgent` in its `skills` array. This allows you to create complex, hierarchical agent structures where teams of agents can collaborate within larger teams, enabling highly modular and scalable workflow designs.