import { sql } from "drizzle-orm/sql";

const migrations = [
  {
    hash: "20250608-init-trace",
    sql: sql`\
      CREATE TABLE IF NOT EXISTS Trace (
        id TEXT PRIMARY KEY NOT NULL,
        rootId TEXT,
        parentId TEXT,
        name TEXT,
        startTime INTEGER NOT NULL,
        endTime INTEGER NOT NULL,
        status TEXT NOT NULL,
        attributes TEXT NOT NULL,
        links TEXT,
        events TEXT,
        userId TEXT,
        sessionId TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_trace_rootId ON Trace (rootId);
      CREATE INDEX IF NOT EXISTS idx_trace_parentId ON Trace (parentId);
    `,
  },
  {
    hash: "20250707_add_componentId",
    sql: sql`\
      ALTER TABLE Trace ADD COLUMN componentId TEXT;

      CREATE INDEX IF NOT EXISTS idx_trace_componentId ON Trace (componentId);
    `,
  },
  {
    hash: "20250707_add_action",
    sql: sql`\
      ALTER TABLE Trace ADD COLUMN action INTEGER;
    `,
  },
];

export default migrations;
