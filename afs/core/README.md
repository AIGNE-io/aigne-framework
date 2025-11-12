# @aigne/afs

**@aigne/afs** is the core package of the AIGNE File System (AFS), providing a virtual file system abstraction layer that enables AI agents to access various storage backends through a unified, path-based API.

## Overview

AFS Core provides the foundational infrastructure for building virtual file systems that can integrate with different storage backends. It includes the base AFS implementation, storage layer abstraction, and the built-in history module for automatic conversation tracking.

## Features

- **Virtual File System**: Hierarchical path-based structure similar to Unix file systems
- **Module System**: Pluggable architecture for custom storage backends
- **Unified API**: Consistent interface for list, read, write, and search operations
- **Event System**: Event-driven architecture for module communication
- **SQLite Storage**: Built-in persistent storage using SQLite
- **History Tracking**: Automatic conversation history recording (AFSHistory module)
- **AI Agent Integration**: Seamless integration with AIGNE agents

## Installation

```bash
npm install @aigne/afs
# or
yarn add @aigne/afs
# or
pnpm add @aigne/afs
```

## Quick Start

```typescript
import { AFS } from "@aigne/afs";

// Create AFS instance with SQLite storage
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" }
});

// List entries
const { list } = await afs.list('/');

// Read an entry
const { result } = await afs.read('/history/some-id');

// Write an entry
await afs.write('/my-data/notes.txt', {
  content: 'My notes',
  summary: 'Personal notes'
});

// Search for content
const { list: results } = await afs.search('/', 'search query');
```

## Core Concepts

### AFSEntry

All data in AFS is represented as `AFSEntry` objects:

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

### Modules

Modules are pluggable components that implement storage backends:

```typescript
interface AFSModule {
  moduleId: string;               // Unique module identifier
  path: string;                   // Mount path (e.g., '/history')
  description?: string;           // Description for AI agents

  // Operations (all optional)
  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }>;
  read?(path: string): Promise<{ result?: AFSEntry }>;
  write?(path: string, entry: AFSWriteEntryPayload): Promise<{ result: AFSEntry }>;
  search?(path: string, query: string, options?: AFSSearchOptions): Promise<{ list: AFSEntry[] }>;

  // Lifecycle
  onMount?(afs: AFSRoot): void;
  onUnmount?(): void;
}
```

## API Reference

### AFS Class

#### Constructor

```typescript
new AFS(options: AFSOptions)
```

Options:
- `storage`: Storage configuration (e.g., `{ url: "file:./memory.sqlite3" }`)
- `historyEnabled`: Enable/disable automatic history tracking (default: `true`)

#### Methods

##### use(module: AFSModule)

Mount a module at its specified path:

```typescript
afs.use(new CustomModule());
```

##### list(path: string, options?: AFSListOptions)

List entries in a directory:

```typescript
const { list, message } = await afs.list('/history', {
  maxDepth: 2,
  recursive: true,
  limit: 10,
  orderBy: [['createdAt', 'desc']]
});
```

Options:
- `maxDepth`: Maximum recursion depth
- `recursive`: Enable recursive listing
- `limit`: Maximum number of results
- `orderBy`: Sort order (array of `[field, direction]` tuples)

##### read(path: string)

Read a specific entry:

```typescript
const { result, message } = await afs.read('/history/uuid-123');
```

##### write(path: string, content: AFSWriteEntryPayload)

Write or update an entry:

```typescript
const { result, message } = await afs.write('/data/file.txt', {
  content: 'Hello, world!',
  summary: 'Greeting file',
  metadata: { type: 'greeting' }
});
```

##### search(path: string, query: string, options?: AFSSearchOptions)

Search for content:

```typescript
const { list, message } = await afs.search('/history', 'authentication', {
  limit: 5
});
```

### Events

AFS uses an event system for module communication:

```typescript
afs.on('historyCreated', ({ entry }) => {
  console.log('New history entry:', entry);
});
```

Available events:
- `historyCreated`: Emitted when a new history entry is created

## Built-in Modules

### AFSHistory

The history module automatically tracks conversation history.

**Features:**
- Automatically records agent interactions
- Stores input/output pairs with UUID paths
- Enables conversation history injection into agent prompts
- Supports semantic search

**Usage:**

History is enabled by default. To disable:

```typescript
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" },
  historyEnabled: false
});
```

**Integration with AI Agents:**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";

const agent = AIAgent.from({
  name: "assistant",
  afs: afs,
  afsConfig: {
    injectHistory: true,      // Inject history into prompts
    historyWindowSize: 10     // Number of recent entries
  }
});
```

## Creating Custom Modules

Create a custom module by implementing the `AFSModule` interface:

```typescript
import { AFSModule, AFSEntry, AFSStorage } from "@aigne/afs";

export class CustomModule implements AFSModule {
  readonly moduleId = "custom-module";
  readonly path = "/custom";
  readonly description = "My custom storage";

  constructor(private storage: AFSStorage) {}

  async list(path: string, options?: AFSListOptions) {
    const entries = await this.storage.list(options);
    return { list: entries };
  }

  async read(path: string) {
    const entry = await this.storage.read(path);
    return { result: entry };
  }

  async write(path: string, content: AFSWriteEntryPayload) {
    const entry = await this.storage.create({ ...content, path });
    return { result: entry };
  }

  async search(path: string, query: string, options?: AFSSearchOptions) {
    const results = await this.storage.list({
      where: { content: { contains: query } }
    });
    return { list: results };
  }

  onMount(afs: AFSRoot) {
    console.log(`${this.moduleId} mounted at ${this.path}`);

    // Listen to events
    afs.on('someEvent', (data) => {
      // Handle event
    });
  }
}

// Use the module
afs.use(new CustomModule());
```

## Storage Layer

AFS Core includes a SQLite-based storage layer that modules can use:

```typescript
// Get module-specific storage
const storage = afs.storage(myModule);

// Storage operations
await storage.create({ path: '/data', content: 'value' });
await storage.read('/data');
await storage.update('/data', { content: 'new value' });
await storage.delete('/data');
await storage.list({ where: { path: { startsWith: '/data' } } });
```

## Integration with AI Agents

When an agent has AFS configured, these tools are automatically registered:

- **afs_list**: Browse directory contents
- **afs_read**: Read file contents
- **afs_write**: Write/create files
- **afs_search**: Search for content

Example:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";

const afs = new AFS({ storage: { url: "file:./memory.sqlite3" } });

const agent = AIAgent.from({
  name: "assistant",
  afs: afs,
  afsConfig: {
    injectHistory: true,
    historyWindowSize: 10
  }
});

const context = aigne.newContext();
const result = await context.invoke(agent, {
  message: "What's in my history?"
});
```

## Related Packages

- [@aigne/afs-system-fs](../system-fs/README.md) - Local file system module
- [@aigne/afs-user-profile-memory](../user-profile-memory/README.md) - User profile memory module

## Examples

See the [AFS examples](../../examples/afs-system-fs) for complete usage examples.

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[Elastic-2.0](../../LICENSE.md)
