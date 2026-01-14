import { z } from "zod";
import { accessModeSchema, type AFSAccessMode } from "@aigne/afs";

/**
 * FTS (Full-Text Search) configuration schema
 */
export const ftsConfigSchema = z
  .object({
    enabled: z.boolean().default(true).describe("Whether FTS is enabled"),
    tables: z
      .record(z.array(z.string()))
      .optional()
      .describe("Map of table name to columns to index for FTS"),
  })
  .optional();

/**
 * SQLite AFS module configuration schema
 */
export const sqliteAFSConfigSchema = z.object({
  url: z.string().describe("SQLite database URL (file:./path or :memory:)"),
  name: z
    .string()
    .optional()
    .describe("Module name, defaults to 'sqlite-afs'"),
  description: z.string().optional().describe("Description of this module"),
  accessMode: accessModeSchema,
  tables: z
    .array(z.string())
    .optional()
    .describe("Whitelist of tables to expose (if not specified, all tables are exposed)"),
  excludeTables: z
    .array(z.string())
    .optional()
    .describe("Tables to exclude from exposure"),
  fts: ftsConfigSchema,
  wal: z.boolean().optional().default(true).describe("Enable WAL mode for better concurrency"),
});

/**
 * SQLite AFS module configuration type
 */
export type SQLiteAFSConfig = z.infer<typeof sqliteAFSConfigSchema>;

/**
 * SQLite AFS module options (after parsing)
 */
export interface SQLiteAFSOptions {
  /** SQLite database URL */
  url: string;
  /** Module name */
  name?: string;
  /** Module description */
  description?: string;
  /** Access mode */
  accessMode?: AFSAccessMode;
  /** Tables to expose */
  tables?: string[];
  /** Tables to exclude */
  excludeTables?: string[];
  /** FTS configuration */
  fts?: {
    enabled?: boolean;
    tables?: Record<string, string[]>;
  };
  /** Enable WAL mode */
  wal?: boolean;
}
