[@aigne/core](../README.md) / core/aigne

# core/aigne

## Classes

### AIGNE

AIGNE is a class that orchestrates multiple agents to build complex AI applications.
It serves as the central coordination point for agent interactions, message passing, and execution flow.

#### Examples

Here's a simple example of how to use AIGNE:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

const result = await aigne.invoke(agent, "hello");

console.log(result); // { $message: "Hello, How can I assist you today?" }
```

Here's an example of how to use AIGNE with streaming response:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

let text = "";

const stream = await aigne.invoke(agent, "hello", { streaming: true });

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
}

console.log(text);
```

#### Constructors

##### Constructor

> **new AIGNE**(`options?`): [`AIGNE`](#aigne)

Creates a new AIGNE instance with the specified options.

###### Parameters

| Parameter  | Type                            | Description                                                                                  |
| ---------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `options?` | [`AIGNEOptions`](#aigneoptions) | Configuration options for the AIGNE instance including name, description, model, and agents. |

###### Returns

[`AIGNE`](#aigne)

#### Properties

| Property                                  | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="name-1"></a> `name?`               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Optional name identifier for this AIGNE instance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| <a id="description-1"></a> `description?` | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Optional description of this AIGNE instance's purpose or functionality.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| <a id="model-1"></a> `model?`             | [`ChatModel`](models/ChatModel.md#chatmodel)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Global model to use for all agents that don't specify their own model.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| <a id="limits-1"></a> `limits?`           | [`ContextLimits`](#contextlimits-1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Usage limits applied to this AIGNE instance's execution.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="messagequeue"></a> `messageQueue`  | [`MessageQueue`](#messagequeue-1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Message queue for handling inter-agent communication.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <a id="skills-1"></a> `skills`            | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Collection of skill agents available to this AIGNE instance. Provides indexed access by skill name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <a id="agents-1"></a> `agents`            | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] & \{[`key`: `string`]: [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>; \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Collection of primary agents managed by this AIGNE instance. Provides indexed access by agent name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <a id="invoke"></a> `invoke`              | \{\<`I`, `O`\>(`agent`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>\>; \<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\>, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>; \} | Invokes an agent with the specified input and options. This is a shorthand method that creates a new context and immediately invokes an agent. **Param** Arguments passed to the Context's invoke method. **Examples** Here's a simple example of how to invoke an agent: `const model = new OpenAIChatModel(); const aigne = new AIGNE({ model, }); const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); const result = await aigne.invoke(agent, "hello"); console.log(result); // { $message: "Hello, How can I assist you today?" }` Here's an example of how to invoke an agent with streaming response: `const model = new OpenAIChatModel(); const aigne = new AIGNE({ model, }); const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); let text = ""; const stream = await aigne.invoke(agent, "hello", { streaming: true }); for await (const chunk of readableStreamToAsyncIterator(stream)) { if (chunk.delta.text?.$message) text += chunk.delta.text.$message; } console.log(text);` |
| <a id="publish"></a> `publish`            | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Publishes a message to the message queue. This is a shorthand method that creates a new context and publishes a message. **Param** Arguments passed to the Context's publish method.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a id="subscribe"></a> `subscribe`        | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4); \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Subscribes to messages in the message queue. This allows for receiving messages from agents and other components. **Param** Arguments passed to the MessageQueue's subscribe method.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a id="unsubscribe"></a> `unsubscribe`    | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Unsubscribes from messages in the message queue. This cancels a previous subscription to stop receiving messages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### Methods

##### load()

> `static` **load**(`path`, `options?`): `Promise`\<[`AIGNE`](#aigne)\>

Loads an AIGNE instance from a directory containing an aigne.yaml file and agent definitions.
This static method provides a convenient way to initialize an AIGNE system from configuration files.

###### Parameters

| Parameter  | Type                            | Description                                           |
| ---------- | ------------------------------- | ----------------------------------------------------- |
| `path`     | `string`                        | Path to the directory containing the aigne.yaml file. |
| `options?` | [`AIGNEOptions`](#aigneoptions) | Options to override the loaded configuration.         |

###### Returns

`Promise`\<[`AIGNE`](#aigne)\>

A fully initialized AIGNE instance with configured agents and skills.

##### addAgent()

> **addAgent**(...`agents`): `void`

Adds one or more agents to this AIGNE instance.
Each agent is attached to this AIGNE instance, allowing it to access the AIGNE's resources.

###### Parameters

| Parameter   | Type                                                                                                             | Description                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| ...`agents` | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] | One or more Agent instances to add to this AIGNE. |

###### Returns

`void`

##### newContext()

> **newContext**(): [`AIGNEContext`](#aignecontext)

Creates a new execution context for this AIGNE instance.
Contexts isolate state for different flows or conversations.

###### Returns

[`AIGNEContext`](#aignecontext)

A new AIGNEContext instance bound to this AIGNE.

##### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Gracefully shuts down the AIGNE instance and all its agents and skills.
This ensures proper cleanup of resources before termination.

###### Returns

`Promise`\<`void`\>

A promise that resolves when shutdown is complete.

###### Examples

Here's an example of shutdown an AIGNE instance:

```ts
const model = new OpenAIChatModel();

const aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

await aigne.shutdown();
```

Here's an example of using async dispose:

```ts
const model = new OpenAIChatModel();

await using aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

// aigne will be automatically shutdown when exiting the using block
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

await using aigne = new AIGNE({
  model,
});

const agent = AIAgent.from({
  name: "chat",
  description: "A chat agent",
});

await aigne.invoke(agent, "hello");

// aigne will be automatically shutdown when exiting the using block
```

---

### AIGNEContext

#### Implements

- [`Context`](#context)

#### Constructors

##### Constructor

> **new AIGNEContext**(`parent?`): [`AIGNEContext`](#aignecontext)

###### Parameters

| Parameter | Type                                                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `parent?` | `Pick`\<[`Context`](#context), `"skills"` \| `"limits"` \| `"model"`\> & \{ `messageQueue?`: [`MessageQueue`](#messagequeue-1); \} |

###### Returns

[`AIGNEContext`](#aignecontext)

#### Properties

| Property                                 | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Description                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <a id="parentid"></a> `parentId?`        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | -                                                                              |
| <a id="id"></a> `id`                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | -                                                                              |
| <a id="internal"></a> `internal`         | `AIGNEContextInternal`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | -                                                                              |
| <a id="invoke-8"></a> `invoke`           | \{\<`I`, `O`\>(`agent`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\>\]\>; \<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>; \<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>\>; \<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\>, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>; \} | Create a user agent to consistently invoke an agent **Param** Agent to invoke  |
| <a id="publish-3"></a> `publish`         | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Publish a message to a topic, the aigne will invoke the listeners of the topic |
| <a id="subscribe-6"></a> `subscribe`     | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4); \}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -                                                                              |
| <a id="unsubscribe-3"></a> `unsubscribe` | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | -                                                                              |

#### Accessors

##### model

###### Get Signature

> **get** **model**(): `undefined` \| [`ChatModel`](models/ChatModel.md#chatmodel)

###### Returns

`undefined` \| [`ChatModel`](models/ChatModel.md#chatmodel)

###### Implementation of

[`Context`](#context).[`model`](#model-2)

##### skills

###### Get Signature

> **get** **skills**(): `undefined` \| [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[]

###### Returns

`undefined` \| [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[]

###### Implementation of

[`Context`](#context).[`skills`](#skills-2)

##### limits

###### Get Signature

> **get** **limits**(): `undefined` \| [`ContextLimits`](#contextlimits-1)

###### Returns

`undefined` \| [`ContextLimits`](#contextlimits-1)

###### Implementation of

[`Context`](#context).[`limits`](#limits-2)

##### status

###### Get Signature

> **get** **status**(): `"normal"` \| `"timeout"`

###### Returns

`"normal"` \| `"timeout"`

###### Implementation of

[`Context`](#context).[`status`](#status)

##### usage

###### Get Signature

> **get** **usage**(): [`ContextUsage`](#contextusage-1)

###### Returns

[`ContextUsage`](#contextusage-1)

###### Implementation of

[`Context`](#context).[`usage`](#usage)

#### Methods

##### newContext()

> **newContext**(`options`): [`AIGNEContext`](#aignecontext)

Create a child context with the same configuration as the parent context.
If `reset` is true, the child context will have a new state (such as: usage).

###### Parameters

| Parameter        | Type                       | Description                                              |
| ---------------- | -------------------------- | -------------------------------------------------------- |
| `options`        | \{ `reset?`: `boolean`; \} |                                                          |
| `options.reset?` | `boolean`                  | create a new context with initial state (such as: usage) |

###### Returns

[`AIGNEContext`](#aignecontext)

new context

###### Implementation of

[`Context`](#context).[`newContext`](#newcontext-2)

##### emit()

> **emit**\<`K`\>(`eventName`, ...`args`): `boolean`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                         |
| ----------- | ------------------------------------------------------------ |
| `eventName` | `K`                                                          |
| ...`args`   | `Args`\<`K`, [`ContextEmitEventMap`](#contextemiteventmap)\> |

###### Returns

`boolean`

###### Implementation of

`Context.emit`

##### on()

> **on**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.on`

##### once()

> **once**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.once`

##### off()

> **off**\<`K`\>(`eventName`, `listener`): `this`

###### Type Parameters

| Type Parameter                                            |
| --------------------------------------------------------- |
| `K` _extends_ keyof [`ContextEventMap`](#contexteventmap) |

###### Parameters

| Parameter   | Type                                                     |
| ----------- | -------------------------------------------------------- |
| `eventName` | `K`                                                      |
| `listener`  | `Listener`\<`K`, [`ContextEventMap`](#contexteventmap)\> |

###### Returns

`this`

###### Implementation of

`Context.off`

---

### MessageQueue

#### Constructors

##### Constructor

> **new MessageQueue**(): [`MessageQueue`](#messagequeue-1)

###### Returns

[`MessageQueue`](#messagequeue-1)

#### Properties

| Property                     | Type                                |
| ---------------------------- | ----------------------------------- |
| <a id="events"></a> `events` | `EventEmitter`\<`DefaultEventMap`\> |

#### Methods

##### publish()

> **publish**(`topic`, `payload`): `void`

###### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `topic`   | `string` \| `string`[]              |
| `payload` | [`MessagePayload`](#messagepayload) |

###### Returns

`void`

##### error()

> **error**(`error`): `void`

###### Parameters

| Parameter | Type    |
| --------- | ------- |
| `error`   | `Error` |

###### Returns

`void`

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>

###### Parameters

| Parameter   | Type        |
| ----------- | ----------- |
| `topic`     | `string`    |
| `listener?` | `undefined` |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\>

###### Call Signature

> **subscribe**(`topic`, `listener`): [`Unsubscribe`](#unsubscribe-4)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

[`Unsubscribe`](#unsubscribe-4)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

##### unsubscribe()

> **unsubscribe**(`topic`, `listener`): `void`

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`void`

## Interfaces

### AIGNEOptions

Options for the AIGNE class.

#### Properties

| Property                                | Type                                                                                                             | Description                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <a id="name"></a> `name?`               | `string`                                                                                                         | The name of the AIGNE instance.                                                   |
| <a id="description"></a> `description?` | `string`                                                                                                         | The description of the AIGNE instance.                                            |
| <a id="model"></a> `model?`             | [`ChatModel`](models/ChatModel.md#chatmodel)                                                                     | Global model to use for all agents not specifying a model.                        |
| <a id="skills"></a> `skills?`           | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] | Skills to use for the AIGNE instance.                                             |
| <a id="agents"></a> `agents?`           | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] | Agents to use for the AIGNE instance.                                             |
| <a id="limits"></a> `limits?`           | [`ContextLimits`](#contextlimits-1)                                                                              | Limits for the AIGNE instance, such as timeout, max tokens, max invocations, etc. |

---

### AgentEvent

#### Properties

| Property                                        | Type                             |
| ----------------------------------------------- | -------------------------------- |
| <a id="parentcontextid"></a> `parentContextId?` | `string`                         |
| <a id="contextid"></a> `contextId`              | `string`                         |
| <a id="timestamp"></a> `timestamp`              | `number`                         |
| <a id="agent"></a> `agent`                      | [`Agent`](agents/Agent.md#agent) |

---

### ContextEventMap

#### Properties

| Property                                 | Type                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| <a id="agentstarted"></a> `agentStarted` | \[[`AgentEvent`](#agentevent) & \{ `input`: [`Message`](agents/Agent.md#message); \}\]  |
| <a id="agentsucceed"></a> `agentSucceed` | \[[`AgentEvent`](#agentevent) & \{ `output`: [`Message`](agents/Agent.md#message); \}\] |
| <a id="agentfailed"></a> `agentFailed`   | \[[`AgentEvent`](#agentevent) & \{ `error`: `Error`; \}\]                               |

---

### InvokeOptions

Options for invoking an agent

#### Extends

- [`AgentInvokeOptions`](agents/Agent.md#agentinvokeoptions)

#### Properties

| Property                                            | Type      |
| --------------------------------------------------- | --------- |
| <a id="returnactiveagent"></a> `returnActiveAgent?` | `boolean` |
| <a id="disabletransfer"></a> `disableTransfer?`     | `boolean` |

---

### Context

#### Extends

- `TypedEventEmitter`\<[`ContextEventMap`](#contexteventmap), [`ContextEmitEventMap`](#contextemiteventmap)\>

#### Properties

| Property                        | Type                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| <a id="model-2"></a> `model?`   | [`ChatModel`](models/ChatModel.md#chatmodel)                                                                     |
| <a id="skills-2"></a> `skills?` | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>[] |
| <a id="usage"></a> `usage`      | [`ContextUsage`](#contextusage-1)                                                                                |
| <a id="limits-2"></a> `limits?` | [`ContextLimits`](#contextlimits-1)                                                                              |
| <a id="status"></a> `status?`   | `"normal"` \| `"timeout"`                                                                                        |

#### Methods

##### invoke()

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\>

Create a user agent to consistently invoke an agent

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter | Type                                         | Description     |
| --------- | -------------------------------------------- | --------------- |
| `agent`   | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\> | Agent to invoke |

###### Returns

[`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\>

User agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>

Invoke an agent with a message and return the output and the active agent

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter | Type                                                                                          | Description                  |
| --------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| `agent`   | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\>                                                  | Agent to invoke              |
| `message` | `string` \| `I`                                                                               | Message to pass to the agent |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `returnActiveAgent`: `true`; `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<\[`O`, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>

the output of the agent and the final active agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\>\]\>

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter | Type                                                                                        |
| --------- | ------------------------------------------------------------------------------------------- |
| `agent`   | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\>                                                |
| `message` | `string` \| `I`                                                                             |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `returnActiveAgent`: `true`; `streaming`: `true`; \} |

###### Returns

`Promise`\<\[[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\>\]\>

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>

Invoke an agent with a message

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter  | Type                                                             | Description                  |
| ---------- | ---------------------------------------------------------------- | ---------------------------- |
| `agent`    | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\>                     | Agent to invoke              |
| `message`  | `string` \| `I`                                                  | Message to pass to the agent |
| `options?` | [`InvokeOptions`](#invokeoptions) & \{ `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<`O`\>

the output of the agent

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>\>

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter | Type                                                           |
| --------- | -------------------------------------------------------------- |
| `agent`   | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\>                   |
| `message` | `string` \| `I`                                                |
| `options` | [`InvokeOptions`](#invokeoptions) & \{ `streaming`: `true`; \} |

###### Returns

`Promise`\<[`AgentResponseStream`](agents/Agent.md#agentresponsestream)\<`O`\>\>

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\>, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>

###### Type Parameters

| Type Parameter                                     |
| -------------------------------------------------- |
| `I` _extends_ [`Message`](agents/Agent.md#message) |
| `O` _extends_ [`Message`](agents/Agent.md#message) |

###### Parameters

| Parameter  | Type                                         |
| ---------- | -------------------------------------------- |
| `agent`    | [`Agent`](agents/Agent.md#agent)\<`I`, `O`\> |
| `message?` | `string` \| `I`                              |
| `options?` | [`InvokeOptions`](#invokeoptions)            |

###### Returns

[`UserAgent`](agents/UserAgent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](agents/Agent.md#agentresponse)\<`O`\>, [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\>\]\>

##### publish()

> **publish**(`topic`, `payload`): `void`

Publish a message to a topic, the aigne will invoke the listeners of the topic

###### Parameters

| Parameter | Type                                                       | Description                            |
| --------- | ---------------------------------------------------------- | -------------------------------------- |
| `topic`   | `string` \| `string`[]                                     | topic name, or an array of topic names |
| `payload` | `Omit`\<[`MessagePayload`](#messagepayload), `"context"`\> | message to publish                     |

###### Returns

`void`

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\>

###### Parameters

| Parameter   | Type        |
| ----------- | ----------- |
| `topic`     | `string`    |
| `listener?` | `undefined` |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\>

###### Call Signature

> **subscribe**(`topic`, `listener`): [`Unsubscribe`](#unsubscribe-4)

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

[`Unsubscribe`](#unsubscribe-4)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

###### Parameters

| Parameter   | Type                                            |
| ----------- | ----------------------------------------------- |
| `topic`     | `string`                                        |
| `listener?` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`Promise`\<[`MessagePayload`](#messagepayload)\> \| [`Unsubscribe`](#unsubscribe-4)

##### unsubscribe()

> **unsubscribe**(`topic`, `listener`): `void`

###### Parameters

| Parameter  | Type                                            |
| ---------- | ----------------------------------------------- |
| `topic`    | `string`                                        |
| `listener` | [`MessageQueueListener`](#messagequeuelistener) |

###### Returns

`void`

##### newContext()

> **newContext**(`options?`): [`Context`](#context)

Create a child context with the same configuration as the parent context.
If `reset` is true, the child context will have a new state (such as: usage).

###### Parameters

| Parameter        | Type                       | Description                                              |
| ---------------- | -------------------------- | -------------------------------------------------------- |
| `options?`       | \{ `reset?`: `boolean`; \} |                                                          |
| `options.reset?` | `boolean`                  | create a new context with initial state (such as: usage) |

###### Returns

[`Context`](#context)

new context

---

### MessagePayload

#### Properties

| Property                         | Type                                 |
| -------------------------------- | ------------------------------------ |
| <a id="role"></a> `role`         | `"agent"` \| `"user"`                |
| <a id="source"></a> `source?`    | `string`                             |
| <a id="message"></a> `message`   | [`Message`](agents/Agent.md#message) |
| <a id="context-1"></a> `context` | [`Context`](#context)                |

---

### ContextUsage

#### Properties

| Property                                 | Type     |
| ---------------------------------------- | -------- |
| <a id="inputtokens"></a> `inputTokens`   | `number` |
| <a id="outputtokens"></a> `outputTokens` | `number` |
| <a id="agentcalls"></a> `agentCalls`     | `number` |

---

### ContextLimits

#### Properties

| Property                                        | Type     |
| ----------------------------------------------- | -------- |
| <a id="maxtokens"></a> `maxTokens?`             | `number` |
| <a id="maxagentinvokes"></a> `maxAgentInvokes?` | `number` |
| <a id="timeout"></a> `timeout?`                 | `number` |

## Type Aliases

### ContextEmitEventMap

> **ContextEmitEventMap** = \{ \[K in keyof ContextEventMap\]: OmitPropertiesFromArrayFirstElement\<ContextEventMap\[K\], "contextId" \| "parentContextId" \| "timestamp"\> \}

---

### MessageQueueListener()

> **MessageQueueListener** = (`message`) => `void`

#### Parameters

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `message` | [`MessagePayload`](#messagepayload) |

#### Returns

`void`

---

### Unsubscribe()

> **Unsubscribe** = () => `void`

#### Returns

`void`

## Variables

### UserInputTopic

> `const` **UserInputTopic**: `"UserInputTopic"` = `"UserInputTopic"`

---

### UserOutputTopic

> `const` **UserOutputTopic**: `"UserOutputTopic"` = `"UserOutputTopic"`

## Functions

### createPublishMessage()

> **createPublishMessage**(`message`, `from?`): `Omit`\<[`MessagePayload`](#messagepayload), `"context"`\>

#### Parameters

| Parameter | Type                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `message` | `string` \| [`Message`](agents/Agent.md#message)                                                               |
| `from?`   | [`Agent`](agents/Agent.md#agent)\<[`Message`](agents/Agent.md#message), [`Message`](agents/Agent.md#message)\> |

#### Returns

`Omit`\<[`MessagePayload`](#messagepayload), `"context"`\>

---

### newEmptyContextUsage()

> **newEmptyContextUsage**(): [`ContextUsage`](#contextusage-1)

#### Returns

[`ContextUsage`](#contextusage-1)
