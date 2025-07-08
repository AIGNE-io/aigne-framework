import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm/sql";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

const migrations = [
  {
    id: "20250608-init-trace",
    sql: sql`
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
    id: "20250707_add_componentId",
    sql: sql`ALTER TABLE Trace ADD COLUMN componentId TEXT;`,
  },
  {
    id: "20250707_add_action",
    sql: sql`ALTER TABLE Trace ADD COLUMN action INTEGER;`,
  },
];

export async function migrate(db: LibSQLDatabase | SqliteRemoteDatabase) {
  const migrationsTable = "__drizzle_migrations";
  const migrationTableCreate = sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL
    )
  `;

  await db.run(migrationTableCreate).execute();

  const executedMigrations = await db.all<{ hash: string }>(
    sql`SELECT hash FROM ${sql.identifier(migrationsTable)} ORDER BY id`,
  );

  const executedHashes = new Set(executedMigrations.map((m) => m.hash));

  for (const migration of migrations) {
    if (!executedHashes.has(migration.id)) {
      await db.run(migration.sql).execute();
      await db
        .run(sql`INSERT INTO ${sql.identifier(migrationsTable)} (hash) VALUES (${migration.id})`)
        .execute();
      console.log(`Migration ${migration.id} executed`);
    }
  }
}
