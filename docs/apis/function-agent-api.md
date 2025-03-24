# Function Agent API Reference

[中文](./function-agent-api.zh.md) | **English**

Function Agent is a simple yet powerful Agent implementation that wraps functions as Agents, allowing them to be seamlessly used within the AIGNE framework.

## FunctionAgent Class

`FunctionAgent` inherits from the `Agent` base class and is specifically designed for converting regular functions to Agents.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `fn` | `FunctionAgentFn<I, O>` | The wrapped function |

### Constructor

```typescript
constructor(options: FunctionAgentOptions<I, O>)
```

#### Parameters

- `options`: `FunctionAgentOptions<I, O>` - FunctionAgent configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `fn` | `FunctionAgentFn<I, O>` | The function to wrap |
  | Other options | - | Inherited from `AgentOptions<I, O>` |

### Static Methods

#### `from`

Factory method for creating a FunctionAgent, which can create an instance from a function or options object.

```typescript
static from<I extends AgentInput, O extends AgentOutput>(
  options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>
): FunctionAgent<I, O>
```

##### Parameters

- `options`: `FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>` - Function or FunctionAgent configuration options

##### Returns

- `FunctionAgent<I, O>` - Returns the created FunctionAgent instance

### Methods

#### `process`

Executes the wrapped function and processes the result.

```typescript
async process(input: I, context?: Context): Promise<O>
```

##### Parameters

- `input`: `I` - Input data
- `context`: `Context` (optional) - Execution context

##### Returns

- `Promise<O>` - Returns the function execution result

## Related Types

### `FunctionAgentOptions`

Defines the configuration options for FunctionAgent.

```typescript
interface FunctionAgentOptions<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> extends AgentOptions<I, O> {
  fn?: FunctionAgentFn<I, O>;
}
```

### `FunctionAgentFn`

Defines the type of function that can be wrapped by FunctionAgent.

```typescript
type FunctionAgentFn<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> =
  (input: I, context?: Context) => O | Promise<O> | Agent | Promise<Agent>;
```

## How It Works

1. FunctionAgent receives a function as a constructor parameter
2. When the FunctionAgent is called, it passes the input to that function
3. The function's return value is returned as the Agent's output
4. If the function returns another Agent, FunctionAgent will handle it as a transfer to that Agent

## Examples

### Basic Usage

```typescript
import { FunctionAgent } from "@aigne/core-next";

// Create a simple function
function greet(input) {
  const name = input.name || "Anonymous";
  return {
    message: `Hello, ${name}!`
  };
}

// Method 1: Using the from static method
const greetAgent1 = FunctionAgent.from(greet);

// Method 2: Using the constructor
const greetAgent2 = new FunctionAgent({
  name: "Greeter",
  description: "A simple greeting agent",
  fn: greet
});

// Using FunctionAgent
const output = await greetAgent1.call({ name: "John" });
console.log(output); // { message: "Hello, John!" }
```

### Asynchronous Functions

```typescript
import { FunctionAgent } from "@aigne/core-next";

// Create an asynchronous function
async function fetchUserData(input) {
  // In a real application, this would call an API
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    id: input.userId,
    name: "John Doe",
    email: "john@example.com"
  };
}

const userAgent = FunctionAgent.from({
  name: "UserDataFetcher",
  description: "Fetches user data from an API",
  fn: fetchUserData
});

// Using async FunctionAgent
const userData = await userAgent.call({ userId: 123 });
console.log(userData); // { id: 123, name: "John Doe", email: "john@example.com" }
```

### Agent Transfer

```typescript
import { FunctionAgent, AIAgent, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create an AI Agent
const helpfulAgent = AIAgent.from({
  name: "HelpfulAssistant",
  model,
  instructions: "You are a helpful assistant."
});

// Create a function that can transfer to another Agent
function analyzeIntent(input) {
  // In a real application, there might be more complex logic here
  if (input.text.includes("help")) {
    // Return another Agent
    return helpfulAgent;
  }

  return {
    intent: "unknown",
    confidence: 0.5
  };
}

const intentAnalyzer = FunctionAgent.from({
  name: "IntentAnalyzer",
  fn: analyzeIntent
});

// Using Agent transfer
const result = await intentAnalyzer.call({ text: "I need some help" });
// Will transfer to helpfulAgent and return its response
```

### Using in a Tool Chain

```typescript
import { ExecutionEngine, AIAgent, FunctionAgent, OpenAIChatModel } from "@aigne/core-next";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create a data processing function
function processData(input) {
  const data = input.data || [];

  return {
    count: data.length,
    summary: `Processed ${data.length} items`,
    firstItem: data[0]
  };
}

// Convert function to Agent
const processAgent = FunctionAgent.from({
  name: "DataProcessor",
  fn: processData
});

// Create an AI Agent using the process Agent as a tool
const aiAgent = AIAgent.from({
  name: "DataAnalyst",
  model,
  instructions: "You are a data analysis assistant who can process and analyze data.",
  tools: [processAgent]
});

// Create execution engine
const engine = new ExecutionEngine({ model });

// Run the workflow
const result = await engine.call(
  aiAgent,
  { data: [1, 2, 3, 4, 5] }
);

console.log(result); // Contains AI's analysis of the data
