# AIGNE API Reference

[中文](./aigne-api.zh.md) | **English**

AIGNE is a core component of the AIGNE framework, responsible for coordinating interactions between Agents and executing workflows. It provides a unified interface for running single or multiple Agents and manages message passing between them.

## AIGNE Class

`AIGNE` inherits from `EventEmitter` and provides an execution environment for Agents. It creates an execution context for each operation.

### Constructor

```typescript
constructor(options?: AIGNEOptions)
```

#### Parameters

- `model`: `ChatModel` - Default Chat model instance
- `skills`: `Agent[]` - List of globally available skills
- `agents`: `Agent[]` - List of Agents to add at initialization
- `limits`: `ContextLimits` - Context limits configuration
  - `maxTokens`: `number` - Maximum number of tokens allowed to be processed
  - `maxAgentInvokes`: `number` - Maximum number of agent invocations allowed
  - `timeout`: `number` - Execution timeout in milliseconds

### Methods

#### `addAgent`

Adds one or more Agents to the AIGNE.

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

#### `invoke`

Invokes an agent with a message and returns the output. This method has multiple overloads, each with a different purpose.

```typescript
// Create a user agent to consistently invoke an agent
// Returns a UserAgent instance for continuous interaction with the AIGNE
// Suitable for scenarios requiring multi-turn dialogue or continuous interaction
invoke<I extends Message, O extends Message>(agent: Agent<I, O>): UserAgent<I, O>;

// Invoke an agent with a message
// Invokes the specified agent with the provided message
// Returns the output of the agent
// Suitable for scenarios where a single interaction is needed
invoke<I extends Message, O extends Message>(
  agent: Agent<I, O>,
  message: I | string,
  options?: { streaming?: false }
): Promise<O>;

// Invoke an agent with a message and return a stream of response chunks
// Invokes the specified agent with the provided message
// Returns a stream of response chunks as they become available
// Suitable for real-time processing or displaying incremental results
invoke<I extends Message, O extends Message>(
  agent: Agent<I, O>,
  message: I | string,
  options: { streaming: true }
): Promise<AgentResponseStream<O>>;

// Invoke an agent with a message and return the output and the active agent
// Invokes the specified agent with the provided message
// Returns the output of the agent and the final active agent
// Suitable for scenarios where the active agent needs to be tracked
invoke<I extends Message, O extends Message>(
  agent: Agent<I, O>,
  message: I | string,
  options: { returnActiveAgent: true; streaming?: false },
): Promise<[O, Agent]>;

// Invoke an agent with a message and return a stream of response chunks and the active agent promise
// Invokes the specified agent with the provided message
// Returns a stream of response chunks and a promise that resolves to the final active agent
// Suitable for real-time processing while tracking the active agent
invoke<I extends Message, O extends Message>(
  agent: Agent<I, O>,
  message: I | string,
  options: { returnActiveAgent: true; streaming: true },
): Promise<[AgentResponseStream<O>, Promise<Agent>]>;
```

##### Parameters

- `agent`: `Agent<I, O>` - Agent to invoke
- `message`: `I | string` - Message to pass to the agent
- `options`: `{ returnActiveAgent?: boolean }` - Options for the invocation

##### Returns

- `UserAgent<I, O>` - When only the agent parameter is provided, returns a UserAgent instance for continuous interaction
- `Promise<O>` - When the message parameter is provided, returns the processing result
- `Promise<[O, Agent]>` - When the options parameter is provided, returns the processing result and the active agent

#### `shutdown`

Shuts down the AIGNE and releases resources.

```typescript
async shutdown()
```

## Utility Functions


## Related Types

### `UserAgent`

Represents the user's proxy in the AIGNE, used for continuous interaction sessions.

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

The AIGNE uses a publish-subscribe pattern to handle communication between Agents. Each Agent can define:

1. `subscribeTopic`: The topics the Agent listens to
2. `publishTopic`: The topics to which the Agent publishes results

When a message is published to a topic, all Agents subscribing to that topic will receive the message and perform the corresponding operations.

Predefined special topics:
- `UserInputTopic`: Topic for user input
- `UserOutputTopic`: Topic for user output

## Examples

### Using Stream Response with AIGNE

```typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";

const aigne = new AIGNE();

const agent = AIAgent.from({
  model,
  instructions: "..."
})

// Invoke with streaming enabled
const stream = await aigne.invoke(agent, "Hello, tell me about streaming", { streaming: true });

const reader = stream.getReader();
const result = {};

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  mergeAgentResponseChunk(result, value);

  console.log("Received chunk:", value);
}
console.log("Final result:", result);

// Get both stream and active agent (for more complex workflows)
const [agentStream, activeAgentPromise] = await aigne.invoke(
  assistant,
  "Hello, please recommend some books",
  { streaming: true, returnActiveAgent: true }
);

// Process the stream as shown above

// Get the active agent when processing is complete
const activeAgent = await activeAgentPromise;
console.log("The active agent is:", activeAgent.name);
```

### Basic Usage

```typescript
import { AIGNE, AIAgent, OpenAIChatModel } from "@aigne/core";

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

// Create AIGNE
const aigne = new AIGNE({ model });

// Method 1: Invoke directly and get results
const result = await aigne.invoke(assistant, "Hello, please tell me today's date");
console.log(result);

// Method 2: Create interactive session
const userAgent = aigne.invoke(assistant);

// Send messages and get replies
const response1 = await userAgent.invoke("Hello!");
console.log(response1);

const response2 = await userAgent.invoke("Can you help me write a poem?");
console.log(response2);

// Shut down the AIGNE
await aigne.shutdown();
```

### Sequential Execution of Multiple Agents

```typescript
import { AIGNE, AIAgent, FunctionAgent, TeamAgent, OpenAIChatModel } from "@aigne/core";

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

// Create AIGNE
const aigne = new AIGNE({ model });

// Execute Agents sequentially
const result = await aigne.invoke(
  TeamAgent.from({
    skills: [dataPrep, analyzer, summarizer],
    mode: ProcessMode.sequential,
  }),
  { data: [10, 20, 30, 40, 50] }
);

console.log(result);
```

### Parallel Execution of Multiple Agents

```typescript
import { AIGNE, AIAgent, TeamAgent, ProcessMode, OpenAIChatModel } from "@aigne/core";

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

// Create AIGNE
const aigne = new AIGNE({ model });

// Execute Agents in parallel
const result = await aigne.invoke(
  TeamAgent.from({
    skills: [poet, storyteller],
    mode: ProcessMode.parallel,
  }),
  { topic: "Moon" }
);

console.log("Poetry:", result.poem);
console.log("Story:", result.story);
```

### Using Publish-Subscribe Pattern

```typescript
import { AIGNE, AIAgent, FunctionAgent, OpenAIChatModel } from "@aigne/core";

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
    // In a real application, this would invoke a weather API
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

// Create AIGNE and add Agents
const aigne = new AIGNE();
aigne.addAgent(weatherAgent, travelAgent);

// Subscribe to final results
aigne.subscribe("travel.response", (response) => {
  console.log("Travel advice:", response);
});

// Publish initial request
aigne.publish("weather.request", { city: "Beijing" });
