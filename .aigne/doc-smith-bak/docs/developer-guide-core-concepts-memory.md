# Memory

The `MemoryAgent` provides a mechanism for agents to maintain state and remember information across interactions. It acts as a specialized orchestrator that does not process messages directly but manages memory operations through two key components: a `Recorder` for storing information and a `Retriever` for recalling it. This separation of concerns allows for flexible and pluggable memory storage solutions.

## Core Components

The memory system is comprised of three main classes:

1.  **`MemoryAgent`**: The central agent that manages memory operations. It is configured with a recorder and a retriever and provides `record()` and `retrieve()` methods to interact with the memory store.
2.  **`MemoryRecorder`**: An agent responsible for writing information to a persistent storage backend (e.g., a database, file system, or vector store). You must provide the implementation for how and where the data is stored.
3.  **`MemoryRetriever`**: An agent responsible for fetching information from the storage backend based on specified criteria, such as a search query or a limit. You must provide the implementation for the retrieval logic.

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Memory](assets/diagram/memory-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## How It Works

The `MemoryAgent` delegates tasks to its subordinate agents. When you call the `record()` method on a `MemoryAgent`, it invokes its configured `MemoryRecorder` to persist the data. Similarly, when you call `retrieve()`, it invokes the `MemoryRetriever` to query and return the stored information.

This architecture allows developers to define custom storage and retrieval logic without altering the core agent workflows. For example, you can implement a recorder that saves conversation history to a PostgreSQL database and a retriever that uses vector embeddings to find semantically similar past interactions.

## `MemoryAgent`

The `MemoryAgent` is the primary interface for memory management. It is not designed to be called directly within a chain of processing agents but rather as a stateful service available to other agents or your application logic.

### Configuration

To create a `MemoryAgent`, you provide it with a `recorder` and a `retriever`. These can be instances of `MemoryRecorder` and `MemoryRetriever` or function definitions for their respective `process` methods.

```typescript Agent Initialization icon=logos:typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@aigne/core";
import { v7 as uuidv7 } from "@aigne/uuid";

// 1. Define a simple in-memory store for demonstration
const memoryStore: Map<string, any> = new Map();

// 2. Implement the recorder logic
const recorder = new MemoryRecorder({
  async process({ content }) {
    const memories = content.map((item) => {
      const memory = {
        id: uuidv7(),
        content: item,
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(memory.id, memory);
      return memory;
    });
    return { memories };
  },
});

// 3. Implement the retriever logic
const retriever = new MemoryRetriever({
  async process({ search, limit = 10 }) {
    // This is a simplistic search. A real implementation might use a database query or vector search.
    const allMemories = Array.from(memoryStore.values());
    const filteredMemories = search
      ? allMemories.filter((m) => JSON.stringify(m.content).includes(search as string))
      : allMemories;

    return { memories: filteredMemories.slice(0, limit) };
  },
});

// 4. Instantiate the MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder,
  retriever,
});
```

The example above demonstrates creating a `MemoryAgent` with a simple in-memory storage mechanism. In a production environment, you would replace this with a more robust solution like a database.

### `MemoryAgentOptions`

<x-field-group>
  <x-field data-name="recorder" data-type="MemoryRecorder | MemoryRecorderOptions['process'] | MemoryRecorderOptions" data-required="false">
    <x-field-desc markdown>The agent or function responsible for storing memories. It can be a full `MemoryRecorder` instance, a configuration object, or just the processing function.</x-field-desc>
  </x-field>
  <x-field data-name="retriever" data-type="MemoryRetriever | MemoryRetrieverOptions['process'] | MemoryRetrieverOptions" data-required="false">
    <x-field-desc markdown>The agent or function responsible for retrieving memories. It can be a full `MemoryRetriever` instance, a configuration object, or just the processing function.</x-field-desc>
  </x-field>
  <x-field data-name="autoUpdate" data-type="boolean" data-required="false">
    <x-field-desc markdown>If `true`, the agent will automatically record information after completing operations to create a history of interactions.</x-field-desc>
  </x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="The topic(s) to subscribe to for automatic message recording."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="An array of other agents to be available as skills. The recorder and retriever are automatically added to this list."></x-field>
</x-field-group>

## `MemoryRecorder`

The `MemoryRecorder` is an abstract agent class that defines the contract for storing memories. You must provide a concrete implementation of its `process` method.

### `MemoryRecorderInput`

The `process` method of a `MemoryRecorder` receives a `MemoryRecorderInput` object.

<x-field-group>
  <x-field data-name="content" data-type="array" data-required="true">
    <x-field-desc markdown>An array of objects to be stored as memories. Each object can contain an `input`, `output`, and `source` to contextualize the memory.</x-field-desc>
    <x-field data-name="input" data-type="Message" data-required="false" data-desc="The input message that led to this memory (e.g., a user's prompt)."></x-field>
    <x-field data-name="output" data-type="Message" data-required="false" data-desc="The output message generated (e.g., an AI's response)."></x-field>
    <x-field data-name="source" data-type="string" data-required="false" data-desc="The identifier of the agent or system that produced the output."></x-field>
  </x-field>
</x-field-group>

### `MemoryRecorderOutput`

The `process` method must return a `MemoryRecorderOutput` object.

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="An array of the newly created memory objects, each including its unique ID, the original content, and a creation timestamp."></x-field>
</x-field-group>

## `MemoryRetriever`

The `MemoryRetriever` is an abstract agent class that defines the contract for fetching memories from storage. You must provide a concrete implementation of its `process` method.

### `MemoryRetrieverInput`

The `process` method of a `MemoryRetriever` receives a `MemoryRetrieverInput` object to filter and limit the results.

<x-field-group>
  <x-field data-name="limit" data-type="number" data-required="false">
    <x-field-desc markdown>The maximum number of memories to return. Useful for pagination or keeping context windows small.</x-field-desc>
  </x-field>
  <x-field data-name="search" data-type="string | Message" data-required="false">
    <x-field-desc markdown>A search term or message object to filter memories. The implementation determines how this value is used (e.g., keyword search, vector similarity).</x-field-desc>
  </x-field>
</x-field-group>

### `MemoryRetrieverOutput`

The `process` method must return a `MemoryRetrieverOutput` object.

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="An array of the memory objects that matched the retrieval criteria."></x-field>
</x-field-group>

## Usage Example

Once the `MemoryAgent` is configured, you can use it within your application's context to record and retrieve information.

```typescript AIGNE Interaction icon=logos:typescript
import { AIGNE } from "@aigne/core";

// Assuming memoryAgent is configured as shown in the first example
const aigne = new AIGNE({
  // ...other configurations
});

async function run() {
  // Record a new memory
  const recordedMemory = await aigne.invoke(memoryAgent.record.bind(memoryAgent), {
    content: [{ input: { query: "What is the capital of France?" } }],
  });
  console.log("Recorded:", recordedMemory.memories[0].id);

  // Retrieve memories
  const retrievedMemories = await aigne.invoke(memoryAgent.retrieve.bind(memoryAgent), {
    search: "France",
    limit: 5,
  });
  console.log("Retrieved:", retrievedMemories.memories);
}

run();
```
This example shows how to use the `aigne.invoke` method to call the `record` and `retrieve` functions on the `memoryAgent` instance, effectively managing the agent's state across interactions.

## Summary

The `MemoryAgent` provides a powerful and flexible abstraction for managing state in agentic applications. By separating the orchestration (`MemoryAgent`) from the implementation details (`MemoryRecorder`, `MemoryRetriever`), you can easily integrate various storage backends, from simple in-memory arrays to sophisticated vector databases.

For more information on the core execution engine, see the [AIGNE](./developer-guide-core-concepts-aigne-engine.md) documentation. To understand the fundamental building block of work, refer to the [Agents](./developer-guide-core-concepts-agents.md) page.
