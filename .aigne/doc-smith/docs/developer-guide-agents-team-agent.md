This document provides a detailed guide to the `TeamAgent` class, a powerful component for orchestrating multiple agents to work together. It covers its configuration, processing modes, and special features like reflection and iteration.

### Overview

The `TeamAgent` coordinates a group of agents (referred to as "skills") to accomplish complex tasks. It manages the execution of these agents according to a specified processing mode, allowing them to work sequentially (one after another) or in parallel (all at once). This is particularly useful for building sophisticated workflows where the output of one agent serves as the input for another, or when multiple tasks need to be executed simultaneously to combine their results.

### Configuration (`TeamAgentOptions`)

To create a `TeamAgent`, you provide a `TeamAgentOptions` object to its constructor. These options allow you to customize the behavior of the team.

| Parameter | Type | Description | Default |
| --- | --- | --- | --- |
| `mode` | `ProcessMode` | The method to process the agents in the team. Can be `sequential` or `parallel`. | `sequential` |
| `reflection` | `ReflectionMode` | Configuration for enabling an iterative review and refinement process for the team's output. | `undefined` |
| `iterateOn` | `string` | The key of an input field containing an array. The team will iterate over each item in the array. | `undefined` |
| `concurrency` | `number` | The maximum number of concurrent operations when using `iterateOn`. | `1` |
| `iterateWithPreviousOutput` | `boolean` | If `true`, the output of an iteration is merged back into the input for the next iteration. Requires `concurrency` to be `1`. | `false` |
| `includeAllStepsOutput` | `boolean` | If `true` in sequential mode, the output from all intermediate steps is included in the final result. | `false` |

### Processing Modes

The `ProcessMode` enum determines how the agents within a team are executed.

#### `sequential`
In this mode, agents are processed one by one. The output of each agent is passed as additional input to the next agent in the sequence. This is the default mode and is ideal for creating linear workflows.

#### `parallel`
In this mode, all agents are processed simultaneously. Each agent receives the same initial input, and their outputs are merged. This mode is useful for tasks that can be performed independently and then combined.

### Key Features

#### Reflection Mode
Reflection mode provides a mechanism for iterative self-correction and refinement of the team's output. When enabled, a designated `reviewer` agent evaluates the team's result. If the output is not approved, the process repeats, using the previous output and the reviewer's feedback as context for the next iteration. This cycle continues until the output is approved or the `maxIterations` limit is reached.

**Configuration (`ReflectionMode`)**

| Parameter | Type | Description |
| --- | --- | --- |
| `reviewer` | `Agent` | The agent responsible for reviewing the team's output and providing feedback. |
| `isApproved` | `((output: Message) => PromiseOrValue<boolean \| unknown>) \| string` | A function or a field name in the reviewer's output that determines if the result is approved. A truthy value indicates approval. |
| `maxIterations` | `number` | The maximum number of review iterations before stopping. Defaults to `3`. |
| `returnLastOnMaxIterations` | `boolean` | If `true`, the agent returns the last generated output when `maxIterations` is reached, even if not approved. If `false`, it throws an error. Defaults to `false`. |

**Example (`team-agent-with-reflection.yaml`)**
```yaml
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

#### Iteration (`iterateOn`)

The `iterateOn` feature enables the `TeamAgent` to perform batch processing on an array within the input message. When you specify an input field key with `iterateOn`, the agent iterates over each element of that array, processing each one individually through the team's workflow.

This is highly effective for scenarios where the same set of operations needs to be applied to multiple data items, such as processing sections of a document, analyzing a list of user comments, or enriching a dataset.

**Example (`team.yaml`)**
This example demonstrates a team agent configured to iterate over a `sections` array.

```yaml
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
        # ... item properties
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### Methods

#### `constructor(options: TeamAgentOptions<I, O>)`
Creates a new instance of `TeamAgent`.

-   **Parameters:**
    -   `options`: The configuration options for the team agent.

#### `process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>`
Processes an input message by routing it through the team's agents based on the configured `mode`.

-   **Parameters:**
    -   `input`: The message to process.
    -   `options`: The invocation options.
-   **Returns:** A stream of message chunks that constitute the final response.

### Examples

Here are examples of how to create a `TeamAgent`.

**Sequential TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agent1 = new Agent({ /* ... */ });
const agent2 = new Agent({ /* ... */ });

const sequentialTeam = TeamAgent.from({
  skills: [agent1, agent2],
  mode: ProcessMode.sequential,
});
```

**Parallel TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agentA = new Agent({ /* ... */ });
const agentB = new Agent({ /* ... */ });

const parallelTeam = TeamAgent.from({
  skills: [agentA, agentB],
  mode: ProcessMode.parallel,
});
```