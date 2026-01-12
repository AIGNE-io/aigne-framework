import type { AFSModule } from "@aigne/afs";
import { type initDatabase, type SQL, sql } from "@aigne/sqlite";
import { v7 } from "@aigne/uuid";
import { init } from "./migrations/001-init.js";
import { addAgentId } from "./migrations/002-add-agent-id.js";
import { addCompactTable } from "./migrations/003-add-compact-table.js";
import { addMemoryTable } from "./migrations/004-add-memory-table.js";
import { addIndexes } from "./migrations/005-add-indexes.js";
import { addComponentsTable } from "./migrations/006-add-components-table.js";
import type { AFSStorageMigrations } from "./type.js";

export async function migrate(db: Awaited<ReturnType<typeof initDatabase>>, module: AFSModule) {
  const migrations: AFSStorageMigrations[] = [
    init,
    addAgentId,
    addCompactTable,
    addMemoryTable,
    addIndexes,
    addComponentsTable,
  ];

  const migrationsTable = "__drizzle_migrations";
  const migrationTableCreate = sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
      "id" SERIAL PRIMARY KEY,
      "moduleId" TEXT NOT NULL,
      "hash" TEXT NOT NULL
    )
  `;

  await db.run(migrationTableCreate).execute();

  const dbMigrations = await db
    .values<[number, string, string]>(
      sql`SELECT "id", "moduleId", "hash" FROM ${sql.identifier(migrationsTable)} WHERE "moduleId" = ${sql.param(module.name)} ORDER BY id DESC LIMIT 1`,
    )
    .execute();

  const lastDbMigration = dbMigrations[0];

  const queriesToRun: SQL[] = [];

  for (const migration of migrations) {
    if (!lastDbMigration || lastDbMigration[2] < migration.hash) {
      queriesToRun.push(
        ...migration.sql(module),
        sql`INSERT INTO ${sql.identifier(migrationsTable)} ("id", "moduleId", "hash") VALUES(${sql.param(v7())}, ${sql.param(module.name)}, ${sql.param(migration.hash)})`,
      );
    }
  }

  for (const query of queriesToRun) {
    await db.run(query).execute();
  }
}
