# AFS - Agentic File System

**AFS (Agentic File System)** is a virtual file system abstraction layer that provides a unified, file-system-like interface for AI agents to access various types of storage backends. It enables agents to interact with different data sources—such as local files, conversation history, and user profiles—through a consistent, path-based API.

## Overview

AFS acts as a bridge between AI agents and various data sources, allowing agents to:

- Access and manipulate files in local directories
- Retrieve conversation history across sessions
- Maintain and query user profile information
- Store and search structured data
- Integrate custom storage backends

Think of AFS as a virtual file system where different "modules" can be mounted at specific paths, similar to how operating systems mount different drives and network locations.

## Key Concepts

### 1. Virtual File System

AFS uses a hierarchical path-based structure similar to Unix file systems:

```
/                           # Root
├── history/               # Conversation history
│   ├── <uuid-1>
│   └── <uuid-2>
├── fs/                    # Local file system mount
│   ├── README.md
│   └── src/
└── user-profile-memory/   # User profile data
    └── profile.json
```

### 2. Modules

Modules are pluggable components that implement specific storage backends. Each module:
- Mounts at a specific path (e.g., `/history`, `/fs`, `/user-profile-memory`)
- Implements one or more operations (`list`, `read`, `write`, `search`)
- Can store data in its own isolated storage
- Can listen to and emit events

### 3. AFSEntry

All data in AFS is represented as `AFSEntry` objects, which provide a consistent structure:

```typescript
interface AFSEntry {
  id: string;                      // Unique identifier
  path: string;                    // Full path in AFS
  content?: any;                   // File/data content
  summary?: string;                // Optional summary
  metadata?: Record<string, any>;  // Custom metadata
  createdAt?: Date;                // Creation timestamp
  updatedAt?: Date;                // Last update timestamp
  userId?: string;                 // Associated user
  sessionId?: string;              // Associated session
  linkTo?: string;                 // Link to another entry
}
```

## Core API

### Creating an AFS Instance

```typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

// Create AFS with SQLite storage
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" }
});

// Mount modules
afs.use(new SystemFS({
  mount: '/docs',
  path: '/path/to/documentation',
  description: 'Project documentation'
}));

afs.use(new UserProfileMemory({
  context: aigne.newContext()
}));
```

### Operations

#### list(path, options?)

List entries in a directory:

```typescript
const { list } = await afs.list('/docs', {
  maxDepth: 2,          // Recursive depth
  recursive: true,      // Enable recursion
  limit: 10,           // Maximum results
  orderBy: [['path', 'asc']]
});
```

#### read(path)

Read a specific entry:

```typescript
const { result } = await afs.read('/docs/README.md');
console.log(result.content);  // File contents
console.log(result.metadata); // File metadata
```

#### write(path, content)

Write or update an entry:

```typescript
const { result } = await afs.write('/docs/notes.txt', {
  content: 'My notes',
  summary: 'Personal notes',
  metadata: { category: 'personal' }
});
```

#### search(path, query, options?)

Search for content:

```typescript
const { list } = await afs.search('/docs', 'authentication', {
  limit: 5
});
```

## Built-in Modules

### 1. AFSHistory

- **Mount Path:** `/history`
- **Purpose:** Automatically records conversation history

**Features:**
- Listens to `agentSucceed` events
- Stores input/output pairs with UUIDs as paths
- Enables conversation history injection into prompts
- Supports semantic search for relevant past conversations

**Usage:**
```typescript
const afs = new AFS({ storage: { url: "file:./db.sqlite3" } });
// History module is enabled by default
```

**Integration with Agents:**
```typescript
const agent = AIAgent.from({
  name: "assistant",
  afs: afs,
  afsConfig: {
    injectHistory: true,      // Enable history injection
    historyWindowSize: 10     // Number of history entries
  }
});
```

### 2. SystemFS

- **Package:** `@aigne/afs-system-fs`
- **Mount Path:** Configurable (e.g., `/fs`, `/docs`)
- **Purpose:** Mount local file system directories

**Features:**
- List files recursively with depth control
- Read and write file contents
- Fast text search using ripgrep
- Glob pattern support
- File metadata (size, timestamps, permissions)
- Sandboxed access to mounted directories

**Usage:**
```typescript
import { SystemFS } from "@aigne/afs-system-fs";

afs.use(new SystemFS({
  mount: '/source',           // AFS mount point
  path: '/local/file/path',   // Local directory
  description: 'Source code'  // Description for AI
}));
```

**Example:** See [examples/afs-system-fs](../examples/afs-system-fs)

### 3. UserProfileMemory

**Package:** `@aigne/afs-user-profile-memory`
**Mount Path:** `/user-profile-memory`
**Purpose:** Maintain structured user profiles from conversations

**Features:**
- Automatically extracts user information from conversations
- Uses JSON Patch operations to incrementally update profiles
- Stores structured data (name, location, interests, family, etc.)
- AI-powered extraction with schema validation
- Injects relevant profile data into agent prompts

**Usage:**
```typescript
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

afs.use(new UserProfileMemory({
  context: aigne.newContext()  // AIGNE context for AI calls
}));
```

**Example:** See [examples/memory](../examples/memory)

## Integration with AI Agents

### Automatic Tool Registration

When an agent has AFS configured, these tools are automatically available:

1. **afs_list** - Browse directory contents
   ```typescript
   afs_list({ path: "/docs", options: { recursive: true } })
   ```

2. **afs_search** - Search for content
   ```typescript
   afs_search({ path: "/docs", query: "authentication" })
   ```

3. **afs_read** - Read file contents
   ```typescript
   afs_read({ path: "/docs/README.md" })
   ```

4. **afs_write** - Write/create files
   ```typescript
   afs_write({ path: "/docs/notes.txt", content: { content: "My notes" } })
   ```

### Complete Example

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AIGNE instance
const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
});

// Create and configure AFS
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" }
});

// Mount file system
afs.use(new SystemFS({
  mount: '/docs',
  path: './documentation',
  description: 'Project documentation'
}));

// Mount user profile memory
afs.use(new UserProfileMemory({
  context: aigne.newContext()
}));

// Create agent with AFS
const agent = AIAgent.from({
  name: "assistant",
  instructions: "You are a helpful assistant with access to documentation and memory",
  afs: afs,
  afsConfig: {
    injectHistory: true,
    historyWindowSize: 10
  }
});

// Use the agent
const userAgent = aigne.invoke(agent);
const result = await userAgent.invoke({
  message: "What files are in the documentation?"
});
```

## Creating Custom Modules

You can create custom AFS modules by implementing the `AFSModule` interface:

```typescript
import { AFSModule, AFSEntry, AFSListOptions } from "@aigne/afs";

export class CustomModule implements AFSModule {
  readonly moduleId = "custom-module";
  readonly path = "/custom";
  readonly description = "My custom module";

  constructor(private storage: AFSStorage) {}

  async list(path: string, options?: AFSListOptions) {
    // Implement list logic
    const entries = await this.storage.list(options);
    return { list: entries };
  }

  async read(path: string) {
    // Implement read logic
    const entry = await this.storage.read(path);
    return { result: entry };
  }

  async write(path: string, content: AFSWriteEntryPayload) {
    // Implement write logic
    const entry = await this.storage.create(content);
    return { result: entry };
  }

  async search(path: string, query: string, options?: AFSSearchOptions) {
    // Implement search logic
    const results = await this.storage.list({
      where: { content: { contains: query } }
    });
    return { list: results };
  }

  onMount(root: AFSRoot) {
    // Optional: initialize when mounted
    console.log(`${this.moduleId} mounted at ${this.path}`);
  }
}
```

## Packages

- [`@aigne/afs`](./core/README.md) - Core AFS implementation with history module
- [`@aigne/afs-system-fs`](./system-fs/README.md) - Local file system module
- [`@aigne/afs-user-profile-memory`](./user-profile-memory/README.md) - User profile memory module

## Examples

- [AFS SystemFS Example](../examples/afs-system-fs/README.md) - File system access with AI agents
- [Memory Example](../examples/memory/README.md) - Conversational memory with user profiles

## API Reference

For detailed API documentation, see the TypeScript type definitions in each package.

## License

This project is licensed under the [Elastic-2.0](../LICENSE.md) License.
