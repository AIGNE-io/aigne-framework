# Memory

In any advanced AI system, memory is a critical component that allows agents to retain information across interactions, learn from past experiences, and maintain context. In the AIGNE framework, memory management is orchestrated by the `MemoryAgent`, a specialized agent that uses `Recorder` and `Retriever` skills to store and recall information.

This section will cover the core concepts of memory management in AIGNE, including the roles of each component and how they work together to provide a persistent memory layer for your agents.

## How It Works

The interaction between agents and the memory system follows a clear, decoupled pattern. An agent can explicitly call the `record()` method on the `MemoryAgent` to store information. Later, it can use the `retrieve()` method to query the memory store. Alternatively, the `MemoryAgent` can be configured to automatically listen for messages on specific topics and record them, creating a seamless history of interactions.

The diagram below illustrates the flow for both recording and retrieving memories.

```d2
direction: down

AIAgent: {
  label: "AIAgent\n(e.g., Your App's Agent)"
  shape: rectangle
}

Memory-System: {
  label: "AIGNE Memory System"
  style: {
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n(Orchestrator)"
    shape: rectangle

    MemoryRecorder: {
      label: "MemoryRecorder Skill"
      shape: rectangle
    }
    MemoryRetriever: {
      label: "MemoryRetriever Skill"
      shape: rectangle
    }
  }
}

Persistent-Storage: {
  label: "Persistent Storage\n(e.g., Vector DB)"
  shape: cylinder
}

# Recording Flow
AIAgent -> Memory-System.MemoryAgent: "1. Calls record(data)"
Memory-System.MemoryAgent -> Memory-System.MemoryAgent.MemoryRecorder: "2. Delegates Record"
Memory-System.MemoryAgent.MemoryRecorder -> Persistent-Storage: "3. Writes Memory"

# Retrieval Flow
AIAgent -> Memory-System.MemoryAgent: "4. Calls retrieve(query)"
Memory-System.MemoryAgent -> Memory-System.MemoryAgent.MemoryRetriever: "5. Delegates Retrieve"
Memory-System.MemoryAgent.MemoryRetriever -> Persistent-Storage: "6. Searches Memories"
Persistent-Storage -> Memory-System.MemoryAgent.MemoryRetriever: "7. Returns Memories"
Memory-System.MemoryAgent.MemoryRetriever -> Memory-System.MemoryAgent: "8. Forwards Results"
Memory-System.MemoryAgent -> AIAgent: "9. Returns Results"
```

## The MemoryAgent

The `MemoryAgent` acts as the central hub for all memory-related operations. It doesn't store information directly but instead delegates the tasks of writing and reading memories to specialized skills. This design separates the logic of memory management from the underlying storage implementation, allowing for great flexibility. For example, you could easily swap a simple in-memory storage mechanism for a robust vector database without changing your agent's core logic.

Key responsibilities of the `MemoryAgent`:
- **Orchestration**: Manages the flow of information to and from the memory store.
- **Delegation**: Uses a `Recorder` agent to save memories and a `Retriever` agent to fetch them.
- **Automation**: Can be configured with `subscribeTopic` to automatically record conversations and agent interactions.

The `MemoryAgent` is not designed to be called directly for processing tasks like an `AIAgent`. Instead, other agents interact with it through its `record()` and `retrieve()` methods via the `Context` object.

### Configuration Options

When creating a `MemoryAgent`, you can provide the following options:

<x-field-group>
  <x-field data-name="recorder" data-type="MemoryRecorder | MemoryRecorderOptions['process'] | MemoryRecorderOptions" data-required="false" data-desc="The recorder skill. Can be an instance, a process function, or a full options object."></x-field>
  <x-field data-name="retriever" data-type="MemoryRetriever | MemoryRetrieverOptions['process'] | MemoryRetrieverOptions" data-required="false" data-desc="The retriever skill. Can be an instance, a process function, or a full options object."></x-field>
  <x-field data-name="autoUpdate" data-type="boolean" data-required="false" data-desc="If true, automatically records information after agent operations."></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="Topic(s) to subscribe to for automatic message recording."></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="A list of additional skills for the agent."></x-field>
</x-field-group>

## Core Components

The memory system is built on two primary types of specialized agents: `MemoryRecorder` and `MemoryRetriever`.

### MemoryRecorder

The `MemoryRecorder` is an agent responsible for writing information to a persistent storage layer. Its sole job is to take input content, format it into a standardized `Memory` object, and save it. You can implement a custom `MemoryRecorder` to connect to any storage backend, such as a local file system, a SQL database, or a cloud-based vector store.

**Input**

<x-field data-name="content" data-type="object[]" data-required="true">
  <x-field-desc markdown>An array of objects to be recorded. Each object can contain an `input`, `output`, and `source`.</x-field-desc>
  <x-field data-name="input" data-type="Message" data-required="false" data-desc="The input message or data."></x-field>
  <x-field data-name="output" data-type="Message" data-required="false" data-desc="The output message or data."></x-field>
  <x-field data-name="source" data-type="string" data-required="false" data-desc="The source of the memory (e.g., an agent's name)."></x-field>
</x-field>

**Output**

<x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="An array of the newly created memory objects, complete with unique IDs and timestamps."></x-field>

### MemoryRetriever

The `MemoryRetriever` is the counterpart to the recorder. It's responsible for searching and fetching memories from the storage layer based on specific criteria. A `MemoryRetriever` implementation could perform simple keyword matching, or it could leverage more sophisticated techniques like semantic search or vector similarity to find the most relevant memories.

**Input**

<x-field-group>
  <x-field data-name="search" data-type="string | Message" data-required="false" data-desc="The search term or message to filter memories by."></x-field>
  <x-field data-name="limit" data-type="number" data-required="false" data-desc="The maximum number of memories to retrieve."></x-field>
</x-field-group>

**Output**

<x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="An array of memory objects that match the query criteria."></x-field>

## The Memory Object

The `Memory` object is the standard data structure used to represent a single piece of stored information. It contains the content itself, along with metadata for identification and context.

<x-field-group>
  <x-field data-name="id" data-type="string" data-required="true" data-desc="A unique identifier for the memory entry."></x-field>
  <x-field data-name="sessionId" data-type="string | null" data-required="false" data-desc="An optional identifier to group memories from the same session or conversation."></x-field>
  <x-field data-name="content" data-type="unknown" data-required="true" data-desc="The actual content that is stored."></x-field>
  <x-field data-name="createdAt" data-type="string" data-required="true" data-desc="The ISO 8601 timestamp of when the memory was created."></x-field>
</x-field-group>

## Summary

The `MemoryAgent`, along with its `Recorder` and `Retriever` skills, provides a powerful and flexible system for managing state and history in your AI applications. By decoupling the memory management logic from the storage implementation, you can easily adapt your memory system to fit the needs of any project, from simple chatbots to complex, multi-agent workflows.

With a solid understanding of how memory works, you are now ready to explore how to construct dynamic and context-aware instructions for your agents. Continue to the [Prompts](./developer-guide-core-concepts-prompts.md) section to learn more.