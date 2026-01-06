import type { AFSModule } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import { compactTableName } from "../models/compact.js";
import { entriesTableName } from "../models/entries.js";
import { memoryTableName } from "../models/memory.js";
import type { AFSStorageMigrations } from "../type.js";

export const addIndexes: AFSStorageMigrations = {
  hash: "005-add-indexes",
  sql: (module: AFSModule) => {
    const entriesTable = entriesTableName(module);
    const memoryTable = memoryTableName(module);
    const compactTable = compactTableName(module);

    return [
      // Entries table indexes
      sql`CREATE INDEX IF NOT EXISTS "idx_entries_session_created" ON ${sql.identifier(entriesTable)} ("sessionId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_entries_user_created" ON ${sql.identifier(entriesTable)} ("userId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_entries_agent_created" ON ${sql.identifier(entriesTable)} ("agentId", "createdAt" DESC)`,

      // Memory table indexes
      sql`CREATE INDEX IF NOT EXISTS "idx_memory_session_created" ON ${sql.identifier(memoryTable)} ("sessionId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_memory_user_created" ON ${sql.identifier(memoryTable)} ("userId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_memory_agent_created" ON ${sql.identifier(memoryTable)} ("agentId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_memory_scope" ON ${sql.identifier(memoryTable)} (json_extract("metadata", '$.scope'))`,

      // Compact table indexes
      sql`CREATE INDEX IF NOT EXISTS "idx_compact_session_created" ON ${sql.identifier(compactTable)} ("sessionId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_compact_user_created" ON ${sql.identifier(compactTable)} ("userId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_compact_agent_created" ON ${sql.identifier(compactTable)} ("agentId", "createdAt" DESC)`,
      sql`CREATE INDEX IF NOT EXISTS "idx_compact_scope" ON ${sql.identifier(compactTable)} (json_extract("metadata", '$.scope'))`,
    ];
  },
};
