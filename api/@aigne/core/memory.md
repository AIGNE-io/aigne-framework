[Documentation](../../README.md) / [@aigne/core](README.md) / memory

# memory

## Classes

### MemoryAgent

A specialized agent responsible for managing, storing, and retrieving memories within the agent system.

MemoryAgent serves as a bridge between application logic and memory storage/retrieval mechanisms.
It delegates the actual memory operations to specialized recorder and retriever agents that
are attached as skills. This agent doesn't directly process messages like other agents but
instead provides memory management capabilities to the system.

#### Extends

* [`Agent`](agents/agent.md#agent)

#### Extended by

* [`FSMemory`](../agent-library/fs-memory.md#fsmemory)

#### Constructors

##### Constructor

> **new MemoryAgent**(`options`): [`MemoryAgent`](#memoryagent)

Creates a new MemoryAgent instance.

###### Parameters

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `options` | [`MemoryAgentOptions`](#memoryagentoptions) |

###### Returns

[`MemoryAgent`](#memoryagent)

###### Overrides

[`Agent`](agents/agent.md#agent).[`constructor`](agents/agent.md#agent#constructor)

#### Properties

##### autoUpdate?

> `optional` **autoUpdate**: `boolean`

Controls whether to automatically update the memory when agent call completes.

When true, the agent will automatically record any relevant information
after completing operations, creating a history of interactions.

#### Accessors

##### retriever

###### Get Signature

> **get** **retriever**(): `undefined` | [`MemoryRetriever`](#memoryretriever)

Agent used for retrieving memories from storage.

This retriever is automatically added to the agent's skills when set.
Setting a new retriever will remove any previously set retriever from skills.

###### Returns

`undefined` | [`MemoryRetriever`](#memoryretriever)

###### Set Signature

> **set** **retriever**(`value`): `void`

###### Parameters

| Parameter | Type                                                 |
| --------- | ---------------------------------------------------- |
| `value`   | `undefined` | [`MemoryRetriever`](#memoryretriever) |

###### Returns

`void`

##### recorder

###### Get Signature

> **get** **recorder**(): `undefined` | [`MemoryRecorder`](#memoryrecorder)

Agent used for recording and storing new memories.

This recorder is automatically added to the agent's skills when set.
Setting a new recorder will remove any previously set recorder from skills.

###### Returns

`undefined` | [`MemoryRecorder`](#memoryrecorder)

###### Set Signature

> **set** **recorder**(`value`): `void`

###### Parameters

| Parameter | Type                                               |
| --------- | -------------------------------------------------- |
| `value`   | `undefined` | [`MemoryRecorder`](#memoryrecorder) |

###### Returns

`void`

##### isCallable

###### Get Signature

> **get** **isCallable**(): `boolean`

Indicates whether this agent can be directly called.

MemoryAgent is designed to be used as a supporting component rather than
being directly invoked for processing, so this returns false.

###### Returns

`boolean`

#### Methods

##### process()

> **process**(`_input`, `_context`): `Promise`<[`Message`](agents/agent.md#message)>

The standard message processing method required by the Agent interface.

MemoryAgent doesn't directly process messages like other agents, so this method
throws an error when called. Use the specialized retrieve() and record() methods instead.

###### Parameters

| Parameter  | Type                                 |
| ---------- | ------------------------------------ |
| `_input`   | [`Message`](agents/agent.md#message) |
| `_context` | `Context`                            |

###### Returns

`Promise`<[`Message`](agents/agent.md#message)>

###### Overrides

[`Agent`](agents/agent.md#agent).[`process`](agents/agent.md#agent#process)

##### retrieve()

> **retrieve**(`input`, `context`): `Promise`<[`MemoryRetrieverOutput`](#memoryretrieveroutput)>

Retrieves memories based on the provided input criteria.

Delegates the actual retrieval operation to the configured retriever agent.

###### Parameters

| Parameter | Type                                            | Description                                                       |
| --------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| `input`   | [`MemoryRetrieverInput`](#memoryretrieverinput) | The retrieval parameters (can include search terms, limits, etc.) |
| `context` | `Context`                                       | The execution context                                             |

###### Returns

`Promise`<[`MemoryRetrieverOutput`](#memoryretrieveroutput)>

A promise resolving to the retrieved memories

###### Throws

Error - If no retriever has been initialized

##### record()

> **record**(`input`, `context`): `Promise`<[`MemoryRecorderOutput`](#memoryrecorderoutput)>

Records new memories based on the provided input content.

Delegates the actual recording operation to the configured recorder agent.

###### Parameters

| Parameter | Type                                          | Description                            |
| --------- | --------------------------------------------- | -------------------------------------- |
| `input`   | [`MemoryRecorderInput`](#memoryrecorderinput) | The content to be recorded as memories |
| `context` | `Context`                                     | The execution context                  |

###### Returns

`Promise`<[`MemoryRecorderOutput`](#memoryrecorderoutput)>

A promise resolving to the recorded memories

###### Throws

Error - If no recorder has been initialized

##### onMessage()

> **onMessage**(`__namedParameters`): `Promise`<`void`>

###### Parameters

| Parameter           | Type             |
| ------------------- | ---------------- |
| `__namedParameters` | `MessagePayload` |

###### Returns

`Promise`<`void`>

###### Overrides

[`Agent`](agents/agent.md#agent).[`onMessage`](agents/agent.md#agent#onmessage)

***

### `abstract` MemoryRecorder

Abstract base class for agents that record and store memories.

The MemoryRecorder serves as a foundation for implementing specific memory storage
mechanisms. Implementations of this class are responsible for:

1. Converting input content into standardized memory objects
2. Assigning unique IDs to new memories
3. Storing memories in an appropriate backend (database, file system, etc.)
4. Ensuring proper timestamping of memories

Custom implementations should extend this class and provide concrete
implementations of the process method to handle the actual storage logic.

#### Extends

* [`Agent`](agents/agent.md#agent)<[`MemoryRecorderInput`](#memoryrecorderinput), [`MemoryRecorderOutput`](#memoryrecorderoutput)>

#### Constructors

##### Constructor

> **new MemoryRecorder**(`options`): [`MemoryRecorder`](#memoryrecorder)

Creates a new MemoryRecorder instance with predefined input and output schemas.

###### Parameters

| Parameter | Type                                                                                                                                                                                            | Description                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `options` | `Omit`<[`AgentOptions`](agents/agent.md#agentoptions)<[`MemoryRecorderInput`](#memoryrecorderinput), [`MemoryRecorderOutput`](#memoryrecorderoutput)>, `"inputSchema"` | `"outputSchema"`> | Configuration options for the memory recorder agent |

###### Returns

[`MemoryRecorder`](#memoryrecorder)

###### Overrides

[`Agent`](agents/agent.md#agent).[`constructor`](agents/agent.md#agent#constructor)

***

### `abstract` MemoryRetriever

Abstract base class for agents that retrieve memories from storage.

The MemoryRetriever serves as a foundation for implementing specific memory
retrieval mechanisms. Implementations of this class are responsible for:

1. Querying a memory storage backend to find relevant memories
2. Filtering memories based on search criteria
3. Limiting the number of results returned
4. Potentially implementing sorting, ranking, or relevance-based retrieval

Custom implementations should extend this class and provide concrete
implementations of the process method to handle the actual retrieval logic.

#### Extends

* [`Agent`](agents/agent.md#agent)<[`MemoryRetrieverInput`](#memoryretrieverinput), [`MemoryRetrieverOutput`](#memoryretrieveroutput)>

#### Constructors

##### Constructor

> **new MemoryRetriever**(`options`): [`MemoryRetriever`](#memoryretriever)

Creates a new MemoryRetriever instance with predefined input and output schemas.

###### Parameters

| Parameter | Type                                                                                                                                                                                                | Description                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `options` | `Omit`<[`AgentOptions`](agents/agent.md#agentoptions)<[`MemoryRetrieverInput`](#memoryretrieverinput), [`MemoryRetrieverOutput`](#memoryretrieveroutput)>, `"inputSchema"` | `"outputSchema"`> | Configuration options for the memory retriever agent |

###### Returns

[`MemoryRetriever`](#memoryretriever)

###### Overrides

[`Agent`](agents/agent.md#agent).[`constructor`](agents/agent.md#agent#constructor)

## Interfaces

### Memory

#### Properties

| Property                           | Type      |
| ---------------------------------- | --------- |
| <a id="id"></a> `id`               | `string`  |
| <a id="content"></a> `content`     | `unknown` |
| <a id="createdat"></a> `createdAt` | `string`  |

***

### MemoryAgentOptions

#### Extends

* `Partial`<`Pick`<[`MemoryAgent`](#memoryagent), `"recorder"` | `"retriever"` | `"autoUpdate"`>>.`Pick`<[`AgentOptions`](agents/agent.md#agentoptions), `"subscribeTopic"` | `"skills"`>

***

### MemoryRecorderInput

Input for memory recording operations.

This interface represents the data needed to record new memories
in the system. The content array can contain any type of data that
should be stored as memories.

#### Extends

* [`Message`](agents/agent.md#message)

#### Indexable

\[`key`: `string`]: `unknown`

#### Properties

| Property                         | Type        | Description                                                                                                                     |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <a id="content-1"></a> `content` | `unknown`\[] | Array of content items to record as memories. Each item in this array will typically be converted into a separate memory entry. |

***

### MemoryRecorderOutput

Output from memory recording operations.

This interface represents the result of recording new memories,
including the newly created memory objects with their IDs and timestamps.

#### Extends

* [`Message`](agents/agent.md#message)

#### Indexable

\[`key`: `string`]: `unknown`

#### Properties

| Property                         | Type                  | Description                                                                                                            |
| -------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| <a id="memories"></a> `memories` | [`Memory`](#memory)\[] | Array of newly created memory objects. Each memory includes a unique ID, the stored content, and a creation timestamp. |

***

### MemoryRetrieverInput

Input for memory retrieval operations.

This interface defines the parameters that can be used to query and filter
memories when retrieving them from storage.

#### Extends

* [`Message`](agents/agent.md#message)

#### Indexable

\[`key`: `string`]: `unknown`

#### Properties

| Property                      | Type     | Description                                                                                                        |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| <a id="limit"></a> `limit?`   | `number` | Maximum number of memories to retrieve. Used for pagination or limiting result set size.                           |
| <a id="search"></a> `search?` | `string` | Search term to filter memories by. How the search is implemented depends on the specific retriever implementation. |

***

### MemoryRetrieverOutput

Output from memory retrieval operations.

This interface represents the result of retrieving memories from storage,
containing an array of memory objects that match the query criteria.

#### Extends

* [`Message`](agents/agent.md#message)

#### Indexable

\[`key`: `string`]: `unknown`

#### Properties

| Property                           | Type                  | Description                                                                                      |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| <a id="memories-1"></a> `memories` | [`Memory`](#memory)\[] | Array of retrieved memory objects. Each memory includes its ID, content, and creation timestamp. |

## Functions

### newMemoryId()

> **newMemoryId**(): `string`

#### Returns

`string`
