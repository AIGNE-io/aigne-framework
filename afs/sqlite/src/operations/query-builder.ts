import type { TableSchema } from "../schema/types.js";

/**
 * Builds a SELECT query string for a single row by primary key
 */
export function buildSelectByPK(
  tableName: string,
  schema: TableSchema,
  pk: string
): string {
  const pkColumn = schema.primaryKey[0] ?? "rowid";
  return `SELECT * FROM "${tableName}" WHERE "${pkColumn}" = '${escapeSQLString(pk)}'`;
}

/**
 * Builds a SELECT query string for listing rows with optional limit and offset
 */
export function buildSelectAll(
  tableName: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: [string, "asc" | "desc"][];
  }
): string {
  let query = `SELECT * FROM "${tableName}"`;

  if (options?.orderBy?.length) {
    const orderClauses = options.orderBy.map(
      ([col, dir]) => `"${col}" ${dir.toUpperCase()}`
    );
    query += ` ORDER BY ${orderClauses.join(", ")}`;
  }

  if (options?.limit !== undefined) {
    query += ` LIMIT ${options.limit}`;
  }

  if (options?.offset !== undefined) {
    query += ` OFFSET ${options.offset}`;
  }

  return query;
}

/**
 * Builds an INSERT query string from content object
 */
export function buildInsert(
  tableName: string,
  schema: TableSchema,
  content: Record<string, unknown>
): string {
  // Filter to only valid columns
  const validColumns = new Set(schema.columns.map((c) => c.name));
  const entries = Object.entries(content).filter(([key]) => validColumns.has(key));

  if (entries.length === 0) {
    throw new Error(`No valid columns provided for INSERT into ${tableName}`);
  }

  const columns = entries.map(([key]) => `"${key}"`).join(", ");
  const values = entries.map(([, value]) => formatValue(value)).join(", ");

  return `INSERT INTO "${tableName}" (${columns}) VALUES (${values})`;
}

/**
 * Builds an UPDATE query string from content object
 */
export function buildUpdate(
  tableName: string,
  schema: TableSchema,
  pk: string,
  content: Record<string, unknown>
): string {
  const pkColumn = schema.primaryKey[0] ?? "rowid";

  // Filter to only valid columns, excluding PK
  const validColumns = new Set(schema.columns.map((c) => c.name));
  const entries = Object.entries(content).filter(
    ([key]) => validColumns.has(key) && key !== pkColumn
  );

  if (entries.length === 0) {
    throw new Error(`No valid columns provided for UPDATE on ${tableName}`);
  }

  const setClauses = entries
    .map(([key, value]) => `"${key}" = ${formatValue(value)}`)
    .join(", ");

  return `UPDATE "${tableName}" SET ${setClauses} WHERE "${pkColumn}" = '${escapeSQLString(pk)}'`;
}

/**
 * Builds a DELETE query string by primary key
 */
export function buildDelete(
  tableName: string,
  schema: TableSchema,
  pk: string
): string {
  const pkColumn = schema.primaryKey[0] ?? "rowid";
  return `DELETE FROM "${tableName}" WHERE "${pkColumn}" = '${escapeSQLString(pk)}'`;
}

/**
 * Formats a value for SQL insertion
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (typeof value === "object") {
    return `'${escapeSQLString(JSON.stringify(value))}'`;
  }

  return `'${escapeSQLString(String(value))}'`;
}

/**
 * Escapes a string for safe SQL insertion
 */
export function escapeSQLString(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Gets the last inserted rowid query string
 */
export function buildGetLastRowId(): string {
  return "SELECT last_insert_rowid() as id";
}
