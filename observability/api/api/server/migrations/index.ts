import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm/sql";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

type DB = LibSQLDatabase | SqliteRemoteDatabase;

function columnExists(db: DB, table: string, column: string): Promise<boolean> {
  return db.all(sql.raw(`PRAGMA table_info(${table});`)).then((rows: any[]) => {
    return rows.some((row) => row.name === column);
  });
}

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
    `,
  },
  {
    hash: "20250707_add_componentId",
    async sql(db: DB) {
      const hasColumn = await columnExists(db, "Trace", "componentId");

      if (!hasColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN componentId TEXT;`);
      }
    },
  },
  {
    hash: "20250707_add_action",
    async sql(db: DB) {
      const hasColumn = await columnExists(db, "Trace", "action");

      if (!hasColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN action INTEGER;`);
      }
    },
  },
  {
    hash: "20250924_alter_trace_add_token_cost_columns",
    async sql(db: DB) {
      const hasTokenColumn = await columnExists(db, "Trace", "token");
      const hasCostColumn = await columnExists(db, "Trace", "cost");

      if (!hasTokenColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN token INTEGER DEFAULT 0;`);
      }

      if (!hasCostColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN cost REAL DEFAULT 0;`);
      }
    },
  },
  {
    hash: "20251014_add_remark_column",
    async sql(db: DB) {
      const hasRemarkColumn = await columnExists(db, "Trace", "remark");

      if (!hasRemarkColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN remark TEXT;`);
      }
    },
  },
  {
    hash: "20251016_add_trace_is_import_column",
    async sql(db: DB) {
      const hasImportColumn = await columnExists(db, "Trace", "isImport");

      if (!hasImportColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN isImport INTEGER DEFAULT 0;`);
      }
    },
  },
  {
    hash: "20251111_fix_missing_indexes",
    async sql(db: DB) {
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_id ON Trace (id);`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_rootId ON Trace (rootId);`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_parentId ON Trace (parentId);`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_componentId ON Trace (componentId);`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_startTime ON Trace (startTime DESC);`);
      await db.run(sql`CREATE INDEX IF NOT EXISTS idx_trace_isImport ON Trace (isImport);`);
    },
  },
  {
    hash: "20251111_add_composite_query_indexes",
    async sql(db: DB) {
      //  isImport + componentId + parentId + startTime
      await db.run(
        sql`CREATE INDEX IF NOT EXISTS idx_trace_import_component_root_query ON Trace (isImport, componentId, parentId, startTime DESC) WHERE componentId IS NOT NULL;`,
      );
      //  componentId + parentId + startTime
      await db.run(
        sql`CREATE INDEX IF NOT EXISTS idx_trace_component_time_query ON Trace (componentId, startTime DESC, parentId) WHERE componentId IS NOT NULL AND parentId IS NULL AND action IS NULL;`,
      );
      // isImport + startTime + parentId
      await db.run(
        sql`CREATE INDEX IF NOT EXISTS idx_trace_import_time_query ON Trace (isImport, startTime DESC, parentId) WHERE parentId IS NULL AND action IS NULL;`,
      );
    },
  },
  {
    hash: "20251120_add_input_output_columns",
    async sql(db: DB) {
      const hasInputColumn = await columnExists(db, "Trace", "input");
      const hasOutputColumn = await columnExists(db, "Trace", "output");

      if (!hasInputColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN input TEXT;`);
      }

      if (!hasOutputColumn) {
        await db.run(sql`ALTER TABLE Trace ADD COLUMN output TEXT;`);
      }
    },
  },
];

export default migrations;
