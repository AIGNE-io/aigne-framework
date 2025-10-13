import { type initDatabase, type SQL, sql } from "@aigne/sqlite";
import { v7 } from "@aigne/uuid";
import type { AFSModule } from "../type.js";
import { init } from "./migrations/001-init.js";
import type { AFSStorageMigrations } from "./type.js";

export async function migrate(db: ReturnType<typeof initDatabase>, module: AFSModule) {
  const migrations: AFSStorageMigrations[] = [init];

  const migrationsTable = "__drizzle_migrations";
  const migrationTableCreate = sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
      "id" SERIAL PRIMARY KEY,
      "moduleId" TEXT NOT NULL,
      "hash" TEXT NOT NULL
    )
  `;

  await (await db).run(migrationTableCreate).execute();

  const dbMigrations = await (await db)
    .values<[number, string]>(
      sql`SELECT "id", "moduleId", "hash" FROM ${sql.identifier(migrationsTable)} WHERE "moduleId" = ${sql.param(module.moduleId)} ORDER BY id DESC LIMIT 1`,
    )
    .execute();

  const lastDbMigration = dbMigrations[0];

  const queriesToRun: SQL[] = [];

  for (const migration of migrations) {
    if (!lastDbMigration || lastDbMigration[1] < migration.hash) {
      queriesToRun.push(
        ...migration.sql(module),
        sql`INSERT INTO ${sql.identifier(migrationsTable)} ("id", "moduleId", "hash") VALUES(${sql.param(v7())}, ${sql.param(module.moduleId)}, ${sql.param(migration.hash)})`,
      );
    }
  }

  for (const query of queriesToRun) {
    await (await db).run(query).execute();
  }
}
