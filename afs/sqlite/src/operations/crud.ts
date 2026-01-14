import type { AFSEntry, AFSListOptions, AFSListResult, AFSReadResult, AFSWriteResult, AFSDeleteResult } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { TableSchema } from "../schema/types.js";
import {
  buildRowEntry,
  buildTableEntry,
  buildSchemaEntry,
  buildAttributeEntry,
  buildAttributeListEntry,
  buildMetaEntry,
  type BuildEntryOptions,
} from "../node/builder.js";
import {
  buildSelectByPK,
  buildSelectAll,
  buildInsert,
  buildUpdate,
  buildDelete,
  buildGetLastRowId,
} from "./query-builder.js";

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
 * CRUD operations for SQLite AFS
 */
export class CRUDOperations {
  constructor(
    private db: LibSQLDatabase,
    private schemas: Map<string, TableSchema>,
    private basePath: string = ""
  ) {}

  /**
   * Lists all tables
   */
  async listTables(): Promise<AFSListResult> {
    const entries: AFSEntry[] = [];
    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    for (const [name, schema] of this.schemas) {
      // Get row count for each table
      const countResult = await execAll<{ count: number }>(
        this.db,
        `SELECT COUNT(*) as count FROM "${name}"`
      );
      const rowCount = countResult[0]?.count ?? 0;

      entries.push(buildTableEntry(name, schema, { ...buildOptions, rowCount }));
    }

    return { data: entries };
  }

  /**
   * Lists rows in a table
   */
  async listTable(table: string, options?: AFSListOptions): Promise<AFSListResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { data: [], message: `Table '${table}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    const queryStr = buildSelectAll(table, {
      limit: options?.limit ?? 100,
      orderBy: options?.orderBy,
    });

    const rows = await execAll<Record<string, unknown>>(this.db, queryStr);

    const entries = rows.map((row) => buildRowEntry(table, schema, row, buildOptions));

    return { data: entries };
  }

  /**
   * Reads a single row by primary key
   */
  async readRow(table: string, pk: string): Promise<AFSReadResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { message: `Table '${table}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      return { message: `Row with pk '${pk}' not found in table '${table}'` };
    }

    return { data: buildRowEntry(table, schema, rows[0]!, buildOptions) };
  }

  /**
   * Gets table schema
   */
  getSchema(table: string): AFSReadResult {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { message: `Table '${table}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };
    return { data: buildSchemaEntry(table, schema, buildOptions) };
  }

  /**
   * Lists attributes (columns) for a row
   */
  async listAttributes(table: string, pk: string): Promise<AFSListResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { data: [], message: `Table '${table}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      return { data: [], message: `Row with pk '${pk}' not found` };
    }

    return { data: buildAttributeListEntry(table, schema, pk, rows[0]!, buildOptions) };
  }

  /**
   * Gets a single attribute (column value) for a row
   */
  async getAttribute(table: string, pk: string, column: string): Promise<AFSReadResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { message: `Table '${table}' not found` };
    }

    // Validate column exists
    const colInfo = schema.columns.find((c) => c.name === column);
    if (!colInfo) {
      return { message: `Column '${column}' not found in table '${table}'` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      return { message: `Row with pk '${pk}' not found` };
    }

    return {
      data: buildAttributeEntry(table, pk, column, rows[0]![column], buildOptions),
    };
  }

  /**
   * Gets row metadata
   */
  async getMeta(table: string, pk: string): Promise<AFSReadResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      return { message: `Table '${table}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      return { message: `Row with pk '${pk}' not found` };
    }

    return { data: buildMetaEntry(table, schema, pk, rows[0]!, buildOptions) };
  }

  /**
   * Creates a new row in a table
   */
  async createRow(
    table: string,
    content: Record<string, unknown>
  ): Promise<AFSWriteResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      throw new Error(`Table '${table}' not found`);
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    // Insert the row
    await execRun(this.db, buildInsert(table, schema, content));

    // Get the last inserted rowid
    const lastIdResult = await execAll<{ id: number }>(this.db, buildGetLastRowId());
    const lastId = lastIdResult[0]?.id;

    if (lastId === undefined) {
      throw new Error("Failed to get last inserted row ID");
    }

    // Fetch the inserted row
    const pkColumn = schema.primaryKey[0] ?? "rowid";
    const pk = content[pkColumn] !== undefined ? String(content[pkColumn]) : String(lastId);

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      throw new Error("Failed to fetch inserted row");
    }

    return { data: buildRowEntry(table, schema, rows[0]!, buildOptions) };
  }

  /**
   * Updates an existing row
   */
  async updateRow(
    table: string,
    pk: string,
    content: Record<string, unknown>
  ): Promise<AFSWriteResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      throw new Error(`Table '${table}' not found`);
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    // Update the row
    await execRun(this.db, buildUpdate(table, schema, pk, content));

    // Fetch the updated row
    const rows = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (rows.length === 0) {
      throw new Error(`Row with pk '${pk}' not found after update`);
    }

    return { data: buildRowEntry(table, schema, rows[0]!, buildOptions) };
  }

  /**
   * Deletes a row by primary key
   */
  async deleteRow(table: string, pk: string): Promise<AFSDeleteResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      throw new Error(`Table '${table}' not found`);
    }

    // Check if row exists first
    const existing = await execAll<Record<string, unknown>>(
      this.db,
      buildSelectByPK(table, schema, pk)
    );

    if (existing.length === 0) {
      return { message: `Row with pk '${pk}' not found in table '${table}'` };
    }

    // Delete the row
    await execRun(this.db, buildDelete(table, schema, pk));

    return { message: `Deleted row '${pk}' from table '${table}'` };
  }

  /**
   * Checks if a table exists
   */
  hasTable(table: string): boolean {
    return this.schemas.has(table);
  }

  /**
   * Gets the schema for a table
   */
  getTableSchema(table: string): TableSchema | undefined {
    return this.schemas.get(table);
  }

  /**
   * Updates the schemas map (after refresh)
   */
  setSchemas(schemas: Map<string, TableSchema>): void {
    this.schemas = schemas;
  }
}
