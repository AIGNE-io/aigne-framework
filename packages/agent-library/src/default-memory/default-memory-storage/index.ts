import type { AgentInvokeOptions, Context, Memory } from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { initDatabase } from "@aigne/sqlite";
import { type InferSelectModel, desc, eq, isNull, sql } from "drizzle-orm";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { v7 } from "uuid";
import { stringify } from "yaml";
import { MemoryStorage } from "../storage.js";
import { migrate } from "./migrate.js";
import { Memories } from "./models/memory.js";

const DEFAULT_MAX_MEMORY_COUNT = 10;

export interface DefaultMemoryStorageOptions {
  url?: string;
  getSessionId?: (context: Context) => PromiseOrValue<string>;
  enableFTS?: boolean;
}

export class DefaultMemoryStorage extends MemoryStorage {
  constructor(public options?: DefaultMemoryStorageOptions) {
    super();
  }

  private _db: ReturnType<typeof this.initSqlite> | undefined;

  private async initSqlite() {
    const db = (await initDatabase({ url: this.options?.url })) as unknown as SqliteRemoteDatabase;

    await migrate(db);

    return db;
  }

  get db() {
    this._db ??= this.initSqlite();

    return this._db;
  }

  private convertMemory(m: InferSelectModel<typeof Memories>): Memory {
    return {
      id: m.id,
      sessionId: m.sessionId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    };
  }

  async search(
    query: { search?: string; limit?: number },
    { context }: AgentInvokeOptions,
  ): Promise<{ result: Memory[] }> {
    const { limit = DEFAULT_MAX_MEMORY_COUNT } = query;

    const sessionId = (await this.options?.getSessionId?.(context)) ?? null;

    const db = await this.db;

    const memories =
      this.options?.enableFTS && query.search
        ? await db
            .select({
              id: Memories.id,
              sessionId: Memories.sessionId,
              content: Memories.content,
              createdAt: Memories.createdAt,
              updatedAt: Memories.updatedAt,
            })
            .from(Memories)
            .innerJoin(sql`Memories_fts`, sql`Memories_fts.id = ${Memories.id}`)
            .where(sql`Memories_fts MATCH ${query.search}`)
            .orderBy(sql`bm25(Memories_fts)`)
            .limit(limit)
            .execute()
        : await db
            .select()
            .from(Memories)
            .where(sessionId ? eq(Memories.sessionId, sessionId) : isNull(Memories.sessionId))
            .orderBy(desc(Memories.id))
            .limit(limit)
            .execute();

    return {
      result: memories.reverse().map(this.convertMemory),
    };
  }

  async create(
    memory: Pick<Memory, "content">,
    { context }: AgentInvokeOptions,
  ): Promise<{ result: Memory }> {
    const sessionId = (await this.options?.getSessionId?.(context)) ?? null;

    const db = await this.db;

    const id = v7();

    const [[result]] = await Promise.all([
      db
        .insert(Memories)
        .values({
          ...memory,
          id,
          content: memory.content as string,
          sessionId,
        })
        .returning()
        .execute(),
      this.options?.enableFTS &&
        db.run(
          sql`\
          insert into Memories_fts (id, content)
          values (${id}, ${this.segment(stringify(memory.content)).join(" ")})`,
        ),
    ]);

    if (!result) throw new Error("Failed to create memory");

    return { result: this.convertMemory(result) };
  }

  protected segment(str: string): string[] {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(str)).map(
      (i) => i.segment,
    );
  }
}
