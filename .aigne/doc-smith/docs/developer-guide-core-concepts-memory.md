# Memory Management

The Memory module provides a robust framework for enabling agents to persist and recall information, creating a stateful and context-aware system. This allows agents to maintain a history of interactions, learn from past events, and make more informed decisions.

At the heart of the memory system is the `MemoryAgent`, which acts as a central coordinator for all memory-related operations. It delegates the actual tasks of writing and reading memories to two specialized components: the `MemoryRecorder` and the `MemoryRetriever`. This separation of concerns allows for flexible and scalable memory solutions.

- **MemoryAgent**: The main entry point for memory operations. It orchestrates the recording and retrieval processes.
- **MemoryRecorder**: An agent skill responsible for writing or storing memories to a persistent backend (e.g., a database, file system, or in-memory store).
- **MemoryRetriever**: An agent skill responsible for querying and fetching memories from the storage backend.

This guide will walk you through each component, explaining their roles and providing practical examples of how to implement and use them in your agent system.

## Architecture Overview

The diagram below illustrates the relationship between the core memory components. The application logic interacts with the `MemoryAgent`, which in turn uses the `MemoryRecorder` and `MemoryRetriever` skills to interact with a persistent storage backend.

```d2
direction: down

Agent-System: {
  label: "Agent System\n(Application)"
  shape: rectangle
}

Memory-Module: {
  label: "Memory Module"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n(Coordinator)"
  }

  MemoryRecorder: {
    label: "MemoryRecorder\n(Agent Skill)"
  }

  MemoryRetriever: {
    label: "MemoryRetriever\n(Agent Skill)"
  }
}

Persistent-Backend: {
  label: "Persistent Backend\n(DB, Filesystem, etc.)"
  shape: cylinder
}

Agent-System -> Memory-Module.MemoryAgent: "1. record() / retrieve()"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRecorder: "2a. Delegates Write"
Memory-Module.MemoryRecorder -> Persistent-Backend: "3a. Stores memories"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRetriever: "2b. Delegates Read"
Memory-Module.MemoryRetriever -> Persistent-Backend: "3b. Queries memories"
Persistent-Backend -> Memory-Module.MemoryRetriever: "4b. Returns memories"
```

## Core Components

### MemoryAgent

The `MemoryAgent` is a specialized agent that serves as the primary interface for managing, storing, and retrieving memories. It is not designed to be called directly for message processing like other agents; instead, it provides the core `record()` and `retrieve()` methods to interact with the system's memory.

You configure a `MemoryAgent` by providing it with a `recorder` and a `retriever`. These can be pre-built instances or custom functions that define your specific storage logic.

**Key Features:**

- **Centralized Management**: Acts as a single point of contact for memory operations.
- **Delegation**: Offloads storage and retrieval logic to dedicated `MemoryRecorder` and `MemoryRetriever` agents.
- **Automatic Recording**: Can be configured with `autoUpdate` to automatically record all messages it observes, creating a seamless history of interactions.

**Example: Creating a MemoryAgent**

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Agent, type AgentInvokeOptions, type Message } from "@core/agents";

// Define custom logic for recording and retrieving memories
const myRecorder = new MemoryRecorder({
  process: async (input, options) => {
    // Custom logic to save memories to a database
    console.log("Recording memories:", input.content);
    // ... implementation ...
    return { memories: [] }; // Return the created memories
  },
});

const myRetriever = new MemoryRetriever({
  process: async (input, options) => {
    // Custom logic to fetch memories from a database
    console.log("Retrieving memories with search:", input.search);
    // ... implementation ...
    return { memories: [] }; // Return the found memories
  },
});

// Create the MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: myRecorder,
  retriever: myRetriever,
  autoUpdate: true, // Automatically record messages from subscribed topics
  subscribeTopic: "user-input",
});
```

### MemoryRecorder

The `MemoryRecorder` is an abstract agent class responsible for storing memories. To use it, you must provide a concrete implementation of the `process` method, which contains the logic for how and where to persist the memory data. This design allows you to connect to any storage backend, from a simple in-memory array to a sophisticated vector database.

**Input (`MemoryRecorderInput`)**

The `process` function receives an input object containing a `content` array. Each item in the array represents a piece of information to be stored, which can be an `input` message, an `output` message, and the `source` agent's ID.

```typescript
interface MemoryRecorderInput extends Message {
  content: {
    input?: Message;
    output?: Message;
    source?: string;
  }[];
}
```

**Output (`MemoryRecorderOutput`)**

The function should return a promise that resolves to an object containing an array of the `memories` that were successfully created.

```typescript
interface MemoryRecorderOutput extends Message {
  memories: Memory[];
}
```

**Example: Implementing a Simple In-Memory Recorder**

Here’s how you can create a simple recorder that stores memories in a local array.

```typescript
import {
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  type Memory,
  newMemoryId,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// Use a simple in-memory array as our database
const memoryDB: Memory[] = [];

const inMemoryRecorder = new MemoryRecorder({
  process: async (
    input: MemoryRecorderInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRecorderOutput>> => {
    const newMemories: Memory[] = input.content.map((item) => ({
      id: newMemoryId(),
      content: item,
      createdAt: new Date().toISOString(),
    }));

    // Add new memories to our "database"
    memoryDB.push(...newMemories);
    console.log("Current memory count:", memoryDB.length);

    return { memories: newMemories };
  },
});
```

### MemoryRetriever

The `MemoryRetriever` is the counterpart to the recorder. It's an abstract agent class responsible for fetching memories from storage. Like the recorder, it requires a custom implementation of the `process` method to define the retrieval logic.

**Input (`MemoryRetrieverInput`)**

The `process` function receives an input object that can include a `search` query and a `limit` to control the number of results. The implementation determines how the search is performed (e.g., keyword matching, vector similarity).

```typescript
interface MemoryRetrieverInput extends Message {
  limit?: number;
  search?: string | Message;
}
```

**Output (`MemoryRetrieverOutput`)**

The function should return a promise that resolves to an object containing an array of the `memories` that match the query.

```typescript
interface MemoryRetrieverOutput extends Message {
  memories: Memory[];
}
```

**Example: Implementing a Simple In-Memory Retriever**

This retriever works with the `inMemoryRecorder` example above, searching the local array for matching content.

```typescript
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  type Memory,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// Assume memoryDB is the same array used by the recorder
declare const memoryDB: Memory[];

const inMemoryRetriever = new MemoryRetriever({
  process: async (
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRetrieverOutput>> => {
    let results: Memory[] = [...memoryDB];

    // Filter results based on the search query
    if (input.search && typeof input.search === "string") {
      const searchTerm = input.search.toLowerCase();
      results = results.filter((mem) =>
        JSON.stringify(mem.content).toLowerCase().includes(searchTerm)
      );
    }

    // Apply the limit
    if (input.limit) {
      results = results.slice(-input.limit); // Get the most recent items
    }

    return { memories: results };
  },
});
```

## Putting It All Together

Now, let's combine these components to create a fully functional memory system. We'll instantiate the `MemoryAgent` with our custom in-memory recorder and retriever, and then use it to record and retrieve information.

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Aigne, type Context } from "@core/aigne";

// --- Assume inMemoryRecorder and inMemoryRetriever are defined as above ---

// 1. Initialize the MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: inMemoryRecorder,
  retriever: inMemoryRetriever,
});

// 2. Create a context to run the agent
const context = new Aigne().createContext();

// 3. Record a new memory
async function runMemoryExample(context: Context) {
  console.log("Recording a new memory...");
  await memoryAgent.record(
    {
      content: [
        {
          input: { text: "What is the capital of France?" },
          output: { text: "The capital of France is Paris." },
          source: "GeographyAgent",
        },
      ],
    },
    context
  );

  // 4. Retrieve memories
  console.log("\nRetrieving memories about 'France'...");
  const retrieved = await memoryAgent.retrieve({ search: "France" }, context);

  console.log("Found memories:", retrieved.memories);
}

runMemoryExample(context);

/**
 * Expected Output:
 *
 * Recording a new memory...
 * Current memory count: 1
 *
 * Retrieving memories about 'France'...
 * Found memories: [
 *   {
 *     id: '...',
 *     content: {
 *       input: { text: 'What is the capital of France?' },
 *       output: { text: 'The capital of France is Paris.' },
 *       source: 'GeographyAgent'
 *     },
 *     createdAt: '...'
 *   }
 * ]
 */
```

This complete example demonstrates the end-to-end flow: defining custom storage logic, plugging it into the `MemoryAgent`, and using the agent to manage the system's memory.