# AIGNE Class

The `AIGNE` class is the central orchestrator in the AIGNE Framework. It manages the lifecycle of agents, facilitates communication between them, and coordinates the execution of complex AI-driven workflows. It serves as the main execution engine, bringing together models, agents, and skills to build powerful applications.

## Core Concepts

The AIGNE ecosystem revolves around a few key components that interact to execute tasks. Understanding these components is essential for using the framework effectively.

# AIGNE Class

The `AIGNE` class is the central orchestrator in the AIGNE Framework. It manages the lifecycle of agents, facilitates communication between them, and coordinates the execution of complex AI-driven workflows. It serves as the main execution engine, bringing together models, agents, and skills to build powerful applications.

## Core Concepts

The AIGNE ecosystem revolves around a few key components that interact to execute tasks. Understanding these components is essential for using the framework effectively.

```d2
direction: down

AIGNE-Engine: {
  label: "AIGNE Engine\n(Central Orchestrator)"
  shape: rectangle
  style.fill: "#f0f8ff"
}

Core-Components: {
  label: "Core Components"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 3

  Models
  Agents
  Skills
}

AI-driven-Workflows: {
  label: "AI-driven Workflows"
  shape: rectangle
}

AIGNE-Engine -> Core-Components: "Brings Together"

AIGNE-Engine -> AI-driven-Workflows: "Coordinates & Executes"

AIGNE-Engine -> Core-Components.Agents: "Manages Lifecycle & \nFacilitates Communication" {
  style.stroke-dash: 2
}

Core-Components.Agents -> Core-Components.Skills: "Use"
Core-Components.Agents -> Core-Components.Models: "Leverage"

```

- **AIGNE Engine**: The central orchestrator responsible for managing agents and coordinating workflows.
- **Agents**: The fundamental actors in the system that perform specific tasks.
- **Models**: AI models that provide intelligence to agents.
- **Skills**: Reusable capabilities that can be attached to agents to extend their functionality.

## Constructor

The `AIGNE` class is initialized with a set of options that define its behavior and resources.

```typescript
constructor(options?: AIGNEOptions)
```

**Parameters**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="Configuration options for the AIGNE instance."></x-field>
</x-field-group>

<x-field-group>
    <x-field data-name="name" data-type="string" data-required="false" data-desc="The name of the AIGNE instance."></x-field>
    <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of the AIGNE instance's purpose."></x-field>
    <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="The default model for agents that do not specify one."></x-field>
    <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="The model to use for image processing tasks."></x-field>
    <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="A list of agents to be managed by the AIGNE instance."></x-field>
    <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="A list of skills available to the agents."></x-field>
    <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="Usage limits for the AIGNE instance, such as timeouts and token counts."></x-field>
    <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="An observer for monitoring and logging activities."></x-field>
</x-field-group>

**Example**

```typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A simple chat agent",
});

const aigne = new AIGNE({
  model,
  agents: [agent],
  name: "MyAIGNE",
  description: "An example AIGNE instance",
});
```

## Methods

### invoke

The `invoke` method is used to interact with an agent, either by sending it a message or by creating a `UserAgent` for sustained interaction.

```typescript
invoke<I extends Message, O extends Message>(agent: Agent<I, O>, message?: I, options?: InvokeOptions<U>): UserAgent<I, O> | Promise<AgentResponse<O>>
```

**Parameters**

<x-field-group>
    <x-field data-name="agent" data-type="Agent" data-required="true" data-desc="The agent to invoke."></x-field>
    <x-field data-name="message" data-type="Message" data-required="false" data-desc="The input message to send to the agent."></x-field>
    <x-field data-name="options" data-type="InvokeOptions" data-required="false" data-desc="Additional options for the invocation, such as enabling streaming."></x-field>
</x-field-group>

**Returns**

- If `message` is not provided, it returns a `UserAgent` instance for consistent interaction with the specified agent.
- If `message` is provided, it returns a `Promise` that resolves with the agent's response. The response can be a single object or a stream if `streaming` is enabled in the options.

**Example: Simple Invocation**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// Create AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model });

// Use the AIGNE to invoke the agent
const userAgent = await aigne.invoke(agent);

// Send a message to the agent
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

**Example: Streaming Response**

```typescript
import { AIAgent, AIGNE, isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

let text = "";

const stream = await aigne.invoke(agent, { message: "hello" }, { streaming: true });
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.message) {
    text += chunk.delta.text.message;
  }
}

console.log(text); // Output: Hello, How can I assist you today?
```

### publish

The `publish` method sends a message to a specified topic, allowing for event-driven communication between agents.

```typescript
publish(topic: string | string[], payload: Omit<MessagePayload, "context"> | Message, options?: InvokeOptions<U>)
```

**Parameters**

<x-field-group>
    <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="The topic(s) to publish the message to."></x-field>
    <x-field data-name="payload" data-type="Message" data-required="true" data-desc="The message payload to send."></x-field>
    <x-field data-name="options" data-type="InvokeOptions" data-required="false" data-desc="Additional options for publishing."></x-field>
</x-field-group>

**Example**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
  // Add agent to AIGNE
  agents: [agent],
});

const subscription = aigne.subscribe("result_topic");

aigne.publish("test_topic", { message: "hello" });

const { message } = await subscription;

console.log(message); // { message: "Hello, How can I assist you today?" }
```

### subscribe

The `subscribe` method allows you to listen for messages on a specific topic.

```typescript
subscribe(topic: string | string[], listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>
```

**Parameters**

<x-field-group>
    <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="The topic(s) to subscribe to."></x-field>
    <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="An optional callback function to handle incoming messages."></x-field>
</x-field-group>

**Returns**

- If a `listener` is provided, it returns an `Unsubscribe` function to stop listening.
- If no `listener` is provided, it returns a `Promise` that resolves with the next message payload on the topic.

**Example**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  subscribeTopic: "test_topic",
  publishTopic: "result_topic",
  inputKey: "message",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
  // Add agent to AIGNE
  agents: [agent],
});

const unsubscribe = aigne.subscribe("result_topic", ({ message }) => {
  console.log(message); // { message: "Hello, How can I assist you today?" }
  unsubscribe();
});

aigne.publish("test_topic", { message: "hello" });
```

### shutdown

The `shutdown` method gracefully terminates the `AIGNE` instance and all its associated agents and skills, ensuring proper resource cleanup.

```typescript
async shutdown(): Promise<void>
```

**Example**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

await aigne.invoke(agent, { message: "hello" });

await aigne.shutdown();
```

### load

The static `load` method initializes an `AIGNE` instance from a directory containing an `aigne.yaml` configuration file.

```typescript
static async load(path: string, options?: Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions): Promise<AIGNE>
```

**Parameters**

<x-field-group>
    <x-field data-name="path" data-type="string" data-required="true" data-desc="The path to the directory containing the aigne.yaml file."></x-field>
    <x-field data-name="options" data-type="LoadOptions" data-required="false" data-desc="Options to override the loaded configuration."></x-field>
</x-field-group>

### addAgent

Adds one or more agents to the `AIGNE` instance, making them available for invocation.

```typescript
addAgent(...agents: Agent[]): void
```

**Parameters**

<x-field-group>
    <x-field data-name="agents" data-type="Agent[]" data-required="true" data-desc="One or more agent instances to add."></x-field>
</x-field-group>

### newContext

Creates a new execution context, which is useful for isolating different conversations or workflows.

```typescript
newContext(options?: Partial<Pick<Context, "userContext" | "memories">>): AIGNEContext
```

**Parameters**

<x-field-group>
    <x-field data-name="options" data-type="object" data-required="false" data-desc="Optional user context and memories to initialize the new context with."></x-field>
</x-field-group>

## Properties

- **name**: `string` - The name of the AIGNE instance.
- **description**: `string` - A description of the instance.
- **model**: `ChatModel` - The default chat model.
- **imageModel**: `ImageModel` - The default image model.
- **limits**: `ContextLimits` - Usage limits.
- **skills**: `Agent[]` - A collection of available skills.
- **agents**: `Agent[]` - A collection of managed agents.
- **observer**: `AIGNEObserver` - The observability instance.