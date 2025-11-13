# @aigne/afs-system-fs

**@aigne/afs-system-fs** is an AFS module that provides local file system access for AI agents. It allows agents to browse, read, write, and search files in specified directories through the AFS virtual file system interface.

## Overview

SystemFS mounts local directories into the AFS virtual file system, enabling AI agents to interact with your local files as if they were part of a unified file system. It provides sandboxed access with powerful search capabilities using ripgrep.

## Features

- **Directory Mounting**: Mount any local directory at a custom AFS path
- **File Operations**: List, read, and write files with full metadata
- **Recursive Listing**: Browse directories with configurable depth control
- **Fast Search**: Lightning-fast text search using ripgrep
- **Glob Support**: Pattern-based file matching
- **Metadata**: File size, timestamps, permissions, and type information
- **Sandboxed Access**: Operations are restricted to mounted directories
- **AI-Friendly**: Designed for seamless AI agent integration

## Installation

```bash
npm install @aigne/afs-system-fs @aigne/afs
# or
yarn add @aigne/afs-system-fs @aigne/afs
# or
pnpm add @aigne/afs-system-fs @aigne/afs
```

## Quick Start

```typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";

// Create AFS instance
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" }
});

// Mount a local directory
afs.use(new SystemFS({
  mount: '/docs',                    // AFS mount point
  path: '/path/to/documentation',    // Local directory path
  description: 'Project documentation'  // Description for AI
}));

// List files
const { list } = await afs.list('/docs', { recursive: true });

// Read a file
const { result } = await afs.read('/docs/README.md');
console.log(result.content);

// Search for content
const { list: results } = await afs.search('/docs', 'installation');

// Write a file
await afs.write('/docs/notes.txt', {
  content: 'My notes about the project'
});
```

## Configuration

### SystemFSOptions

```typescript
interface SystemFSOptions {
  mount: string;        // AFS mount path (e.g., '/docs', '/source')
  path: string;         // Local file system path to mount
  description?: string; // Optional description for AI agents
}
```

**Example:**

```typescript
afs.use(new SystemFS({
  mount: '/project',
  path: '/Users/john/my-project',
  description: 'My web application source code'
}));
```

## Operations

### list(path, options?)

List files and directories:

```typescript
const { list, message } = await afs.list('/docs', {
  recursive: true,      // Enable recursive listing
  maxDepth: 3,         // Limit recursion depth
  limit: 50            // Maximum results (capped at 50)
});

// list is an array of AFS entries:
[
  {
    id: '/docs/README.md',
    path: '/docs/README.md',
    createdAt: Date,
    updatedAt: Date,
    metadata: {
      type: 'file',      // 'file' or 'directory'
      size: 1024,        // File size in bytes
      mode: 33188        // Unix file permissions
    }
  },
  ...
]
```

**Options:**
- `recursive`: Enable recursive directory listing (default: `false`)
- `maxDepth`: Maximum recursion depth when recursive is enabled
- `limit`: Maximum number of results (capped at 50)

### read(path)

Read file contents and metadata:

```typescript
const { result } = await afs.read('/docs/README.md');

console.log(result.content);   // File contents as string
console.log(result.metadata);  // File metadata
console.log(result.createdAt); // Creation timestamp
console.log(result.updatedAt); // Last modified timestamp
```

**Returns:**
- `result.content`: File contents (undefined for directories)
- `result.metadata`: File information (type, size, mode)
- `result.createdAt`: File creation time
- `result.updatedAt`: Last modification time

### write(path, content)

Write or update file contents:

```typescript
const { result } = await afs.write('/docs/notes.txt', {
  content: 'My notes',
  summary: 'Personal notes about the project',
  metadata: { category: 'personal' }
});
```

**Features:**
- Automatically creates parent directories if needed
- Supports string content directly
- Supports object content (automatically JSON stringified)
- Returns the written entry with updated metadata

### search(path, query, options?)

Search for files containing specific text:

```typescript
const { list, message } = await afs.search('/docs', 'authentication', {
  limit: 20
});

// Results include matching files with context
list.forEach(entry => {
  console.log(entry.path);      // File path
  console.log(entry.summary);   // Matching line snippet
});
```

**Features:**
- Uses ripgrep for extremely fast text search
- Automatically deduplicates results
- Returns file paths with matching line snippets
- Respects the limit option (capped at 50)

**Options:**
- `limit`: Maximum number of results (capped at 50)

## Integration with AI Agents

SystemFS integrates seamlessly with AIGNE agents:

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { OpenAIChatModel } from "@aigne/openai";

// Setup AIGNE
const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
});

// Setup AFS with SystemFS
const afs = new AFS({
  storage: { url: "file:./memory.sqlite3" }
});

afs.use(new SystemFS({
  mount: '/codebase',
  path: './src',
  description: 'Application source code'
}));

afs.use(new SystemFS({
  mount: '/docs',
  path: './docs',
  description: 'Project documentation'
}));

// Create agent with AFS access
const agent = AIAgent.from({
  name: "code-assistant",
  instructions: "You are a helpful coding assistant with access to the codebase and documentation",
  afs: afs
});

// Use the agent
const context = aigne.newContext();
const result = await context.invoke(agent, {
  message: "Find all authentication-related files in the codebase"
});
```

The agent automatically gets these tools:
- **afs_list**: Browse directories
- **afs_read**: Read file contents
- **afs_write**: Create or modify files
- **afs_search**: Search for content

## Multiple Mounts

You can mount multiple directories at different paths:

```typescript
// Mount source code
afs.use(new SystemFS({
  mount: '/src',
  path: './src',
  description: 'Application source code'
}));

// Mount tests
afs.use(new SystemFS({
  mount: '/tests',
  path: './tests',
  description: 'Test files'
}));

// Mount configuration
afs.use(new SystemFS({
  mount: '/config',
  path: './config',
  description: 'Configuration files'
}));

// Now agents can access all mounted directories
await afs.list('/src');
await afs.read('/config/app.json');
await afs.search('/tests', 'test suite');
```

## File Metadata

SystemFS provides detailed file metadata:

```typescript
const { result } = await afs.read('/docs/README.md');

result.metadata = {
  type: 'file',           // 'file' or 'directory'
  size: 2048,            // File size in bytes
  mode: 33188            // Unix permissions (e.g., 0644)
}

result.createdAt  // File creation date
result.updatedAt  // Last modification date
```

## Security Considerations

**Sandboxed Access:**
- SystemFS operations are restricted to the mounted directory
- Cannot access files outside the mounted path
- Path traversal attempts are prevented by Node.js path operations

**Best Practices:**
- Only mount directories that should be accessible to agents
- Use descriptive mount paths (e.g., `/readonly-docs`, `/workspace`)
- Consider file permissions when mounting sensitive directories
- Review agent instructions to limit file write operations if needed

## Ripgrep Integration

SystemFS uses ripgrep for high-performance text search:

- **Fast**: Optimized for searching large codebases
- **Smart Filtering**: Automatically ignores binary files
- **Accurate**: Provides line-by-line match context
- **Reliable**: Mature and widely-used search tool

## Examples

See the [SystemFS example](../../examples/afs-system-fs) for a complete working implementation.

## TypeScript Support

This package includes full TypeScript type definitions:

```typescript
import type { SystemFS, SystemFSOptions } from "@aigne/afs-system-fs";
```

## Related Packages

- [@aigne/afs](../core/README.md) - AFS core package
- [@aigne/afs-user-profile-memory](../user-profile-memory/README.md) - User profile memory module

## License

[Elastic-2.0](../../LICENSE.md)
