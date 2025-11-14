# @aigne/afs-history

**@aigne/afs-history** is a history tracking module for the Agentic File System (AFS). It automatically records conversation history and agent interactions, storing them in a persistent SQLite database.

## Overview

AFSHistory is an AFS module that listens to agent events and automatically records conversation history. Each conversation is stored with a unique identifier, making it easy to retrieve and review past interactions.

## Features

- **Automatic Recording**: Listens to `agentSucceed` events and automatically stores conversation history
- **SQLite Storage**: Uses SQLite database for persistent, structured storage
- **UUID-based Paths**: Each conversation is stored with a UUID v7 path for easy retrieval
- **Event Integration**: Emits `historyCreated` events when new history entries are recorded
- **Full CRUD Support**: Supports list, read, and write operations
- **Shared Storage**: Can share storage with other AFS modules using `SharedAFSStorage`

## Installation

```bash
npm install @aigne/afs-history
# or
yarn add @aigne/afs-history
# or
pnpm add @aigne/afs-history
```

## Quick Start

```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

// Create AFS instance
const afs = new AFS();

// Mount history module
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// History entries are now accessible at /modules/history
const { list } = await afs.list('/modules/history');
console.log(list); // Array of conversation history entries
```

## Configuration

### AFSHistoryOptions

```typescript
interface AFSHistoryOptions {
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
}
```

#### Storage Options

```typescript
interface SharedAFSStorageOptions {
  url?: string;  // Database URL (default: ":memory:")
}
```

**Examples:**

```typescript
// In-memory database (default)
new AFSHistory()

// File-based database
new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
})

// Shared storage instance
const sharedStorage = new SharedAFSStorage({ url: "file:./memory.sqlite3" });
new AFSHistory({ storage: sharedStorage })
```

## API Reference

### AFSHistory Class

#### Constructor

```typescript
new AFSHistory(options?: AFSHistoryOptions)
```

#### Properties

- `name`: `string` - Module name (always `"history"`)

#### Methods

##### list(path: string, options?: AFSListOptions)

List history entries:

```typescript
const { list } = await afs.list('/modules/history');

// With options
const { list } = await afs.list('/modules/history', {
  maxDepth: 1,
  limit: 10,
  offset: 0
});
```

**Returns:** `Promise<{ list: AFSEntry[] }>`

**Note:** Only root path `/` is supported. Subdirectories return empty arrays.

##### read(path: string)

Read a specific history entry:

```typescript
const { result } = await afs.read('/modules/history/01933e4e-7c8f-7000-8000-123456789abc');

if (result) {
  console.log(result.content.input);   // Original input
  console.log(result.content.output);  // Agent's output
  console.log(result.createdAt);       // Timestamp
}
```

**Returns:** `Promise<{ result?: AFSEntry; message?: string }>`

##### write(path: string, content: AFSWriteEntryPayload)

Manually create a history entry:

```typescript
const { result } = await afs.write('/modules/history/custom-id', {
  content: {
    input: "User question",
    output: "Agent response"
  },
  summary: "Conversation summary",
  metadata: { tags: ["important"] }
});
```

**Returns:** `Promise<{ result: AFSEntry; message?: string }>`

#### Lifecycle

##### onMount(afs: AFSRoot)

Called when the module is mounted. Sets up event listeners:

```typescript
onMount(afs: AFSRoot) {
  afs.on('agentSucceed', ({ input, output }) => {
    // Automatically stores history
  });
}
```

## Data Structure

### AFSEntry Format

History entries follow the standard AFSEntry structure:

```typescript
interface AFSEntry {
  id: string;                          // UUID v7
  path: string;                        // Full path in AFS (e.g., "/modules/history/01933e4e...")
  content: {
    input: string | object;            // Original input to agent
    output: string | object;           // Agent's output
  };
  summary?: string;                    // Optional summary
  metadata?: Record<string, any>;      // Custom metadata
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  userId?: string;                     // Associated user (if available)
  sessionId?: string;                  // Associated session (if available)
  linkTo?: string;                     // Link to another entry
}
```

### Database Schema

History entries are stored in SQLite with the following schema:

```sql
CREATE TABLE Entries_history (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  "path" TEXT NOT NULL UNIQUE,
  "userId" TEXT,
  "sessionId" TEXT,
  "summary" TEXT,
  "metadata" JSON,
  "linkTo" TEXT,
  "content" JSON
)
```

## Events

### Listening to Events

AFSHistory listens to these events from the AFS root:

- `agentSucceed`: Triggered when an agent successfully completes. Automatically creates a history entry.

### Emitting Events

AFSHistory emits these events:

- `historyCreated`: Emitted after a history entry is successfully created

**Example:**

```typescript
afs.on('historyCreated', ({ entry }) => {
  console.log('New history entry:', entry.id);
  console.log('Input:', entry.content.input);
  console.log('Output:', entry.content.output);
});
```

## Usage with AI Agents

When AFS is configured with an AI agent, history tracking happens automatically:

```typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { OpenAIChatModel } from "@aigne/openai";

// Create AIGNE instance
const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
});

// Create AFS with history
const afs = new AFS();
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// Create agent
const agent = AIAgent.from({
  name: "assistant",
  instructions: "You are a helpful assistant",
  afs
});

// Use the agent - history is automatically tracked
const context = aigne.newContext();
const result = await context.invoke(agent, {
  message: "Hello, how are you?"
});

// View history
const { list } = await afs.list('/modules/history');
console.log(`Total conversations: ${list.length}`);
```

## Advanced Usage

### Shared Storage

Share storage between multiple AFS modules:

```typescript
import { SharedAFSStorage } from "@aigne/afs-history";

const storage = new SharedAFSStorage({
  url: "file:./shared-memory.sqlite3"
});

const history = new AFSHistory({ storage });
const customModule = new CustomModule({ storage });

afs.mount(history);
afs.mount(customModule);
```

### Custom Event Handling

React to history creation:

```typescript
afs.on('historyCreated', async ({ entry }) => {
  // Custom processing
  console.log(`Stored conversation ${entry.id}`);

  // Update external analytics
  await analytics.track('conversation_stored', {
    entryId: entry.id,
    timestamp: entry.createdAt
  });
});
```

### Manual History Recording

Manually record history without agent events:

```typescript
const { result } = await afs.write('/modules/history/manual-entry', {
  content: {
    input: "Manual input",
    output: "Manual output"
  },
  summary: "Manually recorded conversation",
  metadata: {
    source: "manual",
    tags: ["important", "review"]
  },
  userId: "user-123",
  sessionId: "session-456"
});
```

### Searching History

If your storage implementation supports search:

```typescript
const { list } = await afs.search('/modules/history', 'authentication error');

for (const entry of list) {
  console.log(`Found in ${entry.id}:`, entry.content);
}
```

## Migration from @aigne/afs

If you were previously using AFSHistory from `@aigne/afs`, update your imports:

**Before:**
```typescript
import { AFS, AFSHistory } from "@aigne/afs";
```

**After:**
```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
```

No other changes are required - the API remains identical.

## TypeScript Support

This package includes full TypeScript type definitions:

```typescript
import type {
  AFSHistory,
  AFSHistoryOptions,
  AFSStorage,
  SharedAFSStorage,
  SharedAFSStorageOptions,
  AFSStorageWithModule,
  AFSStorageCreatePayload,
  AFSStorageListOptions
} from "@aigne/afs-history";
```

## Testing

Run the test suite:

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## License

[Elastic-2.0](../../LICENSE.md)

## Related Packages

- [@aigne/afs](../core/README.md) - Core AFS implementation
- [@aigne/afs-local-fs](../local-fs/README.md) - Local file system module
- [@aigne/afs-user-profile-memory](../user-profile-memory/README.md) - User profile memory module

## Examples

See the [AFS examples](../../examples/afs-memory/README.md) for more usage examples.
