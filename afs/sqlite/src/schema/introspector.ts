import { sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  type ColumnInfo,
  type ForeignKeyInfo,
  type IndexInfo,
  type PragmaForeignKeyRow,
  type PragmaIndexListRow,
  type PragmaTableInfoRow,
  SYSTEM_TABLES,
  type TableSchema,
} from "./types.js";

/**
 * Executes a raw SQL query and returns all rows
 */
async function execAll<T>(db: LibSQLDatabase, query: string): Promise<T[]> {
  return db.all<T>(sql.raw(query)).execute();
}

/**
 * Executes a raw SQL query (for INSERT, UPDATE, DELETE)
 */
async function execRun(db: LibSQLDatabase, query: string): Promise<void> {
  await db.run(sql.raw(query)).execute();
}

/**
 * Maps raw PRAGMA table_info row to ColumnInfo
 */
function mapColumn(row: PragmaTableInfoRow): ColumnInfo {
  return {
    name: row.name,
    type: row.type,
    notnull: row.notnull === 1,
    pk: row.pk,
    dfltValue: row.dflt_value,
  };
}

/**
 * Maps raw PRAGMA foreign_key_list row to ForeignKeyInfo
 */
function mapForeignKey(row: PragmaForeignKeyRow): ForeignKeyInfo {
  return {
    id: row.id,
    seq: row.seq,
    table: row.table,
    from: row.from,
    to: row.to,
    onUpdate: row.on_update,
    onDelete: row.on_delete,
    match: row.match,
  };
}

/**
 * Maps raw PRAGMA index_list row to IndexInfo
 */
function mapIndex(row: PragmaIndexListRow): IndexInfo {
  return {
    seq: row.seq,
    name: row.name,
    unique: row.unique === 1,
    origin: row.origin,
    partial: row.partial === 1,
  };
}

/**
 * Schema introspector that uses SQLite PRAGMA queries to discover database schema
 */
export class SchemaIntrospector {
  /**
   * Introspects all tables in the database
   * @param db - Drizzle database instance
   * @param options - Introspection options
   * @returns Map of table name to TableSchema
   */
  async introspect(
    db: LibSQLDatabase,
    options?: {
      /** Whitelist of tables to include */
      tables?: string[];
      /** Tables to exclude */
      excludeTables?: string[];
    },
  ): Promise<Map<string, TableSchema>> {
    const schemas = new Map<string, TableSchema>();

    // Get all user tables (exclude system tables and FTS tables)
    const tablesResult = await execAll<{ name: string }>(
      db,
      `
      SELECT name FROM sqlite_master
      WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '%_fts%'
      ORDER BY name
    `,
    );

    for (const { name } of tablesResult) {
      // Skip system tables
      if (SYSTEM_TABLES.includes(name as (typeof SYSTEM_TABLES)[number])) {
        continue;
      }

      // Apply whitelist filter
      if (options?.tables && !options.tables.includes(name)) {
        continue;
      }

      // Apply exclude filter
      if (options?.excludeTables?.includes(name)) {
        continue;
      }

      const schema = await this.introspectTable(db, name);
      schemas.set(name, schema);
    }

    return schemas;
  }

  /**
   * Introspects a single table
   * @param db - Drizzle database instance
   * @param tableName - Name of the table to introspect
   * @returns TableSchema for the specified table
   */
  async introspectTable(db: LibSQLDatabase, tableName: string): Promise<TableSchema> {
    // Get column information
    const columnsResult = await execAll<PragmaTableInfoRow>(
      db,
      `PRAGMA table_info("${tableName}")`,
    );
    const columns = columnsResult.map(mapColumn);

    // Get primary key columns (pk > 0 indicates part of primary key)
    const primaryKey = columns.filter((c) => c.pk > 0).map((c) => c.name);

    // Get foreign keys
    const fksResult = await execAll<PragmaForeignKeyRow>(
      db,
      `PRAGMA foreign_key_list("${tableName}")`,
    );
    const foreignKeys = fksResult.map(mapForeignKey);

    // Get indexes
    const indexesResult = await execAll<PragmaIndexListRow>(
      db,
      `PRAGMA index_list("${tableName}")`,
    );
    const indexes = indexesResult.map(mapIndex);

    return {
      name: tableName,
      columns,
      primaryKey,
      foreignKeys,
      indexes,
    };
  }

  /**
   * Gets the primary key column name for a table
   * Returns the first PK column, or 'rowid' if no explicit PK
   */
  getPrimaryKeyColumn(schema: TableSchema): string {
    if (schema.primaryKey.length > 0 && schema.primaryKey[0]) {
      return schema.primaryKey[0];
    }
    // SQLite tables without explicit PK use rowid
    return "rowid";
  }

  /**
   * Checks if a table has FTS (Full-Text Search) enabled
   */
  async hasFTS(db: LibSQLDatabase, tableName: string): Promise<boolean> {
    const ftsTableName = `${tableName}_fts`;
    const result = await execAll<{ name: string }>(
      db,
      `
      SELECT name FROM sqlite_master
      WHERE type = 'table'
      AND name = '${ftsTableName}'
    `,
    );
    return result.length > 0;
  }

  /**
   * Creates FTS5 table for full-text search on specified columns
   */
  async createFTS(
    db: LibSQLDatabase,
    tableName: string,
    columns: string[],
    options?: {
      /** Content table (defaults to tableName) */
      contentTable?: string;
      /** Content rowid column (defaults to 'rowid') */
      contentRowid?: string;
    },
  ): Promise<void> {
    const ftsTableName = `${tableName}_fts`;
    const contentTable = options?.contentTable ?? tableName;
    const contentRowid = options?.contentRowid ?? "rowid";
    const columnList = columns.join(", ");

    // Create FTS5 virtual table
    await execRun(
      db,
      `
      CREATE VIRTUAL TABLE IF NOT EXISTS "${ftsTableName}" USING fts5(
        ${columnList},
        content="${contentTable}",
        content_rowid="${contentRowid}"
      )
    `,
    );

    // Create triggers to keep FTS in sync
    await execRun(
      db,
      `
      CREATE TRIGGER IF NOT EXISTS "${tableName}_ai" AFTER INSERT ON "${tableName}" BEGIN
        INSERT INTO "${ftsTableName}"(rowid, ${columnList}) VALUES (new.${contentRowid}, ${columns.map((c) => `new."${c}"`).join(", ")});
      END
    `,
    );

    await execRun(
      db,
      `
      CREATE TRIGGER IF NOT EXISTS "${tableName}_ad" AFTER DELETE ON "${tableName}" BEGIN
        INSERT INTO "${ftsTableName}"("${ftsTableName}", rowid, ${columnList}) VALUES ('delete', old.${contentRowid}, ${columns.map((c) => `old."${c}"`).join(", ")});
      END
    `,
    );

    await execRun(
      db,
      `
      CREATE TRIGGER IF NOT EXISTS "${tableName}_au" AFTER UPDATE ON "${tableName}" BEGIN
        INSERT INTO "${ftsTableName}"("${ftsTableName}", rowid, ${columnList}) VALUES ('delete', old.${contentRowid}, ${columns.map((c) => `old."${c}"`).join(", ")});
        INSERT INTO "${ftsTableName}"(rowid, ${columnList}) VALUES (new.${contentRowid}, ${columns.map((c) => `new."${c}"`).join(", ")});
      END
    `,
    );
  }

  /**
   * Rebuilds FTS index for a table (useful after bulk inserts)
   */
  async rebuildFTS(db: LibSQLDatabase, tableName: string): Promise<void> {
    const ftsTableName = `${tableName}_fts`;
    await execRun(db, `INSERT INTO "${ftsTableName}"("${ftsTableName}") VALUES ('rebuild')`);
  }
}
