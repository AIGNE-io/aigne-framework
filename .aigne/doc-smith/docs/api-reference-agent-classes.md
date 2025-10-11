# Agent Classes

The `Agent` class is the fundamental building block within the AIGNE framework. It serves as the base class for all specialized agents, providing a consistent structure for defining processing logic, managing input/output schemas, and interacting with the AIGNE ecosystem. This document provides a detailed API reference for the base `Agent` class and its various subclasses.

Each agent is designed to perform a specific type of task. By extending the `Agent` class, you can create custom agents with diverse capabilities, from interacting with AI models to orchestrating complex workflows.

## Base `Agent` Class

The `Agent` class is an abstract class that provides the core functionality for all agents. You will typically use one of its subclasses rather than extending it directly, but understanding its interface is crucial for working with any agent.

### AgentOptions

When creating any agent, you can pass an `options` object to its constructor. The following properties are available on the base `Agent` class.

<x-field-group>
  <x-field data-name="name" data-type="string" data-desc="A unique name for the agent, used for identification and logging. Defaults to the class constructor name."></x-field>
  <x-field data-name="description" data-type="string" data-desc="A human-readable description of the agent's purpose and capabilities."></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-desc="One or more topics the agent will listen to for incoming messages."></x-field>
  <x-field data-name="publishTopic" data-type="string | string[] | (output: O) => string | string[]" data-desc="One or more topics where the agent's output messages will be sent. Can be a static value or a function of the output."></x-field>
  <x-field data-name="inputSchema" data-type="ZodType" data-desc="A Zod schema to validate the structure of input messages."></x-field>
  <x-field data-name="outputSchema" data-type="ZodType" data-desc="A Zod schema to validate the structure of output messages."></x-field>
  <x-field data-name="defaultInput" data-type="Partial<I>" data-desc="A partial input object providing default values for the agent's input."></x-field>
  <x-field data-name="includeInputInOutput" data-type="boolean" data-desc="If true, the agent will automatically merge the input fields into its output object."></x-field>
  <x-field data-name="skills" data-type="(Agent | FunctionAgentFn)[]" data-desc="A list of other agents or functions that this agent can invoke to perform sub-tasks."></x-field>
  <x-field data-name="memory" data-type="MemoryAgent | MemoryAgent[]" data-desc="One or more memory agents this agent can use to store and retrieve information."></x-field>
  <x-field data-name="guideRails" data-type="GuideRailAgent[]" data-desc="A list of GuideRail agents that validate or control the agent's message flow."></x-field>
  <x-field data-name="hooks" data-type="AgentHooks | AgentHooks[]" data-desc="Lifecycle hooks to trace, log, or add custom behavior during agent execution."></x-field>
  <x-field data-name="retryOnError" data-type="boolean | object" data-desc="Configuration for automatically retrying the agent's process method on failure. Set to true for default retries, or provide an object for custom settings."></x-field>
  <x-field data-name="disableEvents" data-type="boolean" data-desc="If true, the agent will not emit lifecycle events like agentStarted, agentSucceed, or agentFailed."></x-field>
</x-field-group>

### Core Methods

- **`process(input, options)`**: The abstract core logic of the agent. Every subclass must implement this method to define its behavior.
- **`invoke(input, options)`**: The primary method for executing an agent. It handles input validation, lifecycle hooks, error handling, and streaming.
- **`attach(context)`**: Connects the agent to the AIGNE engine's message bus by subscribing to its designated topics.
- **`shutdown()`**: Cleans up resources, such as unsubscribing from topics, to prevent memory leaks.

---

## `AIAgent`

An `AIAgent` is a powerful agent that leverages a `ChatModel` to understand and generate language. It is the primary agent for building conversational AI, performing complex reasoning, and using tools (functions).

### `AIAgentOptions`

In addition to the base `AgentOptions`, `AIAgent` accepts the following properties:

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-desc="The system prompt or instructions that guide the AI model's behavior."></x-field>
  <x-field data-name="inputKey" data-type="string" data-desc="Specifies which field from the input message should be treated as the main user query."></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-desc="The key under which the AI's text response will be placed in the output object."></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-desc="Controls how the agent uses tools. Can be 'auto', 'none', 'required', 'router', or a specific Agent to force its use."></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-desc="Enables parsing of structured data (e.g., JSON, YAML) embedded within the model's streaming response."></x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-desc="If true, memory agents are exposed as callable tools to the AI model."></x-field>
</x-field-group>

### Example

```javascript Simple AI Agent icon=logos:javascript
import { AIAgent, ChatModel } from '@aigne/core';
import { FakeChatModel } from '@aigne/mock';

// Assume a chat model is configured
const model = new FakeChatModel({ response: 'The capital of France is Paris.' });

const researcher = new AIAgent({
  name: 'Researcher',
  model,
  instructions: 'You are a helpful research assistant. Answer the user question.',
  inputKey: 'question',
  outputKey: 'answer',
});

async function run() {
  const result = await researcher.invoke({
    question: 'What is the capital of France?',
  });
  console.log(result.answer); // Output: The capital of France is Paris.
}

run();
```

---

## `TeamAgent`

A `TeamAgent` orchestrates a group of other agents (its skills) to perform a multi-step workflow. It can run agents in a sequence, where the output of one becomes the input for the next, or in parallel to perform multiple tasks simultaneously.

### `TeamAgentOptions`

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="Determines the execution flow. Can be `ProcessMode.sequential` or `ProcessMode.parallel`."></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-desc="Configuration for an iterative review process, where a 'reviewer' agent approves or requests changes to the team's output."></x-field>
  <x-field data-name="iterateOn" data-type="string" data-desc="If specified, the team will iterate over an array in the input message, running the workflow for each item."></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="Sets the number of parallel operations when using `iterateOn`."></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-desc="In sequential mode, if true, the final output will include the outputs from all intermediate steps, not just the last one."></x-field>
</x-field-group>

### Example

```javascript Sequential Team icon=logos:javascript
import { TeamAgent, FunctionAgent } from '@aigne/core';

const translator = FunctionAgent.from({
  name: 'Translator',
  process: async (input) => ({
    french: `Le mot pour "${input.english}" est "bonjour".`,
  }),
});

const synthesizer = FunctionAgent.from({
  name: 'Synthesizer',
  process: async (input) => ({
    summary: `The translation is: ${input.french}`,
  }),
});

const translationTeam = new TeamAgent({
  name: 'TranslationTeam',
  skills: [translator, synthesizer],
  mode: 'sequential',
});

async function run() {
  const result = await translationTeam.invoke({
    english: 'hello',
  });
  console.log(result.summary); // Output: The translation is: Le mot pour "hello" est "bonjour".
}

run();
```

---

## `FunctionAgent`

A `FunctionAgent` is the simplest way to wrap any JavaScript or TypeScript function, making it a fully-fledged member of the AIGNE ecosystem. This allows you to easily integrate custom logic, third-party APIs, or any existing code into your agent workflows.

### `FunctionAgentOptions`

<x-field data-name="process" data-type="FunctionAgentFn" data-required="true" data-desc="The function that implements the agent's logic. It receives the input message and invocation options."></x-field>

### Example

```javascript Calculator Agent icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const calculator = new FunctionAgent({
  name: 'Calculator',
  description: 'Performs addition on two numbers.',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  outputSchema: z.object({
    result: z.number(),
  }),
  process: async (input) => ({
    result: input.a + input.b,
  }),
});

async function run() {
  const output = await calculator.invoke({ a: 5, b: 10 });
  console.log(output.result); // Output: 15
}

run();
```

---

## `ImageAgent`

The `ImageAgent` is a specialized agent designed to interact with an `ImageModel` to generate images from textual descriptions.

### `ImageAgentOptions`

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="The prompt or instructions used to generate the image."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-desc="A set of key-value pairs to pass directly to the image model, such as `quality`, `size`, or `style`."></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-desc="Specifies the desired output format for the generated image, such as 'url', 'base64', or 'buffer'."></x-field>
</x-field-group>

### Example

```javascript Image Generation Agent icon=logos:javascript
import { ImageAgent } from '@aigne/core';
import { FakeImageModel } from '@aigne/mock';

// Assume an image model is configured
const model = new FakeImageModel();

const artist = new ImageAgent({
  name: 'Artist',
  imageModel: model,
  instructions: 'A photorealistic image of a cat wearing a spacesuit, digital art.',
});

async function run() {
  const result = await artist.invoke({});
  // result.files will contain the generated image data
  console.log(result.files[0].content_type); // e.g., 'image/png'
}

run();
```

---

## `TransformAgent`

A `TransformAgent` uses [JSONata](https://jsonata.org/), a flexible query and transformation language, to reshape JSON data. It's a declarative way to map, filter, and restructure messages as they flow between other agents, without writing imperative code.

### `TransformAgentOptions`

<x-field data-name="jsonata" data-type="string" data-required="true" data-desc="The JSONata expression that defines the data transformation."></x-field>

### Example

```javascript Data Transformer icon=logos:javascript
import { TransformAgent } from '@aigne/core';

const dataMapper = new TransformAgent({
  name: 'DataMapper',
  jsonata: `{
    "productId": product_id,
    "productName": details.name,
    "price": cost
  }`,
});

async function run() {
  const input = {
    product_id: 'abc-123',
    cost: 49.99,
    details: {
      name: 'Wireless Mouse',
      color: 'Black',
    },
  };
  const result = await dataMapper.invoke(input);
  console.log(result);
  // Output:
  // {
  //   productId: 'abc-123',
  //   productName: 'Wireless Mouse',
  //   price: 49.99
  // }
}

run();
```

---

## Other Agent Types

### `UserAgent`

Represents the human user in the system. It is used to send input into the agent ecosystem and stream back final responses. It typically does not have its own processing logic but instead publishes messages to topics that other agents are subscribed to.

### `MCPAgent`

Acts as a client for the Model Context Protocol (MCP). It can connect to an MCP server to dynamically discover and use its provided tools, prompts, and resources as skills.

### `GuideRailAgent`

A special type of agent used within the `guideRails` option of another agent. It intercepts the input and output of an agent's `process` call to validate it, enforce policies, or even block the action by returning `{ "abort": true }`.