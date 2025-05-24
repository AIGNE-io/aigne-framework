import type { AgentInvokeOptions } from "../../../agents/agent.js";
import "sqlite3";
import { Sequelize } from "sequelize";
import type { Context } from "../../../aigne/context.js";
import { logger } from "../../../utils/logger.js";
import type { PromiseOrValue } from "../../../utils/type-utils.js";
import type { Memory } from "../../memory.js";
import { MemoryStorage } from "../storage.js";
import { migrate } from "./migrate.js";
import { initMemoryModel } from "./models/memory.js";

const DEFAULT_MAX_MEMORY_COUNT = 10;

export interface DefaultMemoryStorageOptions {
  path?: string;
  getSessionId?: (context: Context) => PromiseOrValue<string>;
}

export class DefaultMemoryStorage extends MemoryStorage {
  memories: {
    [groupId: string]: Memory[];
  } = {};

  constructor(public options?: DefaultMemoryStorageOptions) {
    super();
  }

  private _models?: Promise<{
    Memory: ReturnType<typeof initMemoryModel>;
  }>;

  private get models() {
    this._models ??= (async () => {
      const sequelize = initSequelize(this.options?.path);

      await migrate(sequelize);

      return {
        Memory: initMemoryModel(sequelize),
      };
    })();

    return this._models;
  }

  private convertMemory(m: import("./models/memory.js").Memory): Memory {
    return {
      id: m.id,
      sessionId: m.sessionId,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    };
  }

  async search(
    query: { limit?: number },
    { context }: AgentInvokeOptions,
  ): Promise<{ result: Memory[] }> {
    const { limit = DEFAULT_MAX_MEMORY_COUNT } = query;

    const sessionId = (await this.options?.getSessionId?.(context)) ?? null;

    const { Memory } = await this.models;

    const memories = await Memory.findAll({
      where: { sessionId },
      order: [["id", "DESC"]],
      limit,
    });

    return {
      result: memories.reverse().map(this.convertMemory),
    };
  }

  async create(
    memory: Pick<Memory, "content">,
    { context }: AgentInvokeOptions,
  ): Promise<{ result: Memory }> {
    const sessionId = (await this.options?.getSessionId?.(context)) ?? null;

    const { Memory } = await this.models;

    const m = await Memory.create({
      ...memory,
      sessionId,
    });

    return { result: this.convertMemory(m) };
  }
}

export function initSequelize(path?: string) {
  const sequelize = new Sequelize({
    logging: (sql) => logger.debug(sql),
    storage: path,
    dialect: "sqlite",
  });

  return sequelize;
}
