# AI Agent API Reference

[中文](./ai-agent-api.zh.md) | **English**

The AIAgent is an Agent implementation for interacting with AI models. It can send prompts to AI models, process the returned results, and supports tool calling functionality.

## AIAgent Class

`AIAgent` inherits from the `Agent` base class and is specifically designed for executing AI model-related tasks.

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `model` | `ChatModel \| undefined` | AI chat model instance |
| `instructions` | `PromptBuilder` | PromptBuilder object for constructing prompts |
| `outputKey` | `string \| undefined` | Key name for storing the model's text response in the output object |
| `toolChoice` | `AIAgentToolChoice \| undefined` | Tool selection strategy |
| `enableHistory` | `boolean \| undefined` | Whether to enable history |
| `maxHistoryMessages` | `number` | Maximum number of history messages to keep |

### Constructor

```typescript
constructor(options: AIAgentOptions<I, O>)
```

#### Parameters

- `options`: `AIAgentOptions<I, O>` - AIAgent configuration options

  | Option | Type | Description |
  |--------|------|-------------|
  | `model` | `ChatModel` | AI chat model instance |
  | `instructions` | `string \| PromptBuilder` | Instructions guiding AI behavior or a PromptBuilder |
  | `outputKey` | `string` | Key name for storing the model's text response in the output object |
  | `toolChoice` | `AIAgentToolChoice` | Tool selection strategy |
  | `enableHistory` | `boolean` | Whether to enable history |
  | `maxHistoryMessages` | `number` | Maximum number of history messages to keep |

### Static Methods

#### `from`

Factory method for creating an AIAgent.

```typescript
static from<I extends AgentInput, O extends AgentOutput>(options: AIAgentOptions<I, O>): AIAgent<I, O>
```

##### Parameters

- `options`: `AIAgentOptions<I, O>` - AIAgent configuration options

##### Returns

- `AIAgent<I, O>` - Returns the created AIAgent instance

### Methods

#### `process`

Processes input and generates output by interacting with the AI model and handling responses.

```typescript
async process(input: I, context: Context): Promise<O>
```

##### Parameters

- `input`: `I` - Input data
- `context`: `Context` - AIGNE context

##### Returns

- `Promise<O>` - Returns the processing result from the AI model

## Related Types

### `AIAgentOptions`

Defines the configuration options for AIAgent.

```typescript
interface AIAgentOptions<I extends AgentInput = AgentInput, O extends AgentOutput = AgentOutput> extends AgentOptions<I, O> {
  model?: ChatModel;
  instructions?: string | PromptBuilder;
  outputKey?: string;
  toolChoice?: AIAgentToolChoice;
  enableHistory?: boolean;
  maxHistoryMessages?: number;
}
```

### `AIAgentToolChoice`

Defines the tool selection strategy for AIAgent.

```typescript
type AIAgentToolChoice = "auto" | "none" | "required" | "router" | Agent;
```

| Value | Description |
|-------|-------------|
| `"auto"` | The model decides whether to use skills |
| `"none"` | No skills are used |
| `"required"` | skills must be used |
| `"router"` | Router mode, directly forwarding results to the first tool called |
| `Agent` | Specify using a specific Agent as a tool |

## How It Works

1. Use PromptBuilder to construct prompt messages
2. Send the prompt to the AI model
3. Process the AI model's response
4. Execute tool calls if needed
5. Continue the conversation with the AI model until the task is completed
6. Return the final result

## Examples

### Creating a Basic AIAgent

```typescript
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

const agent = AIAgent.from({
  name: "Assistant",
  model,
  instructions: "You are a friendly, helpful assistant."
});

// Using AIAgent
const output = await agent.invoke("Hello, can you tell me about the weather in Beijing?");
console.log(output.text); // Output of AI's response
```

### Using AIAgent with skills

```typescript
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Create a weather query tool
const weatherTool = FunctionAgent.from({
  name: "getWeather",
  description: "Get weather information for a specified city",
  inputSchema: z.object({
    city: z.string().describe("City name")
  }),
  fn: async (input) => {
    // In a real application, this would invoke a weather API
    return {
      temperature: 24,
      conditions: "Sunny",
      humidity: 60,
      city: input.city
    };
  }
});

const agent = AIAgent.from({
  name: "WeatherAssistant",
  model,
  instructions: "You are a weather assistant that can answer questions about the weather.",
  skills: [weatherTool],
  toolChoice: "auto" // Allow the model to decide whether to use skills
});

// Using AIAgent with skills
const output = await agent.invoke("What's the weather like in Beijing today?");
console.log(output.text); // "The weather in Beijing today is sunny with a temperature of 24°C and humidity of 60%."
```

### Using AIAgent in Router Mode

```typescript
import { AIAgent, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4"
});

// Weather assistant
const weatherAgent = AIAgent.from({
  name: "WeatherAssistant",
  model,
  instructions: "You are a professional weather assistant who only answers weather-related questions."
});

// Travel assistant
const travelAgent = AIAgent.from({
  name: "TravelAssistant",
  model,
  instructions: "You are a travel assistant providing travel advice and information."
});

// Router Agent
const routerAgent = AIAgent.from({
  name: "Router",
  model,
  instructions: `You are a router responsible for deciding which expert assistant to route the user's question to.
    - For weather-related questions, use WeatherAssistant
    - For travel-related questions, use TravelAssistant`,
  skills: [weatherAgent, travelAgent],
  toolChoice: "router" // Use router mode
});

// Using router Agent
const output = await routerAgent.invoke("What are some good places to visit in Beijing?");
// Will automatically route to travelAgent for processing and return the response
console.log(output);
