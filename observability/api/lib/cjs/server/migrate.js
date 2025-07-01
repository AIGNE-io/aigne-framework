"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const sql_1 = require("drizzle-orm/sql");
const _001_init_js_1 = __importDefault(require("./migrations/001-init.js"));
async function migrate(db) {
    const migrations = [_001_init_js_1.default];
    const migrationsTable = "__drizzle_migrations";
    const migrationTableCreate = (0, sql_1.sql) `
    CREATE TABLE IF NOT EXISTS ${sql_1.sql.identifier(migrationsTable)} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL
    )
  `;
    await db.run(migrationTableCreate).execute();
    const dbMigrations = await db
        .values((0, sql_1.sql) `SELECT id, hash FROM ${sql_1.sql.identifier(migrationsTable)} ORDER BY id DESC LIMIT 1`)
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
