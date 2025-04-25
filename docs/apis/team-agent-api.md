# Team Agent API Reference

[中文](./team-agent-api.zh.md) | **English**

The TeamAgent is an Agent implementation for coordinating multiple agents to work together. It allows you to orchestrate workflows where agents can process inputs either sequentially or in parallel.

## TeamAgent Class

`TeamAgent` inherits from the `Agent` base class and is specifically designed for orchestrating workflows with multiple agents.

### Static Methods

#### `from`

Creates a new TeamAgent instance.

```typescript
static from<I extends Message, O extends Message>(options: TeamAgentOptions<I, O>): TeamAgent<I, O>
```

##### Parameters

- `options`: `TeamAgentOptions<I, O>` - Configuration options for the TeamAgent

##### Returns

- `TeamAgent<I, O>` - A new TeamAgent instance

## Related Types

### `TeamAgentOptions`

Defines the configuration options for TeamAgent.

```typescript
interface TeamAgentOptions<I extends Message, O extends Message> extends AgentOptions<I, O> {
  processMethod?: TeamAgentProcessMethod;
}
```

### `TeamAgentProcessMethod`

Defines the available processing methods for TeamAgent.

```typescript
type TeamAgentProcessMethod = "sequential" | "parallel";
```

| Value | Description |
|-------|-------------|
| `"sequential"` | Process agents one by one, passing the output of each agent to the next |
| `"parallel"` | Process all agents in parallel, merging their outputs |

## How It Works

### Sequential Processing

1. Processes each agent in the team one after another
2. Passes the output of each agent as input to the next agent
3. Combines all outputs into a single result

### Parallel Processing

1. Processes all agents in the team simultaneously
2. Runs all agents with the same input
3. Merges the outputs from all agents into a single result
4. Handles potential conflicts between outputs

## Examples

### Sequential Workflow

```typescript
import { AIAgent, ExecutionEngine, TeamAgent } from "@aigne/core";

// Create individual agents for specific tasks
const conceptExtractor = AIAgent.from({
  instructions: `Extract key features from product description`,
  outputKey: "concept"
});

const writer = AIAgent.from({
  instructions: `Write marketing copy based on features`,
  outputKey: "draft"
});

const editor = AIAgent.from({
  instructions: `Edit and format the draft copy`,
  outputKey: "content"
});

// Create a TeamAgent that processes agents sequentially
const teamAgent = TeamAgent.from({
  tools: [conceptExtractor, writer, editor],
  processMethod: "sequential" // Default, can be omitted
});

// Execute the workflow
const engine = new ExecutionEngine({ model });
const result = await engine.call(teamAgent, { product: "Product description" });
```

### Parallel Workflow

```typescript
import { AIAgent, ExecutionEngine, TeamAgent } from "@aigne/core";

// Create individual agents for parallel tasks
const featureExtractor = AIAgent.from({
  instructions: `Extract and summarize the product features`,
  outputKey: "features"
});

const audienceAnalyzer = AIAgent.from({
  instructions: `Identify the target audience for the product`,
  outputKey: "audience"
});

// Create a TeamAgent that processes agents in parallel
const teamAgent = TeamAgent.from({
  tools: [featureExtractor, audienceAnalyzer],
  processMethod: "parallel"
});

// Execute the workflow
const engine = new ExecutionEngine({ model });
const result = await engine.call(teamAgent, { product: "Product description" });
