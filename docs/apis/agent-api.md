# Agent API Reference

[中文](./agent-api.zh.md) | **English**

The Agent is a core concept in the AIGNE framework, representing an entity that can receive input and produce output. All specific types of Agents inherit from this base class.

## Agent Base Class

`Agent` is an abstract class that provides the basic functionality shared by all Agent types.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | The name of the Agent, defaults to the class name |
| `description` | `string \| undefined` | Description of the Agent |
| `inputSchema` | `ZodObject<{ [key in keyof I]: ZodType }>` | Zod schema for validating input |
| `outputSchema` | `ZodObject<{ [key in keyof O]: ZodType }>` | Zod schema for validating output |
| `includeInputInOutput` | `boolean \| undefined` | Whether to include the input in the output |
| `subscribeTopic` | `SubscribeTopic` | Topics the Agent subscribes to |
| `publishTopic` | `PublishTopic<AgentOutput>` | Topics to publish the output to |
| `memory` | `AgentMemory` | Configures the Agent's memory functionality, type is `AgentMemory`. Can be set to `true` in configuration to automatically create an `AgentMemory` instance |
| `tools` | `Agent[]` | List of tools available to the Agent |
| `isCallable` | `boolean` | Indicates whether the Agent can be called |

### Constructor

```typescript
constructor(options: AgentOptions<I, O>)
```

#### Parameters

- `options`: `AgentOptions<I, O>` - Agent configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `subscribeTopic` | `SubscribeTopic` | Topics the Agent subscribes to |
  | `publishTopic` | `PublishTopic<O>` | Topics to publish the output to |
  | `name` | `string` | The name of the Agent |
  | `description` | `string` | Description of the Agent |
  | `inputSchema` | `ZodObject<{ [key in keyof I]: ZodType }>` | Zod schema for validating input |
  | `outputSchema` | `ZodObject<{ [key in keyof O]: ZodType }>` | Zod schema for validating output |
  | `includeInputInOutput` | `boolean` | Whether to include the input in the output |
  | `memory` | `AgentMemory` | Configures the Agent's memory functionality, type is `AgentMemory`. Can be set to `true` in configuration to automatically create an `AgentMemory` instance |
| `tools` | `(Agent \| FunctionAgentFn)[]` | List of tools available to the Agent |
  | `disableLogging` | `boolean` | Whether to disable logging |

### Methods

#### `call`

Calls the Agent to process the input and return output.

```typescript
async call(input: I | string, context?: Context): Promise<O>
async call(input: I | string, context: Context | undefined, options: AgentCallOptions & { streaming: true }): Promise<AgentResponseStream<O>>
```

##### Parameters

- `input`: `I | string` - Input data or string
- `context`: `Context` (optional) - Execution context
- `options`: `AgentCallOptions` (optional) - Call options
  - `streaming`: `boolean` - When set to `true`, returns a stream of response chunks instead of waiting for the complete response

##### Returns

- `Promise<O>` - Returns the Agent's output when not streaming
- `Promise<AgentResponseStream<O>>` - Returns a stream of response chunks when `options.streaming` is `true`

#### `addTool`

Adds a tool to the Agent.

```typescript
addTool<I extends AgentInput, O extends AgentOutput>(tool: Agent<I, O> | FunctionAgentFn<I, O>)
```

##### Parameters

- `tool`: `Agent<I, O> | FunctionAgentFn<I, O>` - The tool to add

#### `process`

Abstract method that processes the input and produces output. All subclasses must implement this method.

```typescript
abstract process(input: I, context: Context): Promise<O>
```

##### Parameters

- `input`: `I` - Input data
- `context`: `Context` - Execution context

##### Returns

- `Promise<O>` - Returns the Agent's output

#### `shutdown`

Shuts down the Agent and releases resources.

```typescript
async shutdown()
```

## Related Types

### `AgentInput`

Defines the type of the Agent's input.

```typescript
type AgentInput = Record<string, unknown>;
```

### `AgentOutput`

Defines the type of the Agent's output.

```typescript
type AgentOutput = Record<string, unknown> & Partial<TransferAgentOutput>;
```

### `SubscribeTopic`

Defines the type of the topics the Agent subscribes to.

```typescript
type SubscribeTopic = string | string[];
```

### `PublishTopic`

Defines the type of the topics to publish the output to.

```typescript
type PublishTopic<O extends AgentOutput = AgentOutput> =
  | string
  | string[]
  | ((output: O) => string | string[] | Promise<string | string[]>);
```

## Examples

### Using Stream Response with Agent

```typescript
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";

const stream = await agent.call(input, context, { streaming: true });

const reader = stream.getReader();
const result = {};

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  mergeAgentResponseChunk(result, value);

  console.log("Received chunk:", value);
}
console.log("Final result:", finalResult);
```

### Creating a Custom Agent

```typescript
import { Agent } from "@aigne/core";

class GreetingAgent extends Agent {
  async process(input) {
    const name = input.name || "Anonymous";
    return {
      greeting: `Hello, ${name}!`
    };
  }
}

const agent = new GreetingAgent({
  name: "Greeter",
  description: "A simple greeting agent"
});

// Using the Agent
const output = await agent.call({ name: "John" });
console.log(output); // { greeting: "Hello, John!" }
```

### Using an Agent with Tools

```typescript
import { Agent, FunctionAgent } from "@aigne/core";

// Create a tool Agent
const formatTool = FunctionAgent.from({
  name: "formatGreeting",
  fn: (input) => ({
    formatted: `${input.prefix || "Hello"}, ${input.name}!`
  })
});

class GreetingAgent extends Agent {
  async process(input, context) {
    const formatTool = this.tools.formatGreeting;

    if (formatTool) {
      const result = await formatTool.call({
        prefix: input.prefix,
        name: input.name
      }, context);

      return {
        message: result.formatted
      };
    }

    return {
      message: `Hi, ${input.name}!`
    };
  }
}

// Create an Agent with tools
const agent = new GreetingAgent({
  name: "Greeter",
  tools: [formatTool]
});

// Using the Agent
const output = await agent.call({ name: "John", prefix: "Welcome" });
console.log(output); // { message: "Welcome, John!" }
