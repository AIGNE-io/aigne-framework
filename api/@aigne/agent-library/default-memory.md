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

| Property                        | Type                                             |
| ------------------------------- | ------------------------------------------------ |
| <a id="storage"></a> `storage?` | `MemoryStorage` \| `DefaultMemoryStorageOptions` |
