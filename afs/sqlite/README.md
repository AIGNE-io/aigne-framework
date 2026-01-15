# @aigne/afs-sqlite

**@aigne/afs-sqlite** is an AFS module that exposes SQLite databases as virtual file system nodes with full CRUD support, schema introspection, FTS5 search, and virtual paths.

## Overview

This module allows AI agents to interact with SQLite databases through the AFS interface. It automatically introspects database schemas and exposes tables, rows, and columns as navigable paths.

## Features

- **Schema Introspection**: Automatically discovers tables, columns, primary keys, foreign keys, and indexes
- **CRUD Operations**: Full create, read, update, delete support for database rows
- **FTS5 Search**: Full-text search support with SQLite FTS5
- **Virtual Paths**: Access row attributes (`@attr`), metadata (`@meta`), schema (`@schema`), and actions (`@actions`)
- **Built-in Actions**: validate, duplicate, refresh, export, count
- **Custom Actions**: Register custom actions for domain-specific operations
- **Readonly Mode**: Optional readonly access mode for safety

## Installation

```bash
npm install @aigne/afs-sqlite
# or
yarn add @aigne/afs-sqlite
# or
pnpm add @aigne/afs-sqlite
```

## Quick Start

```typescript
import { AFS } from "@aigne/afs";
import { SQLiteAFS } from "@aigne/afs-sqlite";

// Create AFS instance
const afs = new AFS();

// Mount SQLite module
afs.mount(new SQLiteAFS({
  url: "file:./database.sqlite3",
  accessMode: "readwrite"
}));

// List all tables
const tables = await afs.list("/modules/sqlite-afs");

// List rows in a table
const users = await afs.list("/modules/sqlite-afs/users");

// Read a specific row
const user = await afs.read("/modules/sqlite-afs/users/1");

// Create a new row
await afs.write("/modules/sqlite-afs/users", {
  content: { name: "John", email: "john@example.com" }
});

// Update an existing row
await afs.write("/modules/sqlite-afs/users/1", {
  content: { name: "John Doe" }
});

// Delete a row
await afs.delete("/modules/sqlite-afs/users/1");

// Search for content
const results = await afs.search("/modules/sqlite-afs", "john");
```

## Configuration

```typescript
interface SQLiteAFSOptions {
  // Database connection URL (required)
  url: string;

  // Module name (default: "sqlite-afs")
  name?: string;

  // Module description
  description?: string;

  // Access mode: "readonly" or "readwrite" (default: "readwrite")
  accessMode?: "readonly" | "readwrite";

  // Enable WAL mode (default: true)
  wal?: boolean;

  // Table whitelist (optional, include only these tables)
  tables?: string[];

  // Table blacklist (optional, exclude these tables)
  excludeTables?: string[];

  // FTS configuration (optional)
  fts?: {
    enabled?: boolean;
    tables?: Record<string, string[]>; // table -> columns to index
  };
}
```

## Path Structure

The module exposes the following path patterns:

| Path | Description |
|------|-------------|
| `/` | List all tables |
| `/:table` | List rows in table or create new row |
| `/:table/@schema` | Get table schema |
| `/:table/:pk` | Read/update/delete specific row |
| `/:table/:pk/@attr` | List row attributes (columns) |
| `/:table/:pk/@attr/:column` | Get specific column value |
| `/:table/:pk/@meta` | Get row metadata |
| `/:table/:pk/@actions` | List available actions |
| `/:table/:pk/@actions/:action` | Execute an action |

## Built-in Actions

### Row-level Actions

- **validate**: Validate row data against schema constraints (NOT NULL, foreign keys)
- **duplicate**: Create a copy of the row

### Table-level Actions

- **refresh**: Refresh the schema cache
- **count**: Get total row count
- **export**: Export table data as JSON or CSV

```typescript
// Validate a row
const result = await afs.write("/modules/sqlite-afs/users/1/@actions/validate", {
  content: {}
});

// Duplicate a row
const result = await afs.write("/modules/sqlite-afs/users/1/@actions/duplicate", {
  content: {}
});

// Export table data
const jsonData = await sqliteAfs.exportTable("users", "json");
const csvData = await sqliteAfs.exportTable("users", "csv");
```

## Custom Actions

Register custom actions for domain-specific operations:

```typescript
const sqliteAfs = new SQLiteAFS({ url: "file:./db.sqlite3" });

sqliteAfs.registerAction(
  "archive",
  async (ctx, params) => {
    // ctx contains: db, schemas, table, pk, row, module
    await ctx.db.run(sql.raw(`UPDATE "${ctx.table}" SET archived = 1 WHERE id = '${ctx.pk}'`));
    return { archived: true };
  },
  {
    description: "Archive the row",
    rowLevel: true,
    tableLevel: false
  }
);
```

## FTS5 Search

Enable full-text search for specific columns:

```typescript
const sqliteAfs = new SQLiteAFS({
  url: "file:./db.sqlite3",
  fts: {
    enabled: true,
    tables: {
      posts: ["title", "content"],
      users: ["name", "bio"]
    }
  }
});

// Search across all FTS-enabled tables
const results = await afs.search("/modules/sqlite-afs", "search query");

// Search within a specific table
const postResults = await afs.search("/modules/sqlite-afs/posts", "search query");
```

## Advanced Usage

### Access Database Directly

```typescript
const db = sqliteAfs.getDatabase();
await db.run(sql.raw("SELECT * FROM users"));
```

### Get Schema Information

```typescript
const schemas = sqliteAfs.getSchemas();
const usersSchema = schemas.get("users");
console.log(usersSchema.columns);
console.log(usersSchema.primaryKey);
console.log(usersSchema.foreignKeys);
```

### Refresh Schema After External Changes

```typescript
await sqliteAfs.refreshSchema();
```

## Integration with AI Agents

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { SQLiteAFS } from "@aigne/afs-sqlite";

const afs = new AFS();
afs.mount(new SQLiteAFS({
  url: "file:./database.sqlite3",
  accessMode: "readwrite"
}));

const agent = AIAgent.from({
  name: "database-assistant",
  afs: afs
});

const context = aigne.newContext();
const result = await context.invoke(agent, {
  message: "Show me all users in the database"
});
```

## YAML Configuration

SQLiteAFS can be configured via YAML when using the AIGNE loader:

```yaml
afs:
  modules:
    - module: "@aigne/afs-sqlite"
      options:
        url: "file:./database.sqlite3"
        access_mode: readwrite
        tables:
          - users
          - posts
        fts:
          enabled: true
          tables:
            posts:
              - title
              - content
```

## Related Packages

- [@aigne/afs](../core/README.md) - Core AFS package
- [@aigne/afs-history](../history/README.md) - History tracking module
- [@aigne/afs-local-fs](../local-fs/README.md) - Local file system module
- [@aigne/sqlite](../../packages/sqlite/README.md) - SQLite utilities

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[Elastic-2.0](../../LICENSE.md)
