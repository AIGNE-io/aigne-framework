# http-client

## Classes

### AIGNEHTTPClient\<U\>

Http client for interacting with a remote AIGNE server.
AIGNEHTTPClient provides a client-side interface that matches the AIGNE API,
allowing applications to invoke agents and receive responses from a remote AIGNE instance.

#### Examples

Here's a simple example of how to use AIGNEClient:

```ts
const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { message: "hello" });

console.log(response); // Output: {message: "Hello world!"}
```

Here's an example of how to use AIGNEClient with streaming response:

```ts
const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.message) text += chunk.delta.text.message;
  }
}

console.log(text); // Output: "Hello world!"
```

#### Type Parameters

| Type Parameter              | Default type  |
| --------------------------- | ------------- |
| `U` _extends_ `UserContext` | `UserContext` |

#### Implements

- `Context`\<`U`\>

#### Constructors

##### Constructor

> **new AIGNEHTTPClient**\<`U`\>(`options`): [`AIGNEHTTPClient`](#aignehttpclient)\<`U`\>

Creates a new AIGNEClient instance.

###### Parameters

| Parameter | Type                                                | Description                                              |
| --------- | --------------------------------------------------- | -------------------------------------------------------- |
| `options` | [`AIGNEHTTPClientOptions`](#aignehttpclientoptions) | Configuration options for connecting to the AIGNE server |

###### Returns

[`AIGNEHTTPClient`](#aignehttpclient)\<`U`\>

#### Properties

##### options

> **options**: [`AIGNEHTTPClientOptions`](#aignehttpclientoptions)

Configuration options for connecting to the AIGNE server

##### id

> **id**: `string`

###### Implementation of

`Context.id`

##### rootId

> **rootId**: `string`

###### Implementation of

`Context.rootId`

##### usage

> **usage**: `ContextUsage`

###### Implementation of

`Context.usage`

##### userContext

> **userContext**: `U`

###### Implementation of

`Context.userContext`

##### memories

> **memories**: `Pick`\<[`Memory`](../core/memory.md#memory), `"content"`\>[] = `[]`

###### Implementation of

`Context.memories`

##### model

> **model**: `ClientChatModel`

###### Implementation of

`Context.model`

#### Methods

##### invoke()

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`): [`UserAgent`](../core/agents/user-agent.md#useragent)\<`I`, `O`\>

Create a user agent to consistently invoke an agent

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                             | Description     |
| --------- | ---------------------------------------------------------------- | --------------- |
| `agent`   | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\> | Agent to invoke |

###### Returns

[`UserAgent`](../core/agents/user-agent.md#useragent)\<`I`, `O`\>

User agent

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[`O`, [`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\]\>

Invoke an agent with a message and return the output and the active agent

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                                                        | Description                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `agent`   | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>                                                            | Agent to invoke              |
| `message` | `I`                                                                                                                         | Message to pass to the agent |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `returnActiveAgent`: `true`; `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<\[`O`, [`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\]\>

the output of the agent and the final active agent

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<\[[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\>\]\>

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `agent`   | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>                                                          |
| `message` | `I`                                                                                                                       |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `returnActiveAgent`: `true`; `streaming`: `true`; \} |

###### Returns

`Promise`\<\[[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>, `Promise`\<[`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\>\]\>

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options?`): `Promise`\<`O`\>

Invoke an agent with a message

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                                                                                          | Description                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `agent`    | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>                                                              | Agent to invoke              |
| `message`  | `I`                                                                                                                           | Message to pass to the agent |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `returnActiveAgent?`: `false`; `streaming?`: `false`; \} | -                            |

###### Returns

`Promise`\<`O`\>

the output of the agent

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `agent`   | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>                                                            |
| `message` | `I`                                                                                                                         |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `returnActiveAgent?`: `false`; `streaming`: `true`; \} |

###### Returns

`Promise`\<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message`, `options`): `Promise`\<`O` \| [`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------ |
| `agent`   | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\>                                       |
| `message` | `I`                                                                                                    |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `returnActiveAgent?`: `false`; \} |

###### Returns

`Promise`\<`O` \| [`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

###### Implementation of

`Context.invoke`

###### Call Signature

> **invoke**\<`I`, `O`\>(`agent`, `message?`, `options?`): [`UserAgent`](../core/agents/user-agent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\>, [`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\]\>

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                             |
| ---------- | ---------------------------------------------------------------- |
| `agent`    | `string` \| [`Agent`](../core/agents/agent.md#agent)\<`I`, `O`\> |
| `message?` | `I`                                                              |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions)  |

###### Returns

[`UserAgent`](../core/agents/user-agent.md#useragent)\<`I`, `O`\> \| `Promise`\<[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\> \| \[[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\>, [`Agent`](../core/agents/agent.md#agent)\<`any`, `any`\>\]\>

###### Implementation of

`Context.invoke`

##### publish()

> **publish**(`_topic`, `_payload`, `_options?`): `void`

Publish a message to a topic, the aigne will invoke the listeners of the topic

###### Parameters

| Parameter   | Type                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------- |
| `_topic`    | `string` \| `string`[]                                                                              |
| `_payload`  | `string` \| [`Message`](../core/agents/agent.md#message) \| `Omit`\<`MessagePayload`, `"context"`\> |
| `_options?` | `InvokeOptions`\<`UserContext`\>                                                                    |

###### Returns

`void`

###### Implementation of

`Context.publish`

##### subscribe()

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Promise`\<`MessagePayload`\>

###### Parameters

| Parameter   | Type                   |
| ----------- | ---------------------- |
| `topic`     | `string` \| `string`[] |
| `listener?` | `undefined`            |

###### Returns

`Promise`\<`MessagePayload`\>

###### Implementation of

`Context.subscribe`

###### Call Signature

> **subscribe**(`topic`, `listener`): `Unsubscribe`

###### Parameters

| Parameter  | Type                   |
| ---------- | ---------------------- |
| `topic`    | `string` \| `string`[] |
| `listener` | `MessageQueueListener` |

###### Returns

`Unsubscribe`

###### Implementation of

`Context.subscribe`

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Unsubscribe` \| `Promise`\<`MessagePayload`\>

###### Parameters

| Parameter   | Type                   |
| ----------- | ---------------------- |
| `topic`     | `string` \| `string`[] |
| `listener?` | `MessageQueueListener` |

###### Returns

`Unsubscribe` \| `Promise`\<`MessagePayload`\>

###### Implementation of

`Context.subscribe`

###### Call Signature

> **subscribe**(`topic`, `listener?`): `Unsubscribe` \| `Promise`\<`MessagePayload`\>

###### Parameters

| Parameter   | Type                   |
| ----------- | ---------------------- |
| `topic`     | `string` \| `string`[] |
| `listener?` | `MessageQueueListener` |

###### Returns

`Unsubscribe` \| `Promise`\<`MessagePayload`\>

###### Implementation of

`Context.subscribe`

##### unsubscribe()

> **unsubscribe**(`_topic`, `_listener`): `void`

###### Parameters

| Parameter   | Type                   |
| ----------- | ---------------------- |
| `_topic`    | `string` \| `string`[] |
| `_listener` | `MessageQueueListener` |

###### Returns

`void`

###### Implementation of

`Context.unsubscribe`

##### newContext()

> **newContext**(`_options?`): `Context`

Create a child context with the same configuration as the parent context.
If `reset` is true, the child context will have a new state (such as: usage).

###### Parameters

| Parameter         | Type                       |
| ----------------- | -------------------------- |
| `_options?`       | \{ `reset?`: `boolean`; \} |
| `_options.reset?` | `boolean`                  |

###### Returns

`Context`

new context

###### Implementation of

`Context.newContext`

##### emit()

> **emit**\<`K`\>(`_eventName`, ...`_args`): `boolean`

###### Type Parameters

| Type Parameter                        |
| ------------------------------------- |
| `K` _extends_ keyof `ContextEventMap` |

###### Parameters

| Parameter    | Type                                 |
| ------------ | ------------------------------------ |
| `_eventName` | `K`                                  |
| ...`_args`   | `Args`\<`K`, `ContextEmitEventMap`\> |

###### Returns

`boolean`

###### Implementation of

`Context.emit`

##### on()

> **on**\<`K`\>(`_eventName`, `_listener`): `this`

###### Type Parameters

| Type Parameter                        |
| ------------------------------------- |
| `K` _extends_ keyof `ContextEventMap` |

###### Parameters

| Parameter    | Type                                 |
| ------------ | ------------------------------------ |
| `_eventName` | `K`                                  |
| `_listener`  | `Listener`\<`K`, `ContextEventMap`\> |

###### Returns

`this`

###### Implementation of

`Context.on`

##### once()

> **once**\<`K`\>(`_eventName`, `_listener`): `this`

###### Type Parameters

| Type Parameter                        |
| ------------------------------------- |
| `K` _extends_ keyof `ContextEventMap` |

###### Parameters

| Parameter    | Type                                 |
| ------------ | ------------------------------------ |
| `_eventName` | `K`                                  |
| `_listener`  | `Listener`\<`K`, `ContextEventMap`\> |

###### Returns

`this`

###### Implementation of

`Context.once`

##### off()

> **off**\<`K`\>(`_eventName`, `_listener`): `this`

###### Type Parameters

| Type Parameter                        |
| ------------------------------------- |
| `K` _extends_ keyof `ContextEventMap` |

###### Parameters

| Parameter    | Type                                 |
| ------------ | ------------------------------------ |
| `_eventName` | `K`                                  |
| `_listener`  | `Listener`\<`K`, `ContextEventMap`\> |

###### Returns

`this`

###### Implementation of

`Context.off`

##### \_invoke()

###### Call Signature

> **\_invoke**\<`I`, `O`\>(`agent`, `input`, `options?`): `Promise`\<`O`\>

Invokes an agent in non-streaming mode and returns the complete response.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                                                           | Description                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `agent`    | `string`                                                                                       | Name of the agent to invoke                                    |
| `input`    | `string` \| `I`                                                                                | Input message for the agent                                    |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `streaming?`: `false`; \} | Options with streaming mode explicitly set to false or omitted |

###### Returns

`Promise`\<`O`\>

The complete agent response

###### Example

Here's a simple example of how to use AIGNEClient:

```ts
const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { message: "hello" });

console.log(response); // Output: {message: "Hello world!"}
```

###### Call Signature

> **\_invoke**\<`I`, `O`\>(`agent`, `input`, `options`): `Promise`\<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

Invokes an agent with streaming mode enabled and returns a stream of response chunks.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                         | Description                                        |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `agent`   | `string`                                                                                     | Name of the agent to invoke                        |
| `input`   | `string` \| `I`                                                                              | Input message for the agent                        |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & \{ `streaming`: `true`; \} | Options with streaming mode explicitly set to true |

###### Returns

`Promise`\<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)\<`O`\>\>

A stream of agent response chunks

###### Example

Here's an example of how to use AIGNEClient with streaming response:

```ts
const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.message) text += chunk.delta.text.message;
  }
}

console.log(text); // Output: "Hello world!"
```

###### Call Signature

> **\_invoke**\<`I`, `O`\>(`agent`, `input`, `options?`): `Promise`\<[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\>\>

Invokes an agent with the given input and options.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                            | Description                 |
| ---------- | --------------------------------------------------------------- | --------------------------- |
| `agent`    | `string`                                                        | Name of the agent to invoke |
| `input`    | `string` \| `I`                                                 | Input message for the agent |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) | Options for the invocation  |

###### Returns

`Promise`\<[`AgentResponse`](../core/agents/agent.md#agentresponse)\<`O`\>\>

Either a complete response or a response stream depending on the streaming option

##### getAgent()

> **getAgent**\<`I`, `O`\>(`options`): `Promise`\<`ClientAgent`\<`I`, `O`\>\>

###### Type Parameters

| Type Parameter                                             | Default type                                 |
| ---------------------------------------------------------- | -------------------------------------------- |
| `I` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |
| `O` _extends_ [`Message`](../core/agents/agent.md#message) | [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                             |
| --------- | -------------------------------- |
| `options` | `ClientAgentOptions`\<`I`, `O`\> |

###### Returns

`Promise`\<`ClientAgent`\<`I`, `O`\>\>

## Interfaces

### AIGNEHTTPClientOptions

Configuration options for the AIGNEHTTPClient.

#### Properties

| Property               | Type     | Description                                                                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| <a id="url"></a> `url` | `string` | The URL of the AIGNE server to connect to. This should point to the base endpoint where the AIGNEServer is hosted. |

---

### AIGNEHTTPClientInvokeOptions

Options for invoking an agent through the AIGNEHTTPClient.
Extends the standard AgentInvokeOptions with client-specific options.

#### Extends

- `InvokeOptions`

#### Properties

| Property                                  | Type                       | Description                                                                                                                           |
| ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="fetchoptions"></a> `fetchOptions?` | `Partial`\<`RequestInit`\> | Additional fetch API options to customize the HTTP request. These options will be merged with the default options used by the client. |
