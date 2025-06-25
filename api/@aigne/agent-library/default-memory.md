# default-memory

## Classes

### DefaultMemory

A specialized agent responsible for managing, storing, and retrieving memories within the agent system.

MemoryAgent serves as a bridge between application logic and memory storage/retrieval mechanisms.
It delegates the actual memory operations to specialized recorder and retriever agents that
are attached as skills. This agent doesn't directly process messages like other agents but
instead provides memory management capabilities to the system.

#### Extends

- [`MemoryAgent`](../core/memory.md#memoryagent)

#### Indexable

\[`key`: `symbol`\]: () => `string` \| () => `Promise`\<`void`\>

#### Constructors

##### Constructor

> **new DefaultMemory**(`options`): [`DefaultMemory`](#defaultmemory)

###### Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `options` | [`DefaultMemoryOptions`](#defaultmemoryoptions) |

###### Returns

[`DefaultMemory`](#defaultmemory)

###### Overrides

[`MemoryAgent`](../core/memory.md#memoryagent).[`constructor`](../core/memory.md#memoryagent#constructor)

#### Properties

##### storage

> **storage**: `MemoryStorage`

## Interfaces

### DefaultMemoryOptions

#### Extends

- `Partial`\<[`MemoryAgentOptions`](../core/memory.md#memoryagentoptions)\>

#### Properties

| Property                                          | Type                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| <a id="storage"></a> `storage?`                   | `MemoryStorage` \| `DefaultMemoryStorageOptions`                                         |
| <a id="recorderoptions"></a> `recorderOptions?`   | `Omit`\<[`DefaultMemoryRecorderOptions`](#defaultmemoryrecorderoptions), `"storage"`\>   |
| <a id="retrieveroptions"></a> `retrieverOptions?` | `Omit`\<[`DefaultMemoryRetrieverOptions`](#defaultmemoryretrieveroptions), `"storage"`\> |
| <a id="messagekey"></a> `messageKey?`             | `string` \| `string`[]                                                                   |

---

### DefaultMemoryRetrieverOptions

Configuration options for an agent

#### Extends

- [`AgentOptions`](../core/agents/agent.md#agentoptions)\<[`MemoryRetrieverInput`](../core/memory.md#memoryretrieverinput), [`MemoryRetrieverOutput`](../core/memory.md#memoryretrieveroutput)\>

#### Properties

| Property                                                              | Type                                  |
| --------------------------------------------------------------------- | ------------------------------------- |
| <a id="storage-2"></a> `storage`                                      | `MemoryStorage`                       |
| <a id="defaultretrievememorycount"></a> `defaultRetrieveMemoryCount?` | `number`                              |
| <a id="retrievefrommessagekey"></a> `retrieveFromMessageKey?`         | `string` \| `string`[]                |
| <a id="getsearchpattern"></a> `getSearchPattern?`                     | (`search`) => `undefined` \| `string` |
| <a id="formatmessage"></a> `formatMessage?`                           | (`content`) => `unknown`              |
| <a id="formatmemory"></a> `formatMemory?`                             | (`content`) => `unknown`              |

---

### DefaultMemoryRecorderOptions

Configuration options for an agent

#### Extends

- [`AgentOptions`](../core/agents/agent.md#agentoptions)\<[`MemoryRecorderInput`](../core/memory.md#memoryrecorderinput), [`MemoryRecorderOutput`](../core/memory.md#memoryrecorderoutput)\>

#### Properties

| Property                                                      | Type                   |
| ------------------------------------------------------------- | ---------------------- |
| <a id="storage-3"></a> `storage`                              | `MemoryStorage`        |
| <a id="rememberfrommessagekey"></a> `rememberFromMessageKey?` | `string` \| `string`[] |
