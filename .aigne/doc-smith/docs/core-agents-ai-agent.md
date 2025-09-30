# AI Agent

The `AIAgent` is the core component in the AIGNE framework for executing AI-driven tasks. It acts as the primary interface to large language models (LLMs), processing user instructions, managing conversations, and orchestrating tools to generate intelligent responses.

Think of the `AIAgent` as the brain of your operation. It takes an input, thinks about it using an LLM, and produces an output. It can also use specialized tools to perform specific actions, like calculations or fetching data from an API.

## Creating an AI Agent

The simplest way to create an `AIAgent` is by using the `AIAgent.from()` factory method. At a minimum, you need to provide a language model and specify which part of the input contains the user's message.

```javascript Basic AIAgent creation icon=logos:javascript
// Import the necessary components
import { AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks/mock-models.js"; // Replace with your actual model import

// 1. Instantiate a language model
const model = new OpenAIChatModel();

// 2. Create the agent, specifying the model and the input key
const agent = AIAgent.from({
  model,
  name: "assistant",
  description: "A helpful assistant",
  inputKey: "message", // Tells the agent to find the user's query in the 'message' field of the input
});

// 3. Invoke the agent with some input
async function runAgent() {
  const result = await agent.invoke({ message: "What is the weather today?" });
  console.log(result); // Expected output: { message: "Hello, How can I help you?" }
}

runAgent();
```

## Configuration Options

You can customize the behavior of an `AIAgent` through its configuration options. Here are some of the most common ones:

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false">
    <x-field-desc markdown>Provides guidance to the AI model on its role, personality, and how it should respond. This can be a simple string or a more complex `PromptBuilder` instance for dynamic prompts.</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>Specifies the key in the input object where the agent should find the main user message. If not provided, `instructions` must be set.</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-required="false">
    <x-field-desc markdown>Defines the key used for the main text output in the agent's response. Defaults to `message`.</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-required="false">
    <x-field-desc markdown>Controls how the agent uses tools. It can be set to `auto`, `none`, `required`, or `router`.</x-field-desc>
  </x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-required="false">
    <x-field-desc markdown>If `true`, the agent will catch errors from tool executions and attempt to continue. If `false`, it will stop and throw the error.</x-field-desc>
  </x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown>When enabled, the agent processes the model's streaming response to extract structured data (like JSON or YAML) alongside the text, which is useful for tasks requiring metadata.</x-field-desc>
  </x-field>
</x-field-group>

## Key Features and Usage

### Customizing Instructions

You can guide the agent's behavior by providing system instructions. This helps set the context and tone for the conversation.

#### Simple Instructions

For simple cases, a string is sufficient.

```javascript AI agent with custom instructions icon=logos:javascript
const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  name: "tutor",
  description: "A math tutor",
  instructions: "You are a math tutor who helps students understand concepts clearly.",
  inputKey: "message",
});

async function run() {
  const result = await agent.invoke({ message: "What is 10 factorial?" });
  console.log(result); // { message: "10 factorial is 3628800." }
}
run();
```

#### Advanced Prompts with PromptBuilder

For more complex scenarios where you need to structure the prompt with different message types (system, user, assistant), you can use a `PromptBuilder`.

```javascript AI agent with PromptBuilder icon=logos:javascript
import { PromptBuilder, SystemMessageTemplate, UserMessageTemplate, ChatMessagesTemplate } from "@aigne/core";

// Create a template for system and user messages
const systemMessage = SystemMessageTemplate.from("You are a technical support specialist.");
const userMessage = UserMessageTemplate.from("Please help me troubleshoot this issue: {{issue}}");
const promptTemplate = ChatMessagesTemplate.from([systemMessage, userMessage]);

// Create a PromptBuilder with the template
const promptBuilder = new PromptBuilder({
  instructions: promptTemplate,
});

const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  name: "support",
  description: "Technical support specialist",
  instructions: promptBuilder,
});

async function run() {
  const result = await agent.invoke({ issue: "My computer won't start." });
  console.log(result); // { message: "Is there any message on the screen?" }
}
run();
```

### Using Tools (Function Calling)

`AIAgent` can be equipped with `skills` (other agents, typically `FunctionAgent`), which act as tools it can call to perform specific tasks. The `toolChoice` option controls this behavior.

#### Automatic Tool Choice (`auto`)

In `auto` mode, the language model decides whether to respond directly or to use one of the available tools based on the user's query.

```javascript Automatic Tool Usage icon=logos:javascript
import { FunctionAgent, AIAgent, AIAgentToolChoice } from "@aigne/core";
import { z } from "zod";

// Define a tool for weather forecasts
const weatherService = FunctionAgent.from({
  name: "weather",
  inputSchema: z.object({ location: z.string() }),
  process: ({ location }) => ({
    forecast: `Weather forecast for ${location}: Sunny, 75°F`,
  }),
});

// Create an AIAgent that can use the tool
const agent = AIAgent.from({
  model: new OpenAIChatModel(),
  toolChoice: AIAgentToolChoice.auto, // Let the model decide
  skills: [weatherService],
  inputKey: "message",
});

async function run() {
  // The model will see the query and decide to call the 'weather' tool
  const result = await agent.invoke({ message: "What is the weather in San Francisco?" });
  console.log(result); // { message: "Weather forecast for San Francisco: Sunny, 75°F" }
}
run();
```

#### Router Tool Choice (`router`)

In `router` mode, the agent's only job is to select the single best tool for the user's query and pass the input directly to it. The final output comes directly from the chosen tool, not from the LLM.

This is useful for creating a dispatcher that routes requests to specialized agents.

```javascript Router Tool Usage icon=logos:javascript
import { FunctionAgent, AIAgent, AIAgentToolChoice } from "@aigne/core";
import { z } from "zod";

// Define specialized agents
const weatherAgent = FunctionAgent.from({
  name: "weather",
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.object({ forecast: z.string() }),
  process: ({ location }) => ({ forecast: `Weather in ${location}: Sunny, 75°F` }),
});

const translator = FunctionAgent.from({
  name: "translator",
  inputSchema: z.object({ text: z.string(), language: z.string() }),
  outputSchema: z.object({ translation: z.string() }),
  process: ({ text, language }) => ({ translation: `Translated ${text} to ${language}` }),
});

// Create a router agent
const routerAgent = AIAgent.from({
  model: new OpenAIChatModel(),
  toolChoice: AIAgentToolChoice.router, // Use router mode
  skills: [weatherAgent, translator],
  inputKey: "message",
});

async function run() {
  // The router will select the 'weatherAgent' and execute it.
  // The result is the direct output from weatherAgent.
  const result = await routerAgent.invoke({ message: "What's the weather in San Francisco?" });
  console.log(result); // { forecast: "Weather in San Francisco: Sunny, 75°F" }
}
run();
```

## Summary

The `AIAgent` is a versatile and powerful component for building LLM-powered applications. It provides a structured way to interact with language models, manage prompts, and integrate external tools. For more advanced scenarios, you can combine `AIAgent` with other agent types:

*   **[Function Agent](./core-agents-function-agent.md):** To create custom tools that `AIAgent` can use.
*   **[Team Agent](./core-agents-team-agent.md):** To orchestrate multiple `AIAgent` instances to collaborate on complex tasks.