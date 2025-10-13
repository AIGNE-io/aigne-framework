This document provides a detailed guide to the `AIGNE` class, the central orchestrator in the AIGNE framework. You will learn how to initialize, configure, and use the `AIGNE` class to manage agents, handle messaging, and execute complex AI workflows.

### System Architecture

To understand how the `AIGNE` class fits within the broader ecosystem, let's visualize its core components and their interactions. The `AIGNE` class acts as the central hub, managing agents, skills, and communication channels.

This document provides a detailed guide to the `AIGNE` class, the central orchestrator in the AIGNE framework. You will learn how to initialize, configure, and use the `AIGNE` class to manage agents, handle messaging, and execute complex AI workflows.

### System Architecture

To understand how the `AIGNE` class fits within the broader ecosystem, let's visualize its core components and their interactions. The `AIGNE` class acts as the central hub, managing agents, skills, and communication channels.

```d2
direction: down

AIGNE-Ecosystem: {
  label: "AIGNE System Architecture"
  shape: rectangle

  AIGNE-Class: {
    label: "AIGNE Class\n(Orchestrator)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Agents: {
    label: "Agents"
    shape: rectangle
    Agent-1: "Agent 1"
    Agent-2: "Agent 2"
    Agent-N: "..."
  }

  Skills: {
    label: "Skills"
    shape: rectangle
    Skill-A: "Skill A"
    Skill-B: "Skill B"
  }

  Communication-Channels: {
    label: "Communication Channels"
    shape: rectangle
    Messaging: {}
    API: {}
  }
}

AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Agents: "Manages"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Skills: "Utilizes"
AIGNE-Ecosystem.AIGNE-Class <-> AIGNE-Ecosystem.Communication-Channels: "Handles"

```

## Initialization and Configuration

The `AIGNE` class can be instantiated directly or loaded from a configuration file. This provides flexibility for both programmatic and declarative setup.

### Constructor

The constructor allows you to create an `AIGNE` instance with a specified configuration.

**Parameters**

<x-field-group>
  <x-field data-name="options" data-type="AIGNEOptions" data-required="false" data-desc="Configuration options for the AIGNE instance."></x-field>
</x-field-group>

**`AIGNEOptions`**

<x-field-group>
  <x-field data-name="rootDir" data-type="string" data-required="false" data-desc="The root directory to resolve relative paths for agents and skills."></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="The name of the AIGNE instance."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of the AIGNE instance."></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="The global chat model for agents that do not have a model specified."></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="The image model for image processing tasks."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="A list of skills to be used by the AIGNE instance."></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="A list of agents to be used by the AIGNE instance."></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="Usage limits for the AIGNE instance, such as timeouts and token counts."></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="An observer for monitoring the AIGNE instance."></x-field>
</x-field-group>

**Example**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const travelAgent = new AIAgent({
  name: 'TravelAgent',
  description: 'An agent that helps with travel planning.',
  model: yourChatModel, // Assuming yourChatModel is an instance of a ChatModel
});

const aigne = new AIGNE({
  name: 'MyAIGNE',
  description: 'A simple AIGNE instance.',
  agents: [travelAgent],
});

console.log('AIGNE instance created:', aigne.name);
```

### `load()`

The static `load` method provides a convenient way to initialize an `AIGNE` system from a directory containing an `aigne.yaml` file and agent definitions.

**Parameters**

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="The path to the directory containing the aigne.yaml file."></x-field>
  <x-field data-name="options" data-type="Omit<AIGNEOptions, keyof LoadOptions> & LoadOptions" data-required="false" data-desc="Options to override the loaded configuration."></x-field>
</x-field-group>

**Returns**

<x-field data-name="Promise<AIGNE>" data-type="Promise" data-desc="A fully initialized AIGNE instance with configured agents and skills."></x-field>

**Example**

```typescript
import { AIGNE } from '@aigne/core';

async function loadAIGNE() {
  try {
    const aigne = await AIGNE.load('./path/to/your/aigne/config');
    console.log('AIGNE instance loaded:', aigne.name);
  } catch (error) {
    console.error('Error loading AIGNE instance:', error);
  }
}

loadAIGNE();
```

## Core Components

The `AIGNE` class is composed of several key components that work together to create a powerful AI system.

### `agents`

The `agents` property is a collection of primary agents managed by the `AIGNE` instance. It provides indexed access by agent name.

<x-field data-name="agents" data-type="AccessorArray<Agent>" data-desc="A collection of primary agents."></x-field>

### `skills`

The `skills` property is a collection of skill agents available to the `AIGNE` instance. It provides indexed access by skill name.

<x-field data-name="skills" data-type="AccessorArray<Agent>" data-desc="A collection of skill agents."></x-field>

### `model`

The `model` property is the global chat model used for all agents that do not specify their own model.

<x-field data-name="model" data-type="ChatModel" data-desc="The global chat model."></x-field>

## Agent Management

The `AIGNE` class provides methods for managing the agents within the system.

### `addAgent()`

The `addAgent` method allows you to add one or more agents to the `AIGNE` instance. Each agent is attached to the `AIGNE` instance, allowing it to access its resources.

**Parameters**

<x-field-group>
  <x-field data-name="...agents" data-type="Agent[]" data-required="true" data-desc="One or more Agent instances to add."></x-field>
</x-field-group>

**Example**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

const aigne = new AIGNE();

const weatherAgent = new AIAgent({
  name: 'WeatherAgent',
  description: 'An agent that provides weather forecasts.',
  model: yourChatModel, // Assuming yourChatModel is an instance of a ChatModel
});

aigne.addAgent(weatherAgent);
console.log('Agent added:', aigne.agents[0].name);
```

## Invocation

The `invoke` method is the primary way to interact with agents. It has several overloads to support different invocation patterns.

### `invoke(agent)`

This overload creates a `UserAgent`, which is a wrapper around an agent for repeated invocations.

**Parameters**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="The target agent to be wrapped."></x-field>
</x-field-group>

**Returns**

<x-field data-name="UserAgent<I, O>" data-type="UserAgent" data-desc="A user agent instance."></x-field>

### `invoke(agent, message, options)`

This is the standard way to invoke an agent with a message and receive a response.

**Parameters**

<x-field-group>
  <x-field data-name="agent" data-type="Agent<I, O>" data-required="true" data-desc="The target agent to invoke."></x-field>
  <x-field data-name="message" data-type="I & Message" data-required="true" data-desc="The input message to send to the agent."></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="Optional configuration parameters for the invocation."></x-field>
</x-field-group>

**Returns**

<x-field data-name="Promise<O>" data-type="Promise" data-desc="A promise that resolves to the agent's complete response."></x-field>

**Example**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // Assuming yourChatModel is an instance of a ChatModel
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const response = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' });
    console.log('Agent response:', response.content);
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeAgent();
```

### Streaming

The `invoke` method also supports streaming responses by setting the `streaming` option to `true`.

**Example**

```typescript
import { AIGNE, AIAgent } from '@aigne/core';

async function invokeStreamingAgent() {
  const travelAgent = new AIAgent({
    name: 'TravelAgent',
    description: 'An agent that helps with travel planning.',
    model: yourChatModel, // Assuming yourChatModel is an instance of a ChatModel
  });

  const aigne = new AIGNE({
    agents: [travelAgent],
  });

  try {
    const stream = await aigne.invoke(travelAgent, { content: 'Plan a trip to Paris.' }, { streaming: true });
    for await (const chunk of stream) {
      console.log('Stream chunk:', chunk.content);
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
  }
}

invokeStreamingAgent();
```

## Messaging

The `AIGNE` class provides a message queue for inter-agent communication.

### `publish()`

The `publish` method broadcasts a message to all subscribers of a specified topic.

**Parameters**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="The topic or topics to publish the message to."></x-field>
  <x-field data-name="payload" data-type="Omit<MessagePayload, 'context'> | Message" data-required="true" data-desc="The message payload."></x-field>
  <x-field data-name="options" data-type="InvokeOptions<U>" data-required="false" data-desc="Optional configuration parameters."></x-field>
</x-field-group>

### `subscribe()`

The `subscribe` method allows you to listen for messages on a specific topic. It can be used with a listener callback or as a promise that resolves with the next message.

**Parameters**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="The topic to subscribe to."></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="false" data-desc="An optional callback function to handle incoming messages."></x-field>
</x-field-group>

**Returns**

<x-field data-name="Unsubscribe | Promise<MessagePayload>" data-type="Function | Promise" data-desc="An unsubscribe function if a listener is provided, otherwise a promise that resolves with the next message."></x-field>

### `unsubscribe()`

The `unsubscribe` method removes a previously registered listener from a topic.

**Parameters**

<x-field-group>
  <x-field data-name="topic" data-type="string | string[]" data-required="true" data-desc="The topic to unsubscribe from."></x-field>
  <x-field data-name="listener" data-type="MessageQueueListener" data-required="true" data-desc="The listener function to remove."></x-field>
</x-field-group>

**Example**

```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

const listener = (payload) => {
  console.log('Received message:', payload.content);
};

aigne.subscribe('news', listener);
aigne.publish('news', { content: 'AIGNE version 2.0 released!' });
aigne.unsubscribe('news', listener);
```

## Lifecycle Management

The `AIGNE` class provides a `shutdown` method for gracefully terminating the instance and all its agents and skills.

### `shutdown()`

The `shutdown` method ensures proper cleanup of resources before termination.

**Returns**

<x-field data-name="Promise<void>" data-type="Promise" data-desc="A promise that resolves when shutdown is complete."></x-field>

**Example**

```typescript
import { AIGNE } from '@aigne/core';

async function shutdownAIGNE() {
  const aigne = new AIGNE();
  // ... your AIGNE logic ...
  await aigne.shutdown();
  console.log('AIGNE instance shut down.');
}

shutdownAIGNE();
```