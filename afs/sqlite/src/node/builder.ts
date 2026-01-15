import type { AFSEntry } from "@aigne/afs";
import type { TableSchema } from "../schema/types.js";

/**
 * Options for building an AFSEntry
 */
export interface BuildEntryOptions {
  /** Base path prefix (e.g., empty string or module mount path) */
  basePath?: string;
}

/**
 * Builds an AFSEntry from a database row
 */
export function buildRowEntry(
  table: string,
  schema: TableSchema,
  row: Record<string, unknown>,
  options?: BuildEntryOptions,
): AFSEntry {
  const pkColumn = schema.primaryKey[0] ?? "rowid";
  const pk = String(row[pkColumn] ?? row.rowid);
  const basePath = options?.basePath ?? "";

  return {
    id: `${table}:${pk}`,
    path: `${basePath}/${table}/${pk}`,
    content: row,
    metadata: {
      table,
      primaryKey: pkColumn,
      primaryKeyValue: pk,
    },
    createdAt: parseDate(row.created_at ?? row.createdAt),
    updatedAt: parseDate(row.updated_at ?? row.updatedAt),
  };
}

/**
 * Builds an AFSEntry for a table listing
 */
export function buildTableEntry(
  table: string,
  schema: TableSchema,
  options?: BuildEntryOptions & { rowCount?: number },
): AFSEntry {
  const basePath = options?.basePath ?? "";

  return {
    id: table,
    path: `${basePath}/${table}`,
    description: `Table: ${table} (${schema.columns.length} columns)`,
    metadata: {
      table,
      columnCount: schema.columns.length,
      primaryKey: schema.primaryKey,
      childrenCount: options?.rowCount,
    },
  };
}

/**
 * Builds an AFSEntry for table schema
 */
export function buildSchemaEntry(
  table: string,
  schema: TableSchema,
  options?: BuildEntryOptions,
): AFSEntry {
  const basePath = options?.basePath ?? "";

  return {
    id: `${table}:@schema`,
    path: `${basePath}/${table}/@schema`,
    description: `Schema for table: ${table}`,
    content: {
      name: schema.name,
      columns: schema.columns.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: !col.notnull,
        primaryKey: col.pk > 0,
        defaultValue: col.dfltValue,
      })),
      primaryKey: schema.primaryKey,
      foreignKeys: schema.foreignKeys.map((fk) => ({
        column: fk.from,
        references: {
          table: fk.table,
          column: fk.to,
        },
        onUpdate: fk.onUpdate,
        onDelete: fk.onDelete,
      })),
      indexes: schema.indexes.map((idx) => ({
        name: idx.name,
        unique: idx.unique,
        origin: idx.origin,
      })),
    },
    metadata: {
      table,
      type: "schema",
    },
  };
}

/**
 * Builds an AFSEntry for an attribute (single column value)
 */
export function buildAttributeEntry(
  table: string,
  pk: string,
  column: string,
  value: unknown,
  options?: BuildEntryOptions,
): AFSEntry {
  const basePath = options?.basePath ?? "";

  return {
    id: `${table}:${pk}:@attr:${column}`,
    path: `${basePath}/${table}/${pk}/@attr/${column}`,
    content: value,
    metadata: {
      table,
      primaryKeyValue: pk,
      column,
      type: "attribute",
    },
  };
}

/**
 * Builds an AFSEntry listing all attributes for a row
 */
export function buildAttributeListEntry(
  table: string,
  schema: TableSchema,
  pk: string,
  row: Record<string, unknown>,
  options?: BuildEntryOptions,
): AFSEntry[] {
  const basePath = options?.basePath ?? "";

  return schema.columns.map((col) => ({
    id: `${table}:${pk}:@attr:${col.name}`,
    path: `${basePath}/${table}/${pk}/@attr/${col.name}`,
    summary: col.name,
    description: `${col.type}${col.notnull ? " NOT NULL" : ""}`,
    content: row[col.name],
    metadata: {
      column: col.name,
      type: col.type,
    },
  }));
}

/**
 * Builds an AFSEntry for row metadata
 */
export function buildMetaEntry(
  table: string,
  schema: TableSchema,
  pk: string,
  row: Record<string, unknown>,
  options?: BuildEntryOptions,
): AFSEntry {
  const basePath = options?.basePath ?? "";

  return {
    id: `${table}:${pk}:@meta`,
    path: `${basePath}/${table}/${pk}/@meta`,
    content: {
      table,
      primaryKey: schema.primaryKey[0] ?? "rowid",
      primaryKeyValue: pk,
      schema: {
        columns: schema.columns.map((c) => c.name),
        types: Object.fromEntries(schema.columns.map((c) => [c.name, c.type])),
      },
      foreignKeys: schema.foreignKeys.filter((fk) => Object.keys(row).includes(fk.from)),
      rowid: row.rowid,
    },
    metadata: {
      table,
      type: "meta",
    },
  };
}

/**
 * Builds AFSEntry for actions list
 */
export function buildActionsListEntry(
  table: string,
  pk: string,
  actions: string[],
  options?: BuildEntryOptions,
): AFSEntry[] {
  const basePath = options?.basePath ?? "";

  return actions.map((action) => ({
    id: `${table}:${pk}:@actions:${action}`,
    path: `${basePath}/${table}/${pk}/@actions/${action}`,
    summary: action,
    metadata: {
      execute: {
        name: action,
        description: `Execute ${action} action on ${table}:${pk}`,
      },
    },
  }));
}

/**
 * Builds a search result entry with highlights
 */
export function buildSearchEntry(
  table: string,
  schema: TableSchema,
  row: Record<string, unknown>,
  snippet?: string,
  options?: BuildEntryOptions,
): AFSEntry {
  const entry = buildRowEntry(table, schema, row, options);

  if (snippet) {
    entry.summary = snippet;
  }

  return entry;
}

/**
 * Parses a date from various formats
 */
function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "number") return new Date(value);
  return undefined;
}
