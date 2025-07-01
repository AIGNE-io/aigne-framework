import { sql } from "drizzle-orm/sql";
import init from "./migrations/001-init.js";
export async function migrate(db) {
    const migrations = [init];
    const migrationsTable = "__drizzle_migrations";
    const migrationTableCreate = sql `
    CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL
    )
  `;
    await db.run(migrationTableCreate).execute();
    const dbMigrations = await db
        .values(sql `SELECT id, hash FROM ${sql.identifier(migrationsTable)} ORDER BY id DESC LIMIT 1`)
        .execute();
    const lastDbMigration = dbMigrations[0];
    const queriesToRun = [];
    for (const migration of migrations) {
        if (!lastDbMigration || lastDbMigration[1] < migration.hash) {
            queriesToRun.push(...migration.sql, `INSERT INTO \`${migrationsTable}\` ("hash") VALUES('${migration.hash}')`);
        }
    }
    for (const query of queriesToRun) {
        await db.run(query).execute();
    }
}
