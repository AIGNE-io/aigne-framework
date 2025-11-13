# @aigne/afs

**@aigne/afs** is the core package of the Agentic File System (AFS), providing a virtual file system abstraction layer that enables AI agents to access various storage backends through a unified, path-based API.

## Overview

AFS Core provides the foundational infrastructure for building virtual file systems that can integrate with different storage backends. It includes the base AFS implementation, module mounting system, and event-driven architecture for building modular storage solutions.

## Features

- **Virtual File System**: Hierarchical path-based structure with `/modules` root directory
- **Module System**: Pluggable architecture for custom storage backends
- **Unified API**: Consistent interface for list, read, write, search, and exec operations
- **Event System**: Event-driven architecture for module communication
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
import { AFS, AFSHistory } from "@aigne/afs";

// Create AFS instance
const afs = new AFS();

// Mount history module (optional)
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// All modules are mounted under /modules
// List modules
const modules = await afs.listModules();

// List entries in a module
const { list } = await afs.list('/modules/history');

// Read an entry
const { result } = await afs.read('/modules/history/some-id');

// Write an entry (if module supports write)
await afs.write('/modules/history/notes', {
  content: 'My notes',
  summary: 'Personal notes'
});

// Search for content
const { list: results } = await afs.search('/modules/history', 'search query');
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

Modules are pluggable components that implement storage backends. All modules are automatically mounted under the `/modules` path prefix:

```typescript
interface AFSModule {
  name: string;                   // Module name (used as mount path)
  description?: string;           // Description for AI agents

  // Operations (all optional)
  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[]; message?: string }>;
  read?(path: string): Promise<{ result?: AFSEntry; message?: string }>;
  write?(path: string, entry: AFSWriteEntryPayload): Promise<{ result: AFSEntry; message?: string }>;
  search?(path: string, query: string, options?: AFSSearchOptions): Promise<{ list: AFSEntry[]; message?: string }>;
  exec?(path: string, args: Record<string, any>, options: { context: any }): Promise<{ result: Record<string, any> }>;

  // Lifecycle
  onMount?(afs: AFSRoot): void;
  onUnmount?(): void;
}
```

**Mount Path Convention**: When you mount a module with name `"my-module"`, it will be accessible at `/modules/my-module`.

## API Reference

### AFS Class

#### Constructor

```typescript
new AFS(options?: AFSOptions)
```

Options:
- `modules`: Optional array of modules to mount on initialization

#### Methods

##### mount(module: AFSModule)
##### mount(path: string, module: AFSModule)

Mount a module. The module will be accessible under `/modules/{module.name}` or `/modules/{path}`:

```typescript
// Mount using module's name
afs.mount(new CustomModule());

// Mount with custom path (advanced usage)
afs.mount("/custom-path", new CustomModule());
```

##### listModules()

Get all mounted modules:

```typescript
const modules = await afs.listModules();
// Returns: [{ name: string, path: string, description?: string, module: AFSModule }]
```

##### list(path: string, options?: AFSListOptions)

List entries in a directory:

```typescript
const { list, message } = await afs.list('/modules/history', {
  maxDepth: 2
});
```

Options:
- `maxDepth`: Maximum recursion depth (default: 1)

##### read(path: string)

Read a specific entry:

```typescript
const { result, message } = await afs.read('/modules/history/uuid-123');
```

##### write(path: string, content: AFSWriteEntryPayload)

Write or update an entry:

```typescript
const { result, message } = await afs.write('/modules/my-module/file.txt', {
  content: 'Hello, world!',
  summary: 'Greeting file',
  metadata: { type: 'greeting' }
});
```

##### search(path: string, query: string, options?: AFSSearchOptions)

Search for content:

```typescript
const { list, message } = await afs.search('/modules/history', 'authentication');
```

##### exec(path: string, args: Record<string, any>, options: { context: any })

Execute a module-specific operation:

```typescript
const { result } = await afs.exec('/modules/my-module/action', { param: 'value' }, { context });
```

### Events

AFS uses an event system for module communication:

```typescript
// Modules can listen to events
afs.on('agentSucceed', ({ input, output }) => {
  console.log('Agent succeeded:', input, output);
});

// Modules can emit custom events
afs.emit('customEvent', { data: 'value' });
```

Common events from `AFSRootEvents`:
- `agentSucceed`: Emitted when an agent successfully completes
- `agentFail`: Emitted when an agent fails

## Built-in Modules

### AFSHistory

The history module tracks conversation history. It must be manually mounted.

**Features:**
- Listens to `agentSucceed` events and records agent interactions
- Stores input/output pairs with UUID paths
- Supports list and read operations
- Can be extended with search capabilities

**Usage:**

```typescript
import { AFS, AFSHistory } from "@aigne/afs";

const afs = new AFS();
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// History entries are accessible at /modules/history
const { list } = await afs.list('/modules/history');
```

**Configuration:**
- `storage`: Storage configuration (e.g., `{ url: "file:./memory.sqlite3" }`) or a SharedAFSStorage instance

**Note:** History is NOT automatically mounted. You must explicitly mount it if needed.

## Creating Custom Modules

Create a custom module by implementing the `AFSModule` interface:

```typescript
import { AFSModule, AFSEntry, AFSListOptions } from "@aigne/afs";

export class CustomModule implements AFSModule {
  readonly name = "custom-module";
  readonly description = "My custom storage";

  async list(path: string, options?: AFSListOptions) {
    // path is the subpath within your module
    // Implement your list logic
    return { list: [] };
  }

  async read(path: string) {
    // Implement your read logic
    return { result: undefined };
  }

  async write(path: string, content: AFSWriteEntryPayload) {
    // Implement your write logic
    const entry: AFSEntry = { id: 'id', path, ...content };
    return { result: entry };
  }

  async search(path: string, query: string, options?: AFSSearchOptions) {
    // Implement your search logic
    return { list: [] };
  }

  onMount(afs: AFSRoot) {
    console.log(`${this.name} mounted`);

    // Listen to events
    afs.on('agentSucceed', (data) => {
      // Handle event
    });
  }
}

// Mount the module
afs.mount(new CustomModule());
// Now accessible at /modules/custom-module
```

## Module Path Resolution

When a module is mounted, AFS handles path resolution automatically:

1. Module mounted with name `"my-module"` → accessible at `/modules/my-module`
2. When listing `/modules`, AFS shows all mounted modules
3. When accessing `/modules/my-module/foo`, the module receives `"/foo"` as the path parameter

This allows modules to focus on their internal logic without worrying about mount paths.

## Integration with AI Agents

When an agent has AFS configured, these tools are automatically registered:

- **afs_list**: Browse directory contents
- **afs_read**: Read file contents
- **afs_write**: Write/create files
- **afs_search**: Search for content
- **afs_exec**: Execute module operations

Example:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS, AFSHistory } from "@aigne/afs";

const afs = new AFS();
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

const agent = AIAgent.from({
  name: "assistant",
  afs: afs
});

const context = aigne.newContext();
const result = await context.invoke(agent, {
  message: "What's in my history?"
});
```

## Related Packages

- [@aigne/afs-local-fs](../local-fs/README.md) - Local file system module
- [@aigne/afs-user-profile-memory](../user-profile-memory/README.md) - User profile memory module

## Examples

See the [AFS examples](../../examples/afs-local-fs) for complete usage examples.

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[Elastic-2.0](../../LICENSE.md)
