/**
 * Column information from SQLite PRAGMA table_info
 */
export interface ColumnInfo {
  /** Column name */
  name: string;
  /** SQLite type (INTEGER, TEXT, REAL, BLOB, etc.) */
  type: string;
  /** Whether the column has NOT NULL constraint */
  notnull: boolean;
  /** Whether this column is part of the primary key */
  pk: number;
  /** Default value for the column */
  dfltValue: unknown;
}

/**
 * Foreign key information from SQLite PRAGMA foreign_key_list
 */
export interface ForeignKeyInfo {
  /** Foreign key id */
  id: number;
  /** Sequence number for composite foreign keys */
  seq: number;
  /** Referenced table */
  table: string;
  /** Column in this table */
  from: string;
  /** Column in referenced table */
  to: string;
  /** ON UPDATE action */
  onUpdate: string;
  /** ON DELETE action */
  onDelete: string;
  /** MATCH clause */
  match: string;
}

/**
 * Index information from SQLite PRAGMA index_list
 */
export interface IndexInfo {
  /** Index sequence number */
  seq: number;
  /** Index name */
  name: string;
  /** Whether this is a unique index */
  unique: boolean;
  /** Origin of the index (c = CREATE INDEX, u = UNIQUE constraint, pk = PRIMARY KEY) */
  origin: string;
  /** Whether the index is partial */
  partial: boolean;
}

/**
 * Complete schema information for a single table
 */
export interface TableSchema {
  /** Table name */
  name: string;
  /** Column definitions */
  columns: ColumnInfo[];
  /** Primary key column names */
  primaryKey: string[];
  /** Foreign key relationships */
  foreignKeys: ForeignKeyInfo[];
  /** Indexes on this table */
  indexes: IndexInfo[];
}

/**
 * Raw PRAGMA table_info result row
 */
export interface PragmaTableInfoRow {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

/**
 * Raw PRAGMA foreign_key_list result row
 */
export interface PragmaForeignKeyRow {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
  match: string;
}

/**
 * Raw PRAGMA index_list result row
 */
export interface PragmaIndexListRow {
  seq: number;
  name: string;
  unique: number;
  origin: string;
  partial: number;
}

/**
 * System tables that should be excluded from introspection
 */
export const SYSTEM_TABLES = [
  "sqlite_sequence",
  "sqlite_stat1",
  "sqlite_stat2",
  "sqlite_stat3",
  "sqlite_stat4",
] as const;
