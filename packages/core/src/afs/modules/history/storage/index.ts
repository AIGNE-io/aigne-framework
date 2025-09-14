import { and, asc, desc, eq, initDatabase, sql } from "@aigne/sqlite";
import type { AFSEntry } from "../../../type.js";
import {
  HistoryStorage,
  type HistoryStorageCreateEntry,
  type HistoryStorageListOptions,
} from "../type.js";
import { migrate } from "./migrate.js";
import { Histories } from "./models/history.js";

const DEFAULT_HISTORY_STORAGE_SEARCH_LIMIT = 10;

export interface DefaultHistoryStorageOptions {
  url?: string;
}

export class DefaultHistoryStorage extends HistoryStorage {
  constructor(public options?: DefaultHistoryStorageOptions) {
    super();
  }

  private _db: ReturnType<typeof this.initSqlite> | undefined;

  private async initSqlite() {
    const db = await initDatabase({ url: this.options?.url });

    await migrate(db);

    return db;
  }

  get db() {
    this._db ??= this.initSqlite();

    return this._db;
  }

  async list(options: HistoryStorageListOptions = {}): Promise<{ list: AFSEntry[] }> {
    const { filter, limit = DEFAULT_HISTORY_STORAGE_SEARCH_LIMIT } = options;

    const db = await this.db;

    const list = await db
      .select()
      .from(Histories)
      .where(
        and(
          filter?.userId ? eq(Histories.userId, filter.userId) : undefined,
          filter?.sessionId ? eq(Histories.sessionId, filter.sessionId) : undefined,
        ),
      )
      .orderBy(
        ...(options.orderBy ?? []).map((item) =>
          (item[1] === "asc" ? asc : desc)(sql.identifier(item[0])),
        ),
      )
      .limit(limit)
      .execute();

    return { list };
  }

  override async read(path: string): Promise<AFSEntry | undefined> {
    const db = await this.db;

    return db
      .select()
      .from(Histories)
      .where(eq(Histories.path, path))
      .limit(1)
      .execute()
      .then((memory) => memory.at(0));
  }

  override async create(entry: HistoryStorageCreateEntry): Promise<AFSEntry> {
    const db = await this.db;

    const [result] = await db.insert(Histories).values(entry).returning().execute();

    if (!result) throw new Error("Failed to create history entry, no result");

    return result;
  }
}
