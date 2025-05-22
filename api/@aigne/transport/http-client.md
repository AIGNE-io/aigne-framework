[Documentation](../../README.md) / [@aigne/transport](README.md) / http-client

# http-client

## Classes

### AIGNEHTTPClient

Http client for interacting with a remote AIGNE server.
AIGNEHTTPClient provides a client-side interface that matches the AIGNE API,
allowing applications to invoke agents and receive responses from a remote AIGNE instance.

#### Examples

Here's a simple example of how to use AIGNEClient:

```ts
const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

Here's an example of how to use AIGNEClient with streaming response:

```ts
const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { $message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
}

console.log(text); // Output: "Hello world!"
```

#### Constructors

##### Constructor

> **new AIGNEHTTPClient**(`options`): [`AIGNEHTTPClient`](#aignehttpclient)

Creates a new AIGNEClient instance.

###### Parameters

| Parameter | Type                                                | Description                                              |
| --------- | --------------------------------------------------- | -------------------------------------------------------- |
| `options` | [`AIGNEHTTPClientOptions`](#aignehttpclientoptions) | Configuration options for connecting to the AIGNE server |

###### Returns

[`AIGNEHTTPClient`](#aignehttpclient)

#### Properties

##### options

> **options**: [`AIGNEHTTPClientOptions`](#aignehttpclientoptions)

Configuration options for connecting to the AIGNE server

#### Methods

##### invoke()

###### Call Signature

> **invoke**<`I`, `O`>(`agent`, `input`, `options?`): `Promise`<`O`>

Invokes an agent in non-streaming mode and returns the complete response.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` *extends* [`Message`](../core/agents/agent.md#message) |
| `O` *extends* [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                                                           | Description                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `agent`    | `string`                                                                                       | Name of the agent to invoke                                    |
| `input`    | `string` | `I`                                                                                | Input message for the agent                                    |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & { `streaming?`: `false`; } | Options with streaming mode explicitly set to false or omitted |

###### Returns

`Promise`<`O`>

The complete agent response

###### Example

Here's a simple example of how to use AIGNEClient:

```ts
const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

###### Call Signature

> **invoke**<`I`, `O`>(`agent`, `input`, `options`): `Promise`<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)<`O`>>

Invokes an agent with streaming mode enabled and returns a stream of response chunks.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` *extends* [`Message`](../core/agents/agent.md#message) |
| `O` *extends* [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter | Type                                                                                         | Description                                        |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `agent`   | `string`                                                                                     | Name of the agent to invoke                        |
| `input`   | `string` | `I`                                                                              | Input message for the agent                        |
| `options` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) & { `streaming`: `true`; } | Options with streaming mode explicitly set to true |

###### Returns

`Promise`<[`AgentResponseStream`](../core/agents/agent.md#agentresponsestream)<`O`>>

A stream of agent response chunks

###### Example

Here's an example of how to use AIGNEClient with streaming response:

```ts
const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { $message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
}

console.log(text); // Output: "Hello world!"
```

###### Call Signature

> **invoke**<`I`, `O`>(`agent`, `input`, `options?`): `Promise`<[`AgentResponse`](../core/agents/agent.md#agentresponse)<`O`>>

Invokes an agent with the given input and options.

###### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `I` *extends* [`Message`](../core/agents/agent.md#message) |
| `O` *extends* [`Message`](../core/agents/agent.md#message) |

###### Parameters

| Parameter  | Type                                                            | Description                 |
| ---------- | --------------------------------------------------------------- | --------------------------- |
| `agent`    | `string`                                                        | Name of the agent to invoke |
| `input`    | `string` | `I`                                                 | Input message for the agent |
| `options?` | [`AIGNEHTTPClientInvokeOptions`](#aignehttpclientinvokeoptions) | Options for the invocation  |

###### Returns

`Promise`<[`AgentResponse`](../core/agents/agent.md#agentresponse)<`O`>>

Either a complete response or a response stream depending on the streaming option

## Interfaces

### AIGNEHTTPClientOptions

Configuration options for the AIGNEHTTPClient.

#### Properties

| Property               | Type     | Description                                                                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| <a id="url"></a> `url` | `string` | The URL of the AIGNE server to connect to. This should point to the base endpoint where the AIGNEServer is hosted. |

***

### AIGNEHTTPClientInvokeOptions

Options for invoking an agent through the AIGNEHTTPClient.
Extends the standard AgentInvokeOptions with client-specific options.

#### Extends

* [`AgentInvokeOptions`](../core/agents/agent.md#agentinvokeoptions)

#### Properties

| Property                                  | Type                       | Description                                                                                                                           |
| ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="fetchoptions"></a> `fetchOptions?` | `Partial`<`RequestInit`> | Additional fetch API options to customize the HTTP request. These options will be merged with the default options used by the client. |
