# AFS - Agentic File System

**AFS (Agentic File System)** is a virtual file system abstraction layer that provides a unified, file-system-like interface for AI agents to access various types of storage backends. It enables agents to interact with different data sources—such as local files, conversation history, and user profiles—through a consistent, path-based API.

## Overview

AFS acts as a bridge between AI agents and various data sources:

- Access and manipulate files in local directories
- Retrieve conversation history across sessions
- Maintain and query user profile information
- Navigate JSON and YAML files as virtual file systems
- Store and search structured data
- Integrate custom storage backends

Think of AFS as a virtual file system where different "modules" can be mounted at specific paths, similar to how operating systems mount different drives and network locations.

## Available Modules

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

**Documentation:** See [history module documentation](./history/README.md)

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

**Documentation:** See [local-fs module documentation](./local-fs/README.md)

### 3. AFSJSON

- **Package:** `@aigne/afs-json`
- **Mount Path:** `/modules/{name}` (default name: filename without extension)
- **Purpose:** Mount JSON and YAML files as virtual file systems

**Features:**
- Navigate JSON/YAML structure as directories and files (objects/arrays as directories, values as files)
- Path-based access to nested JSON/YAML properties
- Support for arrays of objects
- Read-only and read-write modes
- Automatic file persistence in original format
- Automatic format detection (.json, .yaml, .yml)

**Usage:**
```typescript
import { AFSJSON } from "@aigne/afs-json";

// Mount JSON file
afs.mount(new AFSJSON({
  jsonPath: './config.json',
  name: 'config',
  accessMode: 'readonly'  // optional, default: "readwrite"
}));

// Mount YAML file
afs.mount(new AFSJSON({
  jsonPath: './settings.yaml',
  name: 'settings',
  accessMode: 'readwrite'
}));
// Accessible at /modules/config and /modules/settings
```

**Documentation:** See [json module documentation](./json/README.md)

### 4. UserProfileMemory

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

**Documentation:** See [user-profile-memory module documentation](./user-profile-memory/README.md)

## Packages

- [`@aigne/afs`](./core/README.md) - Core AFS implementation
- [`@aigne/afs-history`](./history/README.md) - Conversation history storage module
- [`@aigne/afs-local-fs`](./local-fs/README.md) - Local file system access module
- [`@aigne/afs-json`](./json/README.md) - JSON file virtual filesystem module
- [`@aigne/afs-user-profile-memory`](./user-profile-memory/README.md) - User profile memory module
- [`@aigne/afs-sqlite`](./sqlite/README.md) - SQLite storage backend

## Examples

- [AFS Memory Example](../examples/afs-memory/README.md) - Conversational memory with user profiles
- [AFS LocalFS Example](../examples/afs-local-fs/README.md) - File system access with AI agents
- [AFS MCP Server Example](../examples/afs-mcp-server/README.md) - Mount MCP servers as AFS modules

## API Reference

For detailed API documentation, see the TypeScript type definitions in each package.

## License

This project is licensed under the [Elastic-2.0](../LICENSE.md) License.
