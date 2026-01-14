import type { AFSEntry, AFSSearchOptions, AFSSearchResult } from "@aigne/afs";
import { sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { TableSchema } from "../schema/types.js";
import { buildSearchEntry, type BuildEntryOptions } from "../node/builder.js";

/**
 * Executes a raw SQL query and returns all rows
 */
async function execAll<T>(db: LibSQLDatabase, query: string): Promise<T[]> {
  return db.all<T>(sql.raw(query)).execute();
}

/**
 * FTS5 search configuration for a table
 */
export interface FTSTableConfig {
  /** Columns to include in FTS index */
  columns: string[];
  /** Whether FTS table has been created */
  initialized?: boolean;
}

/**
 * FTS5 search configuration
 */
export interface FTSConfig {
  /** Whether FTS is enabled */
  enabled: boolean;
  /** Per-table FTS configuration */
  tables: Map<string, FTSTableConfig>;
}

/**
 * FTS5 Search operations for SQLite AFS
 */
export class FTSSearch {
  constructor(
    private db: LibSQLDatabase,
    private schemas: Map<string, TableSchema>,
    private config: FTSConfig,
    private basePath: string = ""
  ) {}

  /**
   * Performs full-text search across configured tables
   */
  async search(
    query: string,
    options?: AFSSearchOptions & {
      /** Specific tables to search (defaults to all FTS-enabled tables) */
      tables?: string[];
    }
  ): Promise<AFSSearchResult> {
    if (!this.config.enabled) {
      return { data: [], message: "Full-text search is not enabled" };
    }

    const results: AFSEntry[] = [];
    const limit = options?.limit ?? 50;
    const buildOptions: BuildEntryOptions = { basePath: this.basePath };

    // Determine which tables to search
    const tablesToSearch = options?.tables
      ? options.tables.filter((t) => this.config.tables.has(t))
      : Array.from(this.config.tables.keys());

    // Escape and prepare the query for FTS5
    const ftsQuery = this.prepareFTSQuery(query, options?.caseSensitive);

    for (const tableName of tablesToSearch) {
      const tableConfig = this.config.tables.get(tableName);
      const schema = this.schemas.get(tableName);

      if (!tableConfig || !schema) continue;

      const ftsTableName = `${tableName}_fts`;

      try {
        // Check if FTS table exists
        const ftsExists = await this.ftsTableExists(ftsTableName);
        if (!ftsExists) continue;

        // Get the first column for highlighting
        const highlightColumn = tableConfig.columns[0] ?? "";
        const highlightIndex = highlightColumn ? tableConfig.columns.indexOf(highlightColumn) : 0;

        // Build FTS query with highlight
        const rows = await execAll<Record<string, unknown> & { snippet?: string }>(
          this.db,
          `
            SELECT t.*, highlight("${ftsTableName}", ${highlightIndex}, '<mark>', '</mark>') as snippet
            FROM "${ftsTableName}" fts
            JOIN "${tableName}" t ON fts.rowid = t.rowid
            WHERE "${ftsTableName}" MATCH '${ftsQuery}'
            LIMIT ${Math.ceil(limit / tablesToSearch.length)}
          `
        );

        for (const row of rows) {
          const { snippet, ...rowData } = row;
          results.push(
            buildSearchEntry(tableName, schema, rowData, snippet as string | undefined, buildOptions)
          );
        }
      } catch (error) {
        // Log but continue with other tables
        console.warn(`FTS search failed for table ${tableName}:`, error);
      }

      // Stop if we have enough results
      if (results.length >= limit) break;
    }

    return {
      data: results.slice(0, limit),
      message: results.length === 0 ? `No results found for "${query}"` : undefined,
    };
  }

  /**
   * Searches within a specific table
   */
  async searchTable(
    tableName: string,
    query: string,
    options?: AFSSearchOptions
  ): Promise<AFSSearchResult> {
    return this.search(query, { ...options, tables: [tableName] });
  }

  /**
   * Checks if FTS is configured for a table
   */
  hasFTS(tableName: string): boolean {
    return this.config.enabled && this.config.tables.has(tableName);
  }

  /**
   * Gets FTS configuration for a table
   */
  getFTSConfig(tableName: string): FTSTableConfig | undefined {
    return this.config.tables.get(tableName);
  }

  /**
   * Checks if an FTS table exists
   */
  private async ftsTableExists(ftsTableName: string): Promise<boolean> {
    const result = await execAll<{ name: string }>(
      this.db,
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${ftsTableName}'`
    );
    return result.length > 0;
  }

  /**
   * Prepares a query string for FTS5
   * Handles special characters and case sensitivity
   */
  private prepareFTSQuery(query: string, caseSensitive?: boolean): string {
    // Escape special FTS5 characters
    let prepared = query
      .replace(/"/g, '""') // Escape double quotes
      .replace(/'/g, "''"); // Escape single quotes

    // For case-insensitive search (default), we don't need to modify
    // FTS5 is case-insensitive by default for ASCII

    // If the query contains multiple words, search for the phrase
    if (prepared.includes(" ") && !prepared.startsWith('"')) {
      prepared = `"${prepared}"`;
    }

    return prepared;
  }

  /**
   * Updates the schemas map (after refresh)
   */
  setSchemas(schemas: Map<string, TableSchema>): void {
    this.schemas = schemas;
  }

  /**
   * Simple search fallback when FTS is not available
   * Uses LIKE queries on specified columns
   */
  async simpleLikeSearch(
    tableName: string,
    query: string,
    columns: string[],
    options?: AFSSearchOptions
  ): Promise<AFSSearchResult> {
    const schema = this.schemas.get(tableName);
    if (!schema) {
      return { data: [], message: `Table '${tableName}' not found` };
    }

    const buildOptions: BuildEntryOptions = { basePath: this.basePath };
    const limit = options?.limit ?? 50;
    const escapedQuery = query.replace(/'/g, "''");

    // Build LIKE conditions for each column
    const conditions = columns
      .filter((col) => schema.columns.some((c) => c.name === col))
      .map((col) => `"${col}" LIKE '%${escapedQuery}%'`)
      .join(" OR ");

    if (!conditions) {
      return { data: [], message: "No valid columns to search" };
    }

    const rows = await execAll<Record<string, unknown>>(
      this.db,
      `SELECT * FROM "${tableName}" WHERE ${conditions} LIMIT ${limit}`
    );

    return {
      data: rows.map((row) => buildSearchEntry(tableName, schema, row, undefined, buildOptions)),
    };
  }
}

/**
 * Creates FTS configuration from options
 */
export function createFTSConfig(
  options?: {
    enabled?: boolean;
    tables?: Record<string, string[]>;
  }
): FTSConfig {
  const config: FTSConfig = {
    enabled: options?.enabled ?? false,
    tables: new Map(),
  };

  if (options?.tables) {
    for (const [table, columns] of Object.entries(options.tables)) {
      config.tables.set(table, { columns });
    }
  }

  return config;
}
