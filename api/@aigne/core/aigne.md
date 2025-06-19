# aigne

## Classes

### AIGNE\<U\>

AIGNE is a class that orchestrates multiple agents to build complex AI applications.
It serves as the central coordination point for agent interactions, message passing, and execution flow.

#### Examples

Here's a simple example of how to use AIGNE:

```ts
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

const result = await aigne.invoke(agent, { message: "hello" });
console.log(result); // { message: "Hello, How can I assist you today?" }
```

Here's an example of how to use AIGNE with streaming response:

```ts
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

const stream = await aigne.invoke(
  agent,
  { message: "hello" },
  { streaming: true },
);
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.message) {
    text += chunk.delta.text.message;
  }
}

console.log(text); // Output: Hello, How can I assist you today?
```

#### Type Parameters

| Type Parameter              | Default type  |
| --------------------------- | ------------- |
| `U` _extends_ `UserContext` | `UserContext` |

#### Constructors

##### Constructor

> **new AIGNE**\<`U`\>(`options?`): [`AIGNE`](#aigne)\<`U`\>

Creates a new AIGNE instance with the specified options.

###### Parameters

| Parameter  | Type                            | Description                                                                                  |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `options?` | [`AIGNEOptions`](#aigneoptions) | Configuration options for the AIGNE instance including name, description, model, and agents. |

###### Returns

[`AIGNE`](#aigne)\<`U`\>

#### Properties

##### name?

> `optional` **name**: `string`

Optional name identifier for this AIGNE instance.

##### description?

> `optional` **description**: `string`

Optional description of this AIGNE instance's purpose or functionality.

##### model?

> `optional` **model**: `ChatModel`

Global model to use for all agents that don't specify their own model.

##### limits?

> `optional` **limits**: `ContextLimits`

Usage limits applied to this AIGNE instance's execution.

##### skills

> `readonly` **skills**: [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>; \}

Collection of skill agents available to this AIGNE instance.
Provides indexed access by skill name.

##### agents

> `readonly` **agents**: [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>; \}

Collection of primary agents managed by this AIGNE instance.
Provides indexed access by agent name.

#### Methods

##### load()

> `static` **load**(`path`, `options`): `Promise`\<[`AIGNE`](#aigne)\<`UserContext`\>\>

Loads an AIGNE instance from a directory containing an aigne.yaml file and agent definitions.
This static method provides a convenient way to initialize an AIGNE system from configuration files.

###### Parameters

| Parameter | Type                                                                | Description                                           |
| --------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| `path`    | `string`                                                            | Path to the directory containing the aigne.yaml file. |
| `options` | [`AIGNEOptions`](#aigneoptions) & `Omit`\<`LoadOptions`, `"path"`\> | Options to override the loaded configuration.         |

###### Returns

`Promise`\<[`AIGNE`](#aigne)\<`UserContext`\>\>

A fully initialized AIGNE instance with configured agents and skills.

##### addAgent()

> **addAgent**(...`agents`): `void`

Adds one or more agents to this AIGNE instance.
Each agent is attached to this AIGNE instance, allowing it to access the AIGNE's resources.

###### Parameters

| Parameter   | Type                                                                                                             | Description                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| ...`agents` | [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>[] | One or more Agent instances to add to this AIGNE. |

###### Returns

`void`

##### newContext()

> **newContext**(`options?`): `AIGNEContext`

Creates a new execution context for this AIGNE instance.
Contexts isolate state for different flows or conversations.

###### Parameters

| Parameter  | Type                                    |
| ---------- | --------------------------------------- |
| `options?` | `Partial`\<`Context`\<`UserContext`\>\> |

###### Returns

`AIGNEContext`

A new AIGNEContext instance bound to this AIGNE.

##### invoke()

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`): [`UserAgent`](agents/user-agent.md#useragent)\<`I`, `O`\>

Creates a user agent for consistent interactions with a specified agent.
This method allows you to create a wrapper around an agent for repeated invocations.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter | Type                                         | Description                                          |
| --------- | -------------------------------------------- | ---------------------------------------------------- |
| `agent`   | [`Agent`](agents/agent.md#agent)\<`I`, `O`\> | Target agent to be wrapped for consistent invocation |

###### Returns

[`UserAgent`](agents/user-agent.md#useragent)\<`I`, `O`\>

A user agent instance that provides a convenient interface for interacting with the target agent

###### Example

Here's an example of how to create a user agent and invoke it consistently:

```ts
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

const userAgent = aigne.invoke(agent);

const result1 = await userAgent.invoke({ message: "hello" });
console.log(result1); // { message: "Hello, How can I assist you today?" }

const result2 = await userAgent.invoke({ message: "I'm Bob!" });
console.log(result2); // { message: "Nice to meet you, Bob!" }
```

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\]\>

Invokes an agent with a message and returns both the output and the active agent.
This overload is useful when you need to track which agent was ultimately responsible for generating the response.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                               | Description                        |
| --------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `agent`   | [`Agent`](agents/agent.md#agent)\<`I`, `O`\>                                       | Target agent to invoke             |
| `message` | `I`                                                                                | Input message to send to the agent |
| `options` | `InvokeOptions`\<`U`\> & \{ `returnActiveAgent`: `true`; `streaming?`: `false`; \} | -                                  |

###### Returns

`Promise`\<\[`O`, [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\]\>

A promise resolving to a tuple containing the agent's response and the final active agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](agents/agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\>\]\>

Invokes an agent with a message and returns both a stream of the response and the active agent.
This overload is useful when you need streaming responses while also tracking which agent provided them.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                             | Description                        |
| --------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| `agent`   | [`Agent`](agents/agent.md#agent)\<`I`, `O`\>                                     | Target agent to invoke             |
| `message` | `I`                                                                              | Input message to send to the agent |
| `options` | `InvokeOptions`\<`U`\> & \{ `returnActiveAgent`: `true`; `streaming`: `true`; \} | -                                  |

###### Returns

`Promise`\<\[[`AgentResponseStream`](agents/agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\>\]\>

A promise resolving to a tuple containing the agent's response stream and a promise for the final agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>

Invokes an agent with a message and returns just the output.
This is the standard way to invoke an agent when you only need the response.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                                                 | Description                                          |
| ---------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `agent`    | [`Agent`](agents/agent.md#agent)\<`I`, `O`\>                                         | Target agent to invoke                               |
| `message`  | `I`                                                                                  | Input message to send to the agent                   |
| `options?` | `InvokeOptions`\<`U`\> & \{ `returnActiveAgent?`: `false`; `streaming?`: `false`; \} | Optional configuration parameters for the invocation |

###### Returns

`Promise`\<`O`\>

A promise resolving to the agent's complete response

###### Example

Here's a simple example of how to invoke an agent:

```ts
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

const result = await aigne.invoke(agent, { message: "hello" });
console.log(result); // { message: "Hello, How can I assist you today?" }
```

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](agents/agent.md#agentresponsestream)\<`O`\>\>

Invokes an agent with a message and returns a stream of the response.
This allows processing the response incrementally as it's being generated.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                               | Description                                                                 |
| --------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `agent`   | [`Agent`](agents/agent.md#agent)\<`I`, `O`\>                                       | Target agent to invoke                                                      |
| `message` | `I`                                                                                | Input message to send to the agent                                          |
| `options` | `InvokeOptions`\<`U`\> & \{ `returnActiveAgent?`: `false`; `streaming`: `true`; \} | Configuration with streaming enabled to receive incremental response chunks |

###### Returns

`Promise`\<[`AgentResponseStream`](agents/agent.md#agentresponsestream)\<`O`\>\>

A promise resolving to a stream of the agent's response that can be consumed incrementally

###### Example

Here's an example of how to invoke an agent with streaming response:

```ts
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

const stream = await aigne.invoke(
  agent,
  { message: "hello" },
  { streaming: true },
);
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk) && chunk.delta.text?.message) {
    text += chunk.delta.text.message;
  }
}

console.log(text); // Output: Hello, How can I assist you today?
```

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](agents/user-agent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/agent.md#agentresponse)\<`O`\>, [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\]\>

General implementation signature that handles all overload cases.
This unified signature supports all the different invocation patterns defined by the overloads.

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/agent.md#message) |
| `O` _extends_ [`Message`](agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                         | Description                                          |
| ---------- | -------------------------------------------- | ---------------------------------------------------- |
| `agent`    | [`Agent`](agents/agent.md#agent)\<`I`, `O`\> | Target agent to invoke or wrap                       |
| `message?` | `I`                                          | Optional input message to send to the agent          |
| `options?` | `InvokeOptions`\<`U`\>                       | Optional configuration parameters for the invocation |

###### Returns

[`UserAgent`](agents/user-agent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/agent.md#agentresponse)\<`O`\>, [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>\]\>

Either a UserAgent (when no message provided) or a promise resolving to the agent's response
with optional active agent information based on the provided options

##### publish()

> **publish**(`topic`, `payload`, `options?`): `void`

Publishes a message to the message queue for inter-agent communication.
This method broadcasts a message to all subscribers of the specified topic(s).
It creates a new context internally and delegates to the context's publish method.

###### Parameters

| Parameter  | Type                                                                            | Description                                                 |
| ---------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `topic`    | `string` \| `string`[]                                                          | The topic or array of topics to publish the message to      |
| `payload`  | [`Message`](agents/agent.md#message) \| `Omit`\<`MessagePayload`, `"context"`\> | The message payload to be delivered to subscribers          |
| `options?` | `InvokeOptions`\<`U`\>                                                          | Optional configuration parameters for the publish operation |

###### Returns

`void`

###### Example

Here's an example of how to publish a message:

```ts
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

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<`MessagePayload`\>

Subscribes to receive the next message on a specific topic.
This overload returns a Promise that resolves with the next message published to the topic.
It's useful for one-time message handling or when using async/await patterns.

###### Parameters

| Parameter   | Type                   | Description               |
| ----------- | ---------------------- | ------------------------- |
| `topic`     | `string` \| `string`[] | The topic to subscribe to |
| `listener?` | `undefined`            | -                         |

###### Returns

`Promise`\<`MessagePayload`\>

A Promise that resolves with the next message payload published to the specified topic

###### Example

Here's an example of how to subscribe to a topic and receive the next message:

```ts
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

###### Call Signature

> **subscribe**(`topic`, `listener`): `Unsubscribe`

Subscribes to messages on a specific topic with a listener callback.
This overload registers a listener function that will be called for each message published to the topic.
It's useful for continuous message handling or event-driven architectures.

###### Parameters

| Parameter  | Type                   | Description                                                                        |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------- |
| `topic`    | `string` \| `string`[] | The topic to subscribe to                                                          |
| `listener` | `MessageQueueListener` | Callback function that will be invoked when messages arrive on the specified topic |

###### Returns

`Unsubscribe`

An Unsubscribe function that can be called to cancel the subscription

###### Example

Here's an example of how to subscribe to a topic with a listener:

```ts
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

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Unsubscribe` \| `Promise`\<`MessagePayload`\>

Generic subscribe signature that handles both Promise and listener patterns.
This is the implementation signature that supports both overloaded behaviors.

###### Parameters

| Parameter   | Type                   | Description                |
| ----------- | ---------------------- | -------------------------- |
| `topic`     | `string` \| `string`[] | The topic to subscribe to  |
| `listener?` | `MessageQueueListener` | Optional callback function |

###### Returns

`Unsubscribe` \| `Promise`\<`MessagePayload`\>

Either a Promise for the next message or an Unsubscribe function

##### unsubscribe()

> **unsubscribe**(`topic`, `listener`): `void`

Unsubscribes a listener from a specific topic in the message queue.
This method stops a previously registered listener from receiving further messages.
It should be called when message processing is complete or when the component is no longer interested
in messages published to the specified topic.

###### Parameters

| Parameter  | Type                   | Description                                                       |
| ---------- | ---------------------- | ----------------------------------------------------------------- |
| `topic`    | `string` \| `string`[] | The topic to unsubscribe from                                     |
| `listener` | `MessageQueueListener` | The listener function that was previously subscribed to the topic |

###### Returns

`void`

###### Example

```ts
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

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Gracefully shuts down the AIGNE instance and all its agents and skills.
This ensures proper cleanup of resources before termination.

###### Returns

`Promise`\<`void`\>

A promise that resolves when shutdown is complete.

###### Example

Here's an example of shutdown an AIGNE instance:

```ts
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

##### \[asyncDispose\]()

> **\[asyncDispose\]**(): `Promise`\<`void`\>

Asynchronous dispose method for the AIGNE instance.

###### Returns

`Promise`\<`void`\>

###### Example

Here's an example of using async dispose:

```ts
const model = new OpenAIChatModel();

// AIGNE: Main execution engine of AIGNE Framework.
await using aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
  inputKey: "message",
});

await aigne.invoke(agent, { message: "hello" });

// aigne will be automatically shutdown when exiting the using block
```

## Interfaces

### AIGNEOptions

Options for the AIGNE class.

#### Properties

| Property                                | Type                                                                                                             | Description                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <a id="name"></a> `name?`               | `string`                                                                                                         | The name of the AIGNE instance.                                                   |
| <a id="description"></a> `description?` | `string`                                                                                                         | The description of the AIGNE instance.                                            |
| <a id="model"></a> `model?`             | `ChatModel`                                                                                                      | Global model to use for all agents not specifying a model.                        |
| <a id="skills"></a> `skills?`           | [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>[] | Skills to use for the AIGNE instance.                                             |
| <a id="agents"></a> `agents?`           | [`Agent`](agents/agent.md#agent)\<[`Message`](agents/agent.md#message), [`Message`](agents/agent.md#message)\>[] | Agents to use for the AIGNE instance.                                             |
| <a id="limits"></a> `limits?`           | `ContextLimits`                                                                                                  | Limits for the AIGNE instance, such as timeout, max tokens, max invocations, etc. |
