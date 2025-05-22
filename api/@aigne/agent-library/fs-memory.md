# fs-memory

## Classes

### FSMemory

A memory implementation that stores and retrieves memories using the file system.
FSMemory provides persistent storage of agent memories as files in a specified directory.

#### Example

Here is an example of how to use the FSMemory class:

```ts
const model = new OpenAIChatModel();

const engine = new AIGNE({ model });

const memory = new FSMemory({ rootDir: "/PATH/TO/MEMORY_FOLDER" });

const agent = AIAgent.from({
  memory,
});

const result1 = await engine.invoke(agent, "I like blue color");

console.log(result1);
// Output: { $message: 'Great! I will remember that you like blue color.' }

const result2 = await engine.invoke(agent, "What color do I like?");

console.log(result2);
// Output: { $message: 'You like blue color.' }
```

#### Extends

- [`MemoryAgent`](../core/memory.md#memoryagent)

#### Constructors

##### Constructor

> **new FSMemory**(`options`): [`FSMemory`](#fsmemory)

Creates a new FSMemory instance.

###### Parameters

| Parameter | Type                                  |
| --------- | ------------------------------------- |
| `options` | [`FSMemoryOptions`](#fsmemoryoptions) |

###### Returns

[`FSMemory`](#fsmemory)

###### Overrides

[`MemoryAgent`](../core/memory.md#memoryagent).[`constructor`](../core/memory.md#memoryagent#constructor)

## Interfaces

### FSMemoryOptions

Configuration options for the FSMemory class.

#### Extends

- `Partial`\<[`MemoryAgentOptions`](../core/memory.md#memoryagentoptions)\>

#### Properties

| Property                                          | Type                                    | Description                                                                                                                                                                                                       |
| ------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="rootdir"></a> `rootDir`                    | `string`                                | The root directory where memory files will be stored. Can be absolute or relative path. Relative paths are resolved from the current working directory. Home directory prefix (~) will be expanded appropriately. |
| <a id="retrieveroptions"></a> `retrieverOptions?` | `Partial`\<`FSMemoryRetrieverOptions`\> | Optional configuration for the memory retriever agent. Controls how memories are retrieved from the file system.                                                                                                  |
| <a id="recorderoptions"></a> `recorderOptions?`   | `Partial`\<`FSMemoryRecorderOptions`\>  | Optional configuration for the memory recorder agent. Controls how memories are recorded to the file system.                                                                                                      |

## Variables

### MEMORY_FILE_NAME

> `const` **MEMORY_FILE_NAME**: `"memory.yaml"` = `"memory.yaml"`
