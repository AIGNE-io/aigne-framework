import type { AFSEntry, AFSModule } from "@aigne/afs";
import { and, asc, desc, eq, initDatabase, sql } from "@aigne/sqlite";
import { migrate } from "./migrate.js";
import { entriesTable } from "./models/entries.js";
import type { AFSStorage, AFSStorageCreatePayload, AFSStorageListOptions } from "./type.js";

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
    return new AFSStorageWithModule(
      this.db,
      migrate(this.db, module).then(() => entriesTable(module)),
    );
  }
}

export class AFSStorageWithModule implements AFSStorage {
  constructor(
    private db: ReturnType<typeof initDatabase>,
    private table: Promise<ReturnType<typeof entriesTable>>,
  ) {}

  async list(options: AFSStorageListOptions = {}): Promise<{ data: AFSEntry[] }> {
    const { filter, limit = DEFAULT_AFS_STORAGE_LIST_LIMIT } = options;

    const db = await this.db;
    const table = await this.table;

    const data = await db
      .select()
      .from(table)
      .where(
        and(
          filter?.userId ? eq(table.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(table.sessionId, filter.sessionId) : undefined,
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

  async read(path: string): Promise<AFSEntry | undefined> {
    const db = await this.db;
    const table = await this.table;

    return db
      .select()
      .from(table)
      .where(eq(table.path, path))
      .limit(1)
      .execute()
      .then((memory) => memory.at(0));
  }

  async create(entry: AFSStorageCreatePayload): Promise<AFSEntry> {
    const db = await this.db;
    const table = await this.table;

    let result = await db
      .update(table)
      .set(entry)
      .where(eq(table.path, entry.path))
      .returning()
      .execute();

    if (!result.length) {
      result = await db.insert(table).values(entry).returning().execute();
    }

    const [res] = result;

    if (!res) throw new Error("Failed to create AFS entry, no result");

    return res;
  }
}
