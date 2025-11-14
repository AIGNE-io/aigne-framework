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
/                                    # Root
└── modules/                         # All modules mounted here
    ├── history/                     # Conversation history
    │   ├── <uuid-1>
    │   └── <uuid-2>
    ├── local-fs/                    # Local file system mount
    │   ├── README.md
    │   └── src/
    └── user-profile-memory/         # User profile data
        └── profile.json
```

### 2. Modules

Modules are pluggable components that implement specific storage backends. Each module:
- Is mounted automatically under `/modules/{module-name}` (e.g., `/modules/history`, `/modules/local-fs`)
- Implements one or more operations (`list`, `read`, `write`, `search`, `exec`)
- Receives only the subpath within its mount point
- Can listen to and emit events through the AFS root

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
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

// Create AFS instance
const afs = new AFS();

// Mount modules
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));
// Accessible at /modules/history

afs.mount(new LocalFS({
  localPath: '/path/to/documentation',
  description: 'Project documentation'
}));
// Accessible at /modules/local-fs

afs.mount(new UserProfileMemory({
  context: aigne.newContext()
}));
// Accessible at /modules/user-profile-memory
```

### Operations

#### list(path, options?)

List entries in a directory:

```typescript
// List all modules
const { list } = await afs.list('/modules');

// List entries in a specific module
const { list } = await afs.list('/modules/local-fs', {
  maxDepth: 2  // Recursive depth
});
```

#### read(path)

Read a specific entry:

```typescript
const { result } = await afs.read('/modules/local-fs/README.md');
console.log(result.content);  // File contents
console.log(result.metadata); // File metadata
```

#### write(path, content)

Write or update an entry:

```typescript
const { result } = await afs.write('/modules/local-fs/notes.txt', {
  content: 'My notes',
  summary: 'Personal notes',
  metadata: { category: 'personal' }
});
```

#### search(path, query, options?)

Search for content:

```typescript
const { list } = await afs.search('/modules/local-fs', 'authentication');
```

#### listModules()

Get all mounted modules:

```typescript
const modules = await afs.listModules();
// Returns: [{ name, path, description, module }]
```

## Built-in Modules

### 1. AFSHistory

- **Package:** `@aigne/afs-history`
- **Mount Path:** `/modules/history`
- **Purpose:** Records conversation history

**Features:**
- Listens to `agentSucceed` events
- Stores input/output pairs with UUIDs as paths
- Supports list and read operations
- Persistent SQLite storage

**Usage:**
```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS();
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// Access history entries
const { list } = await afs.list('/modules/history');
```

**Configuration:**
- `storage`: Storage configuration (e.g., `{ url: "file:./memory.sqlite3" }`) or a SharedAFSStorage instance

**Note:** History must be manually mounted. It is NOT automatically enabled.

**Example:** See [history module documentation](./history/README.md)

### 2. LocalFS

- **Package:** `@aigne/afs-local-fs`
- **Mount Path:** `/modules/local-fs` (default name: `"local-fs"`)
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
import { LocalFS } from "@aigne/afs-local-fs";

afs.mount(new LocalFS({
  localPath: '/local/file/path',  // Local directory
  description: 'Source code'      // Description for AI
}));
// Accessible at /modules/local-fs
```

**Example:** See [examples/afs-local-fs](../examples/afs-local-fs)

### 3. UserProfileMemory

- **Package:** `@aigne/afs-user-profile-memory`
- **Mount Path:** `/modules/user-profile-memory` (default name: `"user-profile-memory"`)
- **Purpose:** Maintain structured user profiles from conversations

**Features:**
- Automatically extracts user information from conversations
- Uses JSON Patch operations to incrementally update profiles
- Stores structured data (name, location, interests, family, etc.)
- AI-powered extraction with schema validation

**Usage:**
```typescript
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";

afs.mount(new UserProfileMemory({
  context: aigne.newContext()  // AIGNE context for AI calls
}));
// Accessible at /modules/user-profile-memory
```

**Example:** See [examples/afs-memory](../examples/afs-memory)

## Integration with AI Agents

### Automatic Tool Registration

When an agent has AFS configured, these tools are automatically available:

1. **afs_list** - Browse directory contents
   ```typescript
   afs_list({ path: "/modules/local-fs" })
   ```

2. **afs_search** - Search for content
   ```typescript
   afs_search({ path: "/modules/local-fs", query: "authentication" })
   ```

3. **afs_read** - Read file contents
   ```typescript
   afs_read({ path: "/modules/local-fs/README.md" })
   ```

4. **afs_write** - Write/create files
   ```typescript
   afs_write({ path: "/modules/local-fs/notes.txt", content: { content: "My notes" } })
   ```

5. **afs_exec** - Execute module operations
   ```typescript
   afs_exec({ path: "/modules/my-module/action", args: { param: "value" } })
   ```

### Complete Example

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AIGNE instance
const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
});

// Create and configure AFS
const afs = new AFS();

// Mount history module
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// Mount file system
afs.mount(new LocalFS({
  localPath: './documentation',
  description: 'Project documentation'
}));

// Mount user profile memory
afs.mount(new UserProfileMemory({
  context: aigne.newContext()
}));

// Create agent with AFS
const agent = AIAgent.from({
  name: "assistant",
  instructions: "You are a helpful assistant with access to documentation and memory",
  afs
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
  readonly name = "custom-module";
  readonly description = "My custom module";

  async list(path: string, options?: AFSListOptions) {
    // path is the subpath within your module
    // e.g., if accessed at /modules/custom-module/foo, path will be "/foo"
    return { list: [] };
  }

  async read(path: string) {
    // Implement read logic
    return { result: undefined };
  }

  async write(path: string, content: AFSWriteEntryPayload) {
    // Implement write logic
    const entry: AFSEntry = { id: 'id', path, ...content };
    return { result: entry };
  }

  async search(path: string, query: string, options?: AFSSearchOptions) {
    // Implement search logic
    return { list: [] };
  }

  onMount(root: AFSRoot) {
    // Optional: initialize when mounted
    console.log(`${this.name} mounted`);

    // Listen to events
    root.on('agentSucceed', (data) => {
      // Handle event
    });
  }
}

// Mount the module
afs.mount(new CustomModule());
// Accessible at /modules/custom-module
```

## Packages

- [`@aigne/afs`](./core/README.md) - Core AFS implementation
- [`@aigne/afs-history`](./history/README.md) - History tracking module
- [`@aigne/afs-local-fs`](./local-fs/README.md) - Local file system module
- [`@aigne/afs-user-profile-memory`](./user-profile-memory/README.md) - User profile memory module

## Examples

- [AFS Memory Example](../examples/afs-memory/README.md) - Conversational memory with user profiles
- [AFS LocalFS Example](../examples/afs-local-fs/README.md) - File system access with AI agents
- [AFS MCP Server Example](../examples/afs-mcp-server/README.md) - Mount MCP servers as AFS modules

## API Reference

For detailed API documentation, see the TypeScript type definitions in each package.

## License

This project is licensed under the [Elastic-2.0](../LICENSE.md) License.
