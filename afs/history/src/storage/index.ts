import type { AFSEntry, AFSModule } from "@aigne/afs";
import { and, asc, desc, eq, gt, initDatabase, lt, sql } from "@aigne/sqlite";
import { migrate } from "./migrate.js";
import { compactTable } from "./models/compact.js";
import { componentsTable } from "./models/components.js";
import { entriesTable } from "./models/entries.js";
import { memoryTable } from "./models/memory.js";
import type {
  AFSStorage,
  AFSStorageCreateOptions,
  AFSStorageCreatePayload,
  AFSStorageDeleteOptions,
  AFSStorageListOptions,
  AFSStorageReadOptions,
} from "./type.js";

export * from "./type.js";

const DEFAULT_AFS_STORAGE_LIST_LIMIT = 10;

export interface SharedAFSStorageOptions {
  url?: string;
}

export class SharedAFSStorage {
  constructor(public options?: SharedAFSStorageOptions) {}

  private _db: ReturnType<typeof initDatabase> | undefined;

  get db() {
    this._db ??= initDatabase({ url: this.options?.url });

    return this._db;
  }

  withModule(module: AFSModule): AFSStorage {
    return new AFSStorageWithModule(this.db, module);
  }
}

export class AFSStorageWithModule implements AFSStorage {
  constructor(
    private db: ReturnType<typeof initDatabase>,
    private module: AFSModule,
  ) {}

  private _tables?: Promise<{
    db: Awaited<ReturnType<typeof initDatabase>>;
    entries: ReturnType<typeof entriesTable>;
    compact: ReturnType<typeof compactTable>;
    memory: ReturnType<typeof memoryTable>;
    components: ReturnType<typeof componentsTable>;
  }>;

  private get tables() {
    if (!this._tables) {
      this._tables = this.db.then((db) =>
        migrate(db, this.module).then(() => ({
          db,
          entries: entriesTable(this.module),
          compact: compactTable(this.module),
          memory: memoryTable(this.module),
          components: componentsTable(this.module),
        })),
      );
    }
    return this._tables;
  }

  async list(options: AFSStorageListOptions = {}): Promise<{ data: AFSEntry[] }> {
    const { type = "history", scope, filter, limit = DEFAULT_AFS_STORAGE_LIST_LIMIT } = options;

    const { db, entries, compact, memory, components } = await this.tables;

    // Select table based on type
    const table =
      type === "compact"
        ? compact
        : type === "memory"
          ? memory
          : type === "component"
            ? components
            : entries;

    const data = await db
      .select()
      .from(table)
      .where(
        and(
          // Add scope filter for compact/memory tables
          scope && type !== "history"
            ? eq(sql`json_extract(${table.metadata}, '$.scope')`, scope)
            : undefined,
          filter?.agentId ? eq(table.agentId, filter.agentId) : undefined,
          filter?.userId ? eq(table.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(table.sessionId, filter.sessionId) : undefined,
          filter?.componentId && type === "component"
            ? eq((table as any).componentId, filter.componentId)
            : undefined,
          filter?.before ? lt(table.createdAt, new Date(filter.before)) : undefined,
          filter?.after ? gt(table.createdAt, new Date(filter.after)) : undefined,
        ),
      )
      .orderBy(
        ...(options.orderBy ?? [["createdAt", "desc"]]).map((item) =>
          (item[1] === "asc" ? asc : desc)(sql.identifier(item[0])),
        ),
      )
      .limit(limit)
      .execute();

    return { data };
  }

  async read(id: string, options?: AFSStorageReadOptions): Promise<AFSEntry | undefined> {
    const { type = "history", scope, filter } = options ?? {};

    const { db, entries, compact, memory, components } = await this.tables;

    // Select table based on type
    const table =
      type === "compact"
        ? compact
        : type === "memory"
          ? memory
          : type === "component"
            ? components
            : entries;

    return db
      .select()
      .from(table)
      .where(
        and(
          eq(table.id, id),
          // Add scope filter for compact/memory tables
          scope && type !== "history"
            ? eq(sql`json_extract(${table.metadata}, '$.scope')`, scope)
            : undefined,
          filter?.agentId ? eq(table.agentId, filter.agentId) : undefined,
          filter?.userId ? eq(table.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(table.sessionId, filter.sessionId) : undefined,
          filter?.componentId && type === "component"
            ? eq((table as any).componentId, filter.componentId)
            : undefined,
        ),
      )
      .limit(1)
      .execute()
      .then((rows) => rows.at(0));
  }

  async create(
    entry: AFSStorageCreatePayload,
    options?: AFSStorageCreateOptions,
  ): Promise<AFSEntry> {
    const { type = "history", scope } = options ?? {};

    const { db, entries, compact, memory, components } = await this.tables;

    // Select table based on type
    const table =
      type === "compact"
        ? compact
        : type === "memory"
          ? memory
          : type === "component"
            ? components
            : entries;

    // Prepare entry data - only add scope to metadata for compact/memory types
    const entryData = { ...entry, metadata: { ...entry.metadata, scope } };

    // Try update first, then insert if not found (upsert)
    let result = await db
      .update(table)
      .set(entryData)
      .where(eq(table.id, entry.id))
      .returning()
      .execute();

    if (!result.length) {
      result = await db.insert(table).values(entryData).returning().execute();
    }

    const [res] = result;

    if (!res) throw new Error(`Failed to create ${type} entry, no result`);

    return res;
  }

  async delete(id: string, options?: AFSStorageDeleteOptions): Promise<{ deletedCount: number }> {
    const { type = "history", scope, filter } = options ?? {};

    const { db, entries, compact, memory, components } = await this.tables;

    // Select table based on type
    const table =
      type === "compact"
        ? compact
        : type === "memory"
          ? memory
          : type === "component"
            ? components
            : entries;

    const result = await db
      .delete(table)
      .where(
        and(
          eq(table.id, id),
          // Add scope filter for compact/memory tables
          scope && type !== "history"
            ? eq(sql`json_extract(${table.metadata}, '$.scope')`, scope)
            : undefined,
          filter?.agentId ? eq(table.agentId, filter.agentId) : undefined,
          filter?.userId ? eq(table.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(table.sessionId, filter.sessionId) : undefined,
          filter?.componentId && type === "component"
            ? eq((table as any).componentId, filter.componentId)
            : undefined,
        ),
      )
      .returning()
      .execute();

    return { deletedCount: result.length };
  }
}
