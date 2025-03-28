# Execution Engine API Reference

[中文](./execution-engine-api.zh.md) | **English**

The Execution Engine is a core component of the AIGNE framework, responsible for coordinating interactions between Agents and executing workflows. It provides a unified interface for running single or multiple Agents and manages message passing between them.

## ExecutionEngine Class

`ExecutionEngine` inherits from `EventEmitter` and provides an execution environment for Agents. It creates an execution context for each operation.

### Constructor

```typescript
constructor(options?: ExecutionEngineOptions)
```

#### Parameters

- `model`: `ChatModel` - Default Chat model instance
- `tools`: `Agent[]` - List of globally available tools
- `agents`: `Agent[]` - List of Agents to add at initialization
- `limits`: `ContextLimits` - Context limits configuration
  - `maxTokens`: `number` - Maximum number of tokens allowed to be processed
  - `maxAgentCalls`: `number` - Maximum number of agent calls allowed
  - `timeout`: `number` - Execution timeout in milliseconds

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
publish(topic: string | string[], message: Message | string, from?: Agent)
```

##### Parameters

- `topic`: `string | string[]` - Message topic or an array of topics
- `message`: `Message | string` - Message content to publish
- `from`: `Agent` (optional) - The agent who publishes the message

#### `subscribe`

Subscribes to messages on a specified topic. This method has multiple overloads.

```typescript
// Subscribe with a callback function
// Registers a callback function to be called for each message on the topic
// Returns an unsubscribe function that can be called to stop receiving messages
subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;

// Subscribe and wait for a single message
// Returns a promise that resolves with the next message published to the topic
// Useful for one-time message reception
subscribe(topic: string): Promise<MessagePayload>;
```

##### Parameters

- `topic`: `string` - Topic to subscribe to
- `listener`: `MessageQueueListener` (optional) - Callback function to receive messages

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
// Create a user agent to consistently call an agent
// Returns a UserAgent instance for continuous interaction with the execution engine
// Suitable for scenarios requiring multi-turn dialogue or continuous interaction
call<I extends Message, O extends Message>(agent: Runnable<I, O>): UserAgent<I, O>;

// Call an agent with a message
// Calls the specified agent with the provided message
// Returns the output of the agent
// Suitable for scenarios where a single interaction is needed
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
): Promise<O>;

// Call an agent with a message and return the output and the active agent
// Calls the specified agent with the provided message
// Returns the output of the agent and the final active agent
// Suitable for scenarios where the active agent needs to be tracked
call<I extends Message, O extends Message>(
  agent: Runnable<I, O>,
  message: I | string,
  options: { returnActiveAgent?: true },
): Promise<[O, Runnable]>;
```

##### Parameters

- `agent`: `Runnable<I, O>` - Agent or function to call
- `message`: `I | string` - Message to pass to the agent
- `options`: `{ returnActiveAgent?: boolean }` - Options for the call

##### Returns

- `UserAgent<I, O>` - When only the agent parameter is provided, returns a UserAgent instance for continuous interaction
- `Promise<O>` - When the message parameter is provided, returns the processing result
- `Promise<[O, Runnable]>` - When the options parameter is provided, returns the processing result and the active agent

#### `shutdown`

Shuts down the execution engine and releases resources.

```typescript
async shutdown()
```

## Utility Functions

### `sequential`

Creates a function that executes multiple Agents sequentially.

```typescript
function sequential(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### Parameters

- `agents`: `[Runnable, ...Runnable[]]` - List of Agents to execute sequentially

#### Returns

- `FunctionAgentFn` - Returns a function that executes the specified Agents sequentially and merges their outputs

### `parallel`

Creates a function that executes multiple Agents in parallel.

```typescript
function parallel(...agents: [Runnable, ...Runnable[]]): FunctionAgentFn
```

#### Parameters

- `agents`: `[Runnable, ...Runnable[]]` - List of Agents to execute in parallel

#### Returns

- `FunctionAgentFn` - Returns a function that executes the specified Agents in parallel and merges their outputs

## Related Types

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

  process(input: I, context: Context): Promise<O>;

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
  context: Context;
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
import { ExecutionEngine, AIAgent, OpenAIChatModel } from "@aigne/core";

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
import { ExecutionEngine, AIAgent, FunctionAgent, sequential, OpenAIChatModel } from "@aigne/core";

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
import { ExecutionEngine, AIAgent, parallel, OpenAIChatModel } from "@aigne/core";

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
import { ExecutionEngine, AIAgent, FunctionAgent, OpenAIChatModel } from "@aigne/core";

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
