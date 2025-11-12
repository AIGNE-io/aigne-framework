import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm/sql";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import migrations from "./migrations/index.js";

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
    if (!executedHashes.has(migration.hash)) {
      if (typeof migration.sql === "function") {
        await migration.sql(db);
      } else {
        await db.run(migration.sql).execute();
      }

      await db
        .run(sql`INSERT INTO ${sql.identifier(migrationsTable)} (hash) VALUES (${migration.hash})`)
        .execute();
    }
  }
}
