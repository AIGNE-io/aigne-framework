import type { AFSEntry, AFSModule } from "@aigne/afs";
import { and, asc, desc, eq, gt, initDatabase, lt, sql } from "@aigne/sqlite";
import { migrate } from "./migrate.js";
import { compactTable } from "./models/compact.js";
import { entriesTable } from "./models/entries.js";
import type {
  AFSStorage,
  AFSStorageCreatePayload,
  AFSStorageListOptions,
  AFSStorageReadOptions,
  CompactType,
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
  }>;

  private get tables() {
    if (!this._tables) {
      this._tables = this.db.then((db) =>
        migrate(db, this.module).then(() => ({
          db,
          entries: entriesTable(this.module),
          compact: compactTable(this.module),
        })),
      );
    }
    return this._tables;
  }

  async list(options: AFSStorageListOptions = {}): Promise<{ data: AFSEntry[] }> {
    const { filter, limit = DEFAULT_AFS_STORAGE_LIST_LIMIT } = options;

    const { db, entries } = await this.tables;

    const data = await db
      .select()
      .from(entries)
      .where(
        and(
          filter?.agentId ? eq(entries.agentId, filter.agentId) : undefined,
          filter?.userId ? eq(entries.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(entries.sessionId, filter.sessionId) : undefined,
          filter?.before ? lt(entries.createdAt, new Date(filter.before)) : undefined,
          filter?.after ? gt(entries.createdAt, new Date(filter.after)) : undefined,
        ),
      )
      .orderBy(
        ...(options.orderBy ?? []).map((item) =>
          (item[1] === "asc" ? asc : desc)(sql.identifier(item[0])),
        ),
      )
      .limit(limit)
      .execute();

    return { data };
  }

  async read(id: string, options?: AFSStorageReadOptions): Promise<AFSEntry | undefined> {
    const { db, entries } = await this.tables;

    return db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.id, id),
          options?.filter?.agentId ? eq(entries.agentId, options.filter.agentId) : undefined,
          options?.filter?.userId ? eq(entries.userId, options.filter.userId) : undefined,
          options?.filter?.sessionId ? eq(entries.sessionId, options.filter.sessionId) : undefined,
        ),
      )
      .limit(1)
      .execute()
      .then((memory) => memory.at(0));
  }

  async create(entry: AFSStorageCreatePayload): Promise<AFSEntry> {
    const { db, entries } = await this.tables;

    let result = await db
      .update(entries)
      .set(entry)
      .where(eq(entries.id, entry.id))
      .returning()
      .execute();

    if (!result.length) {
      result = await db.insert(entries).values(entry).returning().execute();
    }

    const [res] = result;

    if (!res) throw new Error("Failed to create AFS entry, no result");

    return res;
  }

  async createCompact(type: CompactType, entry: AFSStorageCreatePayload): Promise<AFSEntry> {
    const { db, compact } = await this.tables;

    const result = await db
      .insert(compact)
      .values({
        ...entry,
        metadata: {
          ...entry.metadata,
          type,
        },
      })
      .returning()
      .execute();

    const [res] = result;

    if (!res) throw new Error(`Failed to create ${type} compact entry, no result`);

    return res;
  }

  async listCompact(
    type: CompactType,
    options: AFSStorageListOptions = {},
  ): Promise<{ data: AFSEntry[] }> {
    const { db, compact } = await this.tables;
    const { filter, limit = DEFAULT_AFS_STORAGE_LIST_LIMIT } = options;

    const data = await db
      .select()
      .from(compact)
      .where(
        and(
          eq(sql`json_extract(${compact.metadata}, '$.type')`, type),
          filter?.agentId ? eq(compact.agentId, filter.agentId) : undefined,
          filter?.userId ? eq(compact.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(compact.sessionId, filter.sessionId) : undefined,
          filter?.before ? lt(compact.createdAt, new Date(filter.before)) : undefined,
          filter?.after ? gt(compact.createdAt, new Date(filter.after)) : undefined,
        ),
      )
      .orderBy(
        ...(options.orderBy ?? []).map((item) =>
          (item[1] === "asc" ? asc : desc)(sql.identifier(item[0])),
        ),
      )
      .limit(limit)
      .execute();

    return { data };
  }

  async readCompact(
    type: CompactType,
    id: string,
    options?: AFSStorageReadOptions,
  ): Promise<AFSEntry | undefined> {
    const { db, compact } = await this.tables;

    return db
      .select()
      .from(compact)
      .where(
        and(
          eq(sql`json_extract(${compact.metadata}, '$.type')`, type),
          eq(compact.id, id),
          options?.filter?.agentId ? eq(compact.agentId, options.filter.agentId) : undefined,
          options?.filter?.userId ? eq(compact.userId, options.filter.userId) : undefined,
          options?.filter?.sessionId ? eq(compact.sessionId, options.filter.sessionId) : undefined,
        ),
      )
      .limit(1)
      .execute()
      .then((rows) => rows.at(0));
  }
}
