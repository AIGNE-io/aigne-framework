import type { initDatabase } from "@aigne/sqlite";
import { sql } from "@aigne/sqlite";
import { init } from "./migrations/001-init.js";

const migrations = [init];

/**
 * Run database migrations
 */
export async function migrate(db: ReturnType<typeof initDatabase>): Promise<void> {
  const dbInstance = await db;

  // Create migrations tracking table
  await dbInstance
    .run(
      sql`CREATE TABLE IF NOT EXISTS __metadata_migrations (
      hash TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )`,
    )
    .execute();

  // Run pending migrations
  for (const migration of migrations) {
    const rows = await dbInstance
      .values<[string, number]>(
        sql`SELECT hash, applied_at FROM __metadata_migrations WHERE hash = ${sql.param(migration.hash)}`,
      )
      .execute();

    const existing = rows[0];

    if (!existing) {
      console.log(`Running migration: ${migration.hash}`);

      // Execute all SQL statements in the migration
      for (const statement of migration.sql()) {
        await dbInstance.run(statement).execute();
      }

      // Record migration as applied
      await dbInstance
        .run(
          sql`INSERT INTO __metadata_migrations (hash, applied_at) VALUES (${sql.param(migration.hash)}, ${sql.param(Date.now())})`,
        )
        .execute();
    }
  }
}
