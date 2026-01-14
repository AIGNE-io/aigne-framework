import {
  type AFSAccessMode,
  type AFSDeleteOptions,
  type AFSDeleteResult,
  type AFSEntry,
  type AFSExecOptions,
  type AFSExecResult,
  type AFSListOptions,
  type AFSListResult,
  type AFSModule,
  type AFSModuleClass,
  type AFSModuleLoadParams,
  type AFSReadOptions,
  type AFSReadResult,
  type AFSRoot,
  type AFSSearchOptions,
  type AFSSearchResult,
  type AFSWriteEntryPayload,
  type AFSWriteOptions,
  type AFSWriteResult,
} from "@aigne/afs";
import { initDatabase } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { type RadixRouter, createRouter } from "radix3";
import { sqliteAFSConfigSchema, type SQLiteAFSOptions } from "./config.js";
import { SchemaIntrospector } from "./schema/introspector.js";
import type { TableSchema } from "./schema/types.js";
import { createPathRouter, matchPath, type RouteData } from "./router/path-router.js";
import { CRUDOperations } from "./operations/crud.js";
import { createFTSConfig, FTSSearch, type FTSConfig } from "./operations/search.js";
import { ActionsRegistry } from "./actions/registry.js";
import { registerBuiltInActions } from "./actions/built-in.js";
import type { ActionContext } from "./actions/types.js";
import { buildActionsListEntry } from "./node/builder.js";

/**
 * SQLite AFS Module
 *
 * Exposes SQLite databases as AFS nodes with full CRUD support,
 * schema introspection, FTS5 search, and virtual paths (@attr, @meta, @actions).
 */
export class SQLiteAFS implements AFSModule {
  readonly name: string;
  readonly description: string;
  readonly accessMode: AFSAccessMode;

  private db!: Awaited<ReturnType<typeof initDatabase>>;
  private schemas = new Map<string, TableSchema>();
  private router!: RadixRouter<RouteData>;
  private crud!: CRUDOperations;
  private ftsSearch!: FTSSearch;
  private actions: ActionsRegistry;
  private ftsConfig: FTSConfig;
  private afs?: AFSRoot;
  private initialized = false;

  constructor(private options: SQLiteAFSOptions) {
    this.name = options.name ?? "sqlite-afs";
    this.description = options.description ?? `SQLite database: ${options.url}`;
    this.accessMode = options.accessMode ?? "readwrite";
    this.ftsConfig = createFTSConfig(options.fts);
    this.actions = new ActionsRegistry();
    registerBuiltInActions(this.actions);
  }

  /**
   * Returns the Zod schema for configuration validation
   */
  static schema() {
    return sqliteAFSConfigSchema;
  }

  /**
   * Loads a module instance from configuration
   */
  static async load({ parsed }: AFSModuleLoadParams): Promise<SQLiteAFS> {
    const validated = sqliteAFSConfigSchema.parse(parsed);
    return new SQLiteAFS(validated);
  }

  /**
   * Called when the module is mounted to AFS
   */
  async onMount(afs: AFSRoot): Promise<void> {
    this.afs = afs;
    await this.initialize();
  }

  /**
   * Initializes the database connection and introspects schema
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize database connection
    this.db = await initDatabase({
      url: this.options.url,
      wal: this.options.wal ?? true,
    });

    // Cast db to LibSQLDatabase for operations
    const db = this.db as unknown as LibSQLDatabase;

    // Introspect database schema
    const introspector = new SchemaIntrospector();
    this.schemas = await introspector.introspect(db, {
      tables: this.options.tables,
      excludeTables: this.options.excludeTables,
    });

    // Initialize components
    this.router = createPathRouter();
    this.crud = new CRUDOperations(db, this.schemas, "");
    this.ftsSearch = new FTSSearch(db, this.schemas, this.ftsConfig, "");

    this.initialized = true;
  }

  /**
   * Ensures the module is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Lists entries at a path
   */
  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    await this.ensureInitialized();

    const match = matchPath(this.router, path);
    if (!match) {
      return { data: [] };
    }

    switch (match.action) {
      case "listTables":
        return this.crud.listTables();

      case "listTable":
        if (!match.params.table) return { data: [] };
        return this.crud.listTable(match.params.table, options);

      case "listAttributes":
        if (!match.params.table || !match.params.pk) return { data: [] };
        return this.crud.listAttributes(match.params.table, match.params.pk);

      case "listActions":
        if (!match.params.table || !match.params.pk) return { data: [] };
        return this.listActions(match.params.table, match.params.pk);

      default:
        return { data: [] };
    }
  }

  /**
   * Reads an entry at a path
   */
  async read(path: string, options?: AFSReadOptions): Promise<AFSReadResult> {
    await this.ensureInitialized();

    const match = matchPath(this.router, path);
    if (!match) {
      return {};
    }

    switch (match.action) {
      case "readRow":
        if (!match.params.table || !match.params.pk) return {};
        return this.crud.readRow(match.params.table, match.params.pk);

      case "getSchema":
        if (!match.params.table) return {};
        return this.crud.getSchema(match.params.table);

      case "getAttribute":
        if (!match.params.table || !match.params.pk || !match.params.column) return {};
        return this.crud.getAttribute(match.params.table, match.params.pk, match.params.column);

      case "getMeta":
        if (!match.params.table || !match.params.pk) return {};
        return this.crud.getMeta(match.params.table, match.params.pk);

      default:
        return {};
    }
  }

  /**
   * Writes an entry at a path
   */
  async write(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions
  ): Promise<AFSWriteResult> {
    await this.ensureInitialized();

    if (this.accessMode === "readonly") {
      throw new Error("Module is in readonly mode");
    }

    const match = matchPath(this.router, path);
    if (!match) {
      throw new Error(`Invalid path: ${path}`);
    }

    switch (match.action) {
      case "createRow":
        if (!match.params.table) {
          throw new Error("Table name required for create");
        }
        return this.crud.createRow(match.params.table, content.content ?? content);

      case "readRow":
        if (!match.params.table || !match.params.pk) {
          throw new Error("Table and primary key required for update");
        }
        return this.crud.updateRow(match.params.table, match.params.pk, content.content ?? content);

      case "executeAction":
        if (!match.params.table || !match.params.action) {
          throw new Error("Table and action name required");
        }
        return this.executeAction(
          match.params.table,
          match.params.pk,
          match.params.action,
          content.content ?? content
        );

      default:
        throw new Error(`Write not supported for path: ${path}`);
    }
  }

  /**
   * Deletes an entry at a path
   */
  async delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    await this.ensureInitialized();

    if (this.accessMode === "readonly") {
      throw new Error("Module is in readonly mode");
    }

    const match = matchPath(this.router, path);
    if (!match || match.action !== "readRow") {
      throw new Error(`Delete not supported for path: ${path}`);
    }

    if (!match.params.table || !match.params.pk) {
      throw new Error("Table and primary key required for delete");
    }

    return this.crud.deleteRow(match.params.table, match.params.pk);
  }

  /**
   * Searches for entries matching a query
   */
  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions
  ): Promise<AFSSearchResult> {
    await this.ensureInitialized();

    // If path specifies a table, search only that table
    const match = matchPath(this.router, path);
    if (match?.params.table) {
      return this.ftsSearch.searchTable(match.params.table, query, options);
    }

    // Otherwise search all FTS-enabled tables
    return this.ftsSearch.search(query, options);
  }

  /**
   * Executes a module operation
   */
  async exec(
    path: string,
    args: Record<string, unknown>,
    options: AFSExecOptions
  ): Promise<AFSExecResult> {
    await this.ensureInitialized();

    const match = matchPath(this.router, path);
    if (match?.action === "executeAction" && match.params.table && match.params.action) {
      const result = await this.executeAction(
        match.params.table,
        match.params.pk,
        match.params.action,
        args
      );
      return { data: result.data as unknown as Record<string, unknown> };
    }

    throw new Error(`Exec not supported for path: ${path}`);
  }

  /**
   * Lists available actions for a row
   */
  private listActions(table: string, pk: string): AFSListResult {
    const actionNames = this.actions.listNames({ rowLevel: true });
    return {
      data: buildActionsListEntry(table, pk, actionNames, { basePath: "" }),
    };
  }

  /**
   * Executes an action
   */
  private async executeAction(
    table: string,
    pk: string | undefined,
    actionName: string,
    params: Record<string, unknown>
  ): Promise<AFSWriteResult> {
    const schema = this.schemas.get(table);
    if (!schema) {
      throw new Error(`Table '${table}' not found`);
    }

    // Get row data if pk is provided
    let row: Record<string, unknown> | undefined;
    if (pk) {
      const readResult = await this.crud.readRow(table, pk);
      row = readResult.data?.content as Record<string, unknown> | undefined;
    }

    const ctx: ActionContext = {
      db: this.db as unknown as LibSQLDatabase,
      schemas: this.schemas,
      table,
      pk,
      row,
      module: {
        refreshSchema: () => this.refreshSchema(),
        exportTable: (t, f) => this.exportTable(t, f),
      },
    };

    const result = await this.actions.execute(actionName, ctx, params);

    if (!result.success) {
      throw new Error(result.message ?? "Action failed");
    }

    return {
      data: {
        id: `${table}:${pk ?? ""}:@actions:${actionName}`,
        path: pk
          ? `/${table}/${pk}/@actions/${actionName}`
          : `/${table}/@actions/${actionName}`,
        content: result.data,
      },
    };
  }

  /**
   * Refreshes the schema cache
   */
  async refreshSchema(): Promise<void> {
    const db = this.db as unknown as LibSQLDatabase;
    const introspector = new SchemaIntrospector();
    this.schemas = await introspector.introspect(db, {
      tables: this.options.tables,
      excludeTables: this.options.excludeTables,
    });
    this.crud.setSchemas(this.schemas);
    this.ftsSearch.setSchemas(this.schemas);
  }

  /**
   * Exports table data in specified format
   */
  async exportTable(table: string, format: string): Promise<unknown> {
    const listResult = await this.crud.listTable(table, { limit: 10000 });

    if (format === "csv") {
      const schema = this.schemas.get(table);
      if (!schema) throw new Error(`Table '${table}' not found`);

      const headers = schema.columns.map((c) => c.name).join(",");
      const rows = listResult.data.map((entry) => {
        const content = entry.content as Record<string, unknown>;
        return schema.columns
          .map((c) => {
            const val = content[c.name];
            if (val === null || val === undefined) return "";
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return String(val);
          })
          .join(",");
      });

      return `${headers}\n${rows.join("\n")}`;
    }

    // Default: JSON
    return listResult.data.map((entry) => entry.content);
  }

  /**
   * Registers a custom action
   */
  registerAction(
    name: string,
    handler: (ctx: ActionContext, params: Record<string, unknown>) => Promise<unknown>,
    options?: {
      description?: string;
      tableLevel?: boolean;
      rowLevel?: boolean;
    }
  ): void {
    this.actions.registerSimple(
      name,
      async (ctx, params) => ({
        success: true,
        data: await handler(ctx, params),
      }),
      options
    );
  }

  /**
   * Gets table schemas (for external access)
   */
  getSchemas(): Map<string, TableSchema> {
    return this.schemas;
  }

  /**
   * Gets the database instance (for advanced operations)
   */
  getDatabase(): LibSQLDatabase {
    return this.db as unknown as LibSQLDatabase;
  }
}

// Type check to ensure SQLiteAFS implements AFSModuleClass
const _typeCheck: AFSModuleClass<SQLiteAFS, SQLiteAFSOptions> = SQLiteAFS;
