# Execution Engine API Reference

[中文](./execution-engine-api.zh.md) | **English**

The Execution Engine is a core component of the AIGNE framework, responsible for coordinating interactions between Agents and executing workflows. It provides a unified interface for running single or multiple Agents and manages message passing between them.

## ExecutionEngine Class

`ExecutionEngine` simultaneously inherits from `EventEmitter` and implements the `Context` interface, providing an execution environment for Agents.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `model` | `ChatModel \| undefined` | Default AI chat model instance |
| `tools` | `Agent[]` | List of tools accessible to all Agents |

### Constructor

```typescript
constructor(options?: ExecutionEngineOptions)
```

#### Parameters

- `options`: `ExecutionEngineOptions` (optional) - Execution engine configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `model` | `ChatModel` | Default AI chat model instance |
  | `tools` | `Agent[]` | List of globally available tools |
  | `agents` | `Agent[]` | List of Agents to add at initialization |

### Methods

#### `addAgent`

Adds one or more Agents to the execution engine.

```typescript
addAgent(...agents: Agent[])
```

##### Parameters

- `agents`: `Agent[]` - List of Agents to add

#### `publish`

Publishes a message to a specified topic.

```typescript
publish(topic: string, message: unknown)
```

##### Parameters

- `topic`: `string` - Message topic
- `message`: `unknown` - Message content to publish

#### `subscribe`

Subscribes to messages on a specified topic.

```typescript
subscribe(topic: string, listener: (message: AgentOutput) => void)
```

##### Parameters

- `topic`: `string` - Topic to subscribe to
- `listener`: `(message: AgentOutput) => void` - Callback function to receive messages

#### `unsubscribe`

Unsubscribes from messages on a specified topic.

```typescript
unsubscribe(topic: string, listener: (message: AgentOutput) => void)
```

##### Parameters

- `topic`: `string` - Topic to unsubscribe from
- `listener`: `(message: AgentOutput) => void` - Previously registered callback function

#### `call`

Calls an agent with a message and returns the output. This method has multiple overloads, each with a different purpose.

```typescript
// Overload 1: Create a user agent to consistently call an agent
call<I extends Message, O extends Message>(agent: Runnable<I, O>): UserAgent<I, O>;

// Overload 2: Call an agent with a message
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
): Promise<O>;

// Overload 3: Call an agent with a message and return the output and the active agent
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options: { returnActiveAgent?: true },
): Promise<[O, Runnable]>;
```

##### Overload Descriptions

1. **Create a user agent to consistently call an agent**
   - Returns a `UserAgent` instance for continuous interaction with the execution engine
   - Suitable for scenarios requiring multi-turn dialogue or continuous interaction
   - The returned `UserAgent` instance can receive new inputs and get responses via its `process` method

2. **Call an agent with a message**
   - Calls the specified agent with the provided message
   - Returns the output of the agent
   - Suitable for scenarios where a single interaction is needed

3. **Call an agent with a message and return the output and the active agent**
   - Calls the specified agent with the provided message
   - Returns the output of the agent and the final active agent
   - Suitable for scenarios where the active agent needs to be tracked

##### Parameters

- `agent`: `Runnable<I, O>` - Agent or function to call
- `message`: `I | string` - Message to pass to the agent
- `options`: `{ returnActiveAgent?: boolean }` - Options for the call

##### Returns

- `UserAgent<I, O>` - When only the agent parameter is provided, returns a UserAgent instance for continuous interaction
- `Promise<O>` - When the message parameter is provided, returns the processing result
- `Promise<[O, Runnable]>` - When the options parameter is provided, returns the processing result and the active agent

#### `runAgent`

Runs a single Agent and handles potential Agent transfers.

```typescript
async runAgent(input: AgentInput, agent: Runnable): Promise<{ agent: Runnable; output: AgentOutput }>
```

##### Parameters

- `input`: `AgentInput` - Agent input data
- `agent`: `Runnable` - Agent or function to run

##### Returns

- `Promise<{ agent: Runnable; output: AgentOutput }>` - Returns the final Agent run and its output

#### `shutdown`

Shuts down the execution engine and releases resources.

```typescript
async shutdown()
```

## Utility Functions

### `sequential`

Creates a function that executes multiple Agents sequentially.

```typescript
function sequential(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### Parameters

- `_agents`: `[Runnable, ...Runnable[]]` - List of Agents to execute sequentially

#### Returns

- `FunctionAgentFn` - Returns a function that executes the specified Agents sequentially and merges their outputs

### `parallel`

Creates a function that executes multiple Agents in parallel.

```typescript
function parallel(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### Parameters

- `_agents`: `[Runnable, ...Runnable[]]` - List of Agents to execute in parallel

#### Returns

- `FunctionAgentFn` - Returns a function that executes the specified Agents in parallel and merges their outputs

## Related Types

### `ExecutionEngineOptions`

Defines the configuration options for the execution engine.

```typescript
interface ExecutionEngineOptions {
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
}
```

### `Runnable`

Defines the type of entities that can be run.

```typescript
type Runnable = Agent | FunctionAgentFn;
```

### `UserAgent`

Represents the user's proxy in the execution engine, used for continuous interaction sessions.

```typescript
class UserAgent<I extends Message = Message, O extends Message = Message> extends Agent<I, O> {
  static from<I extends Message, O extends Message>(
    options: UserAgentOptions<I, O>,
  ): UserAgent<I, O>;

  constructor(options: UserAgentOptions<I, O>);

  process(input: I, context?: Context): Promise<O>;

  publish(topic: string | string[], message: Message | string): void;

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;

  unsubscribe(topic: string, listener: MessageQueueListener): void;

  get stream(): ReadableStream<MessagePayload & { topic: string }>;
}
```

#### `UserAgentOptions`

Defines the configuration options for a `UserAgent`.

```typescript
interface UserAgentOptions<I extends Message = Message, O extends Message = Message> extends AgentOptions<I, O> {
  context?: Context;
  process?: (input: I, context: Context) => PromiseOrValue<O>;
}
```

## Message Passing Mechanism

The execution engine uses a publish-subscribe pattern to handle communication between Agents. Each Agent can define:

1. `subscribeTopic`: The topics the Agent listens to
2. `publishTopic`: The topics to which the Agent publishes results

When a message is published to a topic, all Agents subscribing to that topic will receive the message and perform the corresponding operations.

Predefined special topics:
- `UserInputTopic`: Topic for user input
- `UserOutputTopic`: Topic for user output

## Examples

### Basic Usage

```typescript
import { ExecutionEngine, AIAgent, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create Agent
const assistant = AIAgent.from({
  name: "Assistant",
  model,
  instructions: "You are a friendly, helpful assistant."
});

// Create execution engine
const engine = new ExecutionEngine({ model });

// Method 1: Call directly and get results
const result = await engine.call(assistant, "Hello, please tell me today's date");
console.log(result);

// Method 2: Create interactive session
const userAgent = engine.call(assistant);

// Send messages and get replies
const response1 = await userAgent.call("Hello!");
console.log(response1);

const response2 = await userAgent.call("Can you help me write a poem?");
console.log(response2);

// Shut down the execution engine
await engine.shutdown();
```

### Sequential Execution of Multiple Agents

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, sequential, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create data preparation Agent
const dataPrep = FunctionAgent.from({
  name: "DataPreparation",
  fn: (input) => ({
    ...input,
    formattedData: `Processed: ${JSON.stringify(input.data)}`
  })
});

// Create analysis Agent
const analyzer = AIAgent.from({
  name: "DataAnalyzer",
  model,
  instructions: "You are a data analysis expert, analyze the provided data and provide insights."
});

// Create summary Agent
const summarizer = AIAgent.from({
  name: "Summarizer",
  model,
  instructions: "Your task is to summarize the analysis results into concise points."
});

// Create execution engine
const engine = new ExecutionEngine({ model });

// Execute Agents sequentially
const result = await engine.call(
  sequential(dataPrep, analyzer, summarizer),
  { data: [10, 20, 30, 40, 50] }
);

console.log(result);
```

### Parallel Execution of Multiple Agents

```typescript
import { ExecutionEngine, AIAgent, parallel, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create poetry Agent
const poet = AIAgent.from({
  name: "Poet",
  model,
  instructions: "You are a poet, create poetry related to the provided topic.",
  outputKey: "poem"
});

// Create story Agent
const storyteller = AIAgent.from({
  name: "Storyteller",
  model,
  instructions: "You are a storyteller, create short stories related to the provided topic.",
  outputKey: "story"
});

// Create execution engine
const engine = new ExecutionEngine({ model });

// Execute Agents in parallel
const result = await engine.call(
  parallel(poet, storyteller),
  { topic: "Moon" }
);

console.log("Poetry:", result.poem);
console.log("Story:", result.story);
```

### Using Publish-Subscribe Pattern

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create weather Agent
const weatherAgent = FunctionAgent.from({
  name: "WeatherAgent",
  subscribeTopic: "weather.request",
  publishTopic: "weather.response",
  fn: async (input) => {
    // In a real application, this would call a weather API
    return {
      city: input.city,
      temperature: 24,
      conditions: "Sunny"
    };
  }
});

// Create travel advice Agent
const travelAgent = AIAgent.from({
  name: "TravelAgent",
  model,
  subscribeTopic: "weather.response",
  publishTopic: "travel.response",
  instructions: "Based on the provided weather information, provide travel advice."
});

// Create execution engine and add Agents
const engine = new ExecutionEngine();
engine.addAgent(weatherAgent, travelAgent);

// Subscribe to final results
engine.subscribe("travel.response", (response) => {
  console.log("Travel advice:", response);
});

// Publish initial request
engine.publish("weather.request", { city: "Beijing" });
