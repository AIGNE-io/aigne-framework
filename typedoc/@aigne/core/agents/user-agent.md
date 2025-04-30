[Documentation](../../../README.md) / [@aigne/core](../README.md) / agents/user-agent

# agents/user-agent

## Classes

### UserAgent\<I, O\>

Agent is the base class for all agents.
It provides a mechanism for defining input/output schemas and implementing processing logic,
serving as the foundation of the entire agent system.

By extending the Agent class and implementing the process method, you can create custom agents
with various capabilities:

- Process structured input and output data
- Validate data formats using schemas
- Communicate between agents through contexts
- Support streaming or non-streaming responses
- Maintain memory of past interactions
- Output in multiple formats (JSON/text)
- Forward tasks to other agents

#### Example

Here's an example of how to create a custom agent:

```ts
class MyAgent extends Agent {
  process(input: Message): Message {
    console.log(input);
    return {
      text: "Hello, How can I assist you today?",
    };
  }
}

const agent = new MyAgent();

const result = await agent.invoke("hello");

console.log(result); // { text: "Hello, How can I assist you today?" }
```

#### Extends

- [`Agent`](agent.md#agent)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                               |
| ------------------------------------------- | ----------------------------- | ----------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The input message type the agent accepts  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The output message type the agent returns |

#### Constructors

##### Constructor

> **new UserAgent**\<`I`, `O`\>(`options`): [`UserAgent`](#useragent)\<`I`, `O`\>

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `options` | [`UserAgentOptions`](#useragentoptions)\<`I`, `O`\> |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

###### Overrides

[`Agent`](agent.md#agent).[`constructor`](agent.md#agent#constructor)

#### Properties

| Property                               | Type                                                                                                                                                                                                                                                                                                                                                                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Overrides                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| <a id="context-1"></a> `context`       | [`Context`](../aigne.md#context)                                                                                                                                                                                                                                                                                                                                                                                                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                           |
| <a id="invoke"></a> `invoke`           | \{(`input`, `context?`, `options?`): `Promise`\<`O`\>; (`input`, `context`, `options`): `Promise`\<[`AgentResponseStream`](agent.md#agentresponsestream)\<`O`\>\>; (`input`, `context?`, `options?`): `Promise`\<[`AgentResponse`](agent.md#agentresponse)\<`O`\>\>; \}                                                                                                                                                            | Invoke the agent with regular (non-streaming) response Regular mode waits for the agent to complete processing and return the final result, suitable for scenarios where a complete result is needed at once. **Param** Input message to the agent, can be a string or structured object **Param** Execution context, providing environment and resource access **Param** Invocation options, must set streaming to false or leave unset **Example** Here's an example of invoking an agent with regular mode: `// Create a chat model const model = new OpenAIChatModel(); // AIGNE: Main execution engine of AIGNE Framework. const aigne = new AIGNE({ model, }); // Create an Agent instance const agent = AIAgent.from({ name: "chat", description: "A chat agent", }); // Invoke the agent const result = await aigne.invoke(agent, "hello"); console.log(result); // Output: { $message: "Hello, How can I assist you today?" }` | [`Agent`](agent.md#agent).[`invoke`](agent.md#agent#invoke) |
| <a id="publish"></a> `publish`         | (`topic`, `payload`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                     | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                           |
| <a id="subscribe"></a> `subscribe`     | \{(`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\>; (`topic`, `listener`): [`Unsubscribe`](../aigne.md#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\> \| [`Unsubscribe`](../aigne.md#unsubscribe-4); (`topic`, `listener?`): `Promise`\<[`MessagePayload`](../aigne.md#messagepayload)\> \| [`Unsubscribe`](../aigne.md#unsubscribe-4); \} | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                           |
| <a id="unsubscribe"></a> `unsubscribe` | (`topic`, `listener`) => `void`                                                                                                                                                                                                                                                                                                                                                                                                    | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                                                           |

#### Accessors

##### stream

###### Get Signature

> **get** **stream**(): `ReadableStream`\<[`MessagePayload`](../aigne.md#messagepayload) & \{ `topic`: `string`; \}\>

###### Returns

`ReadableStream`\<[`MessagePayload`](../aigne.md#messagepayload) & \{ `topic`: `string`; \}\>

#### Methods

##### from()

> `static` **from**\<`I`, `O`\>(`options`): [`UserAgent`](#useragent)\<`I`, `O`\>

###### Type Parameters

| Type Parameter                              |
| ------------------------------------------- |
| `I` _extends_ [`Message`](agent.md#message) |
| `O` _extends_ [`Message`](agent.md#message) |

###### Parameters

| Parameter | Type                                                |
| --------- | --------------------------------------------------- |
| `options` | [`UserAgentOptions`](#useragentoptions)\<`I`, `O`\> |

###### Returns

[`UserAgent`](#useragent)\<`I`, `O`\>

##### process()

> **process**(`input`, `context`): `Promise`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

Core processing method of the agent, must be implemented in subclasses

This is the main functionality implementation of the agent, processing input and
generating output. Can return various types of results:

- Regular object response
- Streaming response
- Async generator
- Another agent instance (transfer agent)

###### Parameters

| Parameter | Type                             | Description       |
| --------- | -------------------------------- | ----------------- |
| `input`   | `I`                              | Input message     |
| `context` | [`Context`](../aigne.md#context) | Execution context |

###### Returns

`Promise`\<[`AgentProcessResult`](agent.md#agentprocessresult)\<`O`\>\>

Processing result

###### Examples

Example of returning a direct object:

```ts
class DirectResponseAgent extends Agent {
  process(input: Message): Message {
    // Process input and return a direct object response
    return {
      text: `Hello, I received your message: ${JSON.stringify(input)}`,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
  }
}

const agent = new DirectResponseAgent();

const result = await agent.invoke({ message: "Hello" });

console.log(result); // { text: "Hello, I received your message: { message: 'Hello' }", confidence: 0.95, timestamp: "2023-10-01T12:00:00Z" }
```

Example of returning a streaming response:

```ts
class StreamResponseAgent extends Agent {
  process(_input: Message): AgentResponseStream<Message> {
    // Return a ReadableStream as a streaming response
    return new ReadableStream({
      start(controller) {
        controller.enqueue(textDelta({ text: "Hello" }));
        controller.enqueue(textDelta({ text: ", " }));
        controller.enqueue(textDelta({ text: "This" }));
        controller.enqueue(textDelta({ text: " is" }));
        controller.enqueue(textDelta({ text: "..." }));
        controller.close();
      },
    });
  }
}

const agent = new StreamResponseAgent();

const stream = await agent.invoke("Hello", undefined, { streaming: true });

let fullText = "";

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.text;
  if (text) fullText += text;
}

console.log(fullText); // Output: "Hello, This is..."
```

Example of using an async generator:

```ts
class AsyncGeneratorAgent extends Agent {
  async *process(
    _input: Message,
    _context: Context,
  ): AgentProcessAsyncGenerator<Message> {
    // Use async generator to produce streaming results
    yield textDelta({ message: "This" });
    yield textDelta({ message: "," });
    yield textDelta({ message: " " });
    yield textDelta({ message: "This" });
    yield textDelta({ message: " " });
    yield textDelta({ message: "is" });
    yield textDelta({ message: "..." });
    // Optional return a JSON object at the end
    return { time: new Date().toISOString() };
  }
}

const agent = new AsyncGeneratorAgent();

const stream = await agent.invoke("Hello", undefined, { streaming: true });

const message: string[] = [];

let json: Message | undefined;

for await (const chunk of readableStreamToAsyncIterator(stream)) {
  const text = chunk.delta.text?.message;
  if (text) message.push(text);
  if (chunk.delta.json) json = chunk.delta.json;
}

console.log(message); // Output: ["This", ",", " ", "This", " ", "is", "..."]

console.log(json); // Output: { time: "2023-10-01T12:00:00Z" }
```

Example of transfer to another agent:

```ts
class SpecialistAgent extends Agent {
  process(_input: Message): Message {
    return {
      response: "This is a specialist response",
      expertise: "technical",
    };
  }
}

class MainAgent extends Agent {
  process(_input: Message): Agent {
    // Create a specialized agent for handling technical issues
    return new SpecialistAgent();
  }
}

const aigne = new AIGNE({});

const mainAgent = new MainAgent();

const result = await aigne.invoke(mainAgent, "technical question");

console.log(result); // { response: "This is a specialist response", expertise: "technical" }
```

###### Overrides

[`Agent`](agent.md#agent).[`process`](agent.md#agent#process)

##### checkAgentInvokesUsage()

> `protected` **checkAgentInvokesUsage**(`_context`): `void`

Check agent invocation usage to prevent exceeding limits

If the context has a maximum invocation limit set, checks if the limit
has been exceeded and increments the invocation counter

###### Parameters

| Parameter  | Type                             |
| ---------- | -------------------------------- |
| `_context` | [`Context`](../aigne.md#context) |

###### Returns

`void`

###### Throws

Error if maximum invocation limit is exceeded

###### Overrides

[`Agent`](agent.md#agent).[`checkAgentInvokesUsage`](agent.md#agent#checkagentinvokesusage)

## Interfaces

### UserAgentOptions\<I, O\>

Configuration options for an agent

#### Extends

- [`AgentOptions`](agent.md#agentoptions)\<`I`, `O`\>

#### Type Parameters

| Type Parameter                              | Default type                  | Description                   |
| ------------------------------------------- | ----------------------------- | ----------------------------- |
| `I` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent input message type  |
| `O` _extends_ [`Message`](agent.md#message) | [`Message`](agent.md#message) | The agent output message type |

#### Properties

| Property                                | Type                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| <a id="context"></a> `context`          | [`Context`](../aigne.md#context)                                                          |
| <a id="process"></a> `process?`         | [`FunctionAgentFn`](agent.md#functionagentfn)\<`I`, `O`\>                                 |
| <a id="activeagent"></a> `activeAgent?` | [`Agent`](agent.md#agent)\<[`Message`](agent.md#message), [`Message`](agent.md#message)\> |
