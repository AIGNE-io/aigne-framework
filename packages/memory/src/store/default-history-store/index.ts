import { LRUCache } from "lru-cache";

import type { ActionHistory, HistoryStore, MessageHistory } from "../../core/type";
import { initSequelize } from "../../lib/sequelize";
import { migrate } from "./migrate";
import { initHistoryModel } from "./models/history";
import { initMessageModel } from "./models/message";

const cache = new LRUCache<string, DefaultHistoryStore<any>>({
  max: Number(process.env.AIGNE_MEMORY_DEFAULT_HISTORY_STORE_CACHE_MAX) || 500,
  ttl: Number(process.env.AIGNE_MEMORY_DEFAULT_HISTORY_STORE_CACHE_TTL) || 60e3,
});

export class DefaultHistoryStore<T> implements HistoryStore<T> {
  static load<T>({ path }: { path: string }): DefaultHistoryStore<T> {
    let store = cache.get(path);
    if (!store) {
      store = new DefaultHistoryStore<T>(path);
      cache.set(path, store);
    }
    return store as DefaultHistoryStore<T>;
  }

  constructor(public path: string) {}

  private _models?: Promise<{
    History: ReturnType<typeof initHistoryModel>;
    Message: ReturnType<typeof initMessageModel>;
  }>;

  private get models() {
    this._models ??= (async () => {
      const dbPath = `sqlite:${this.path}/default-history-store.db`;

      const sequelize = initSequelize(dbPath);

      await migrate(sequelize);

      return {
        History: initHistoryModel(sequelize),
        Message: initMessageModel(sequelize),
      };
    })();

    return this._models;
  }

  async addHistory(...history: ActionHistory<T>[]): Promise<ActionHistory<T>[]> {
    const { History } = await this.models;

    return await History.bulkCreate(history);
  }

  async getHistory(memoryId: string): Promise<ActionHistory<T>[]> {
    const { History } = await this.models;

    return await History.findAll({
      where: { memoryId },
      order: [["updatedAt", "ASC"]],
    });
  }

  async addMessage(
    history: Omit<MessageHistory, "createdAt" | "updatedAt">,
  ): Promise<MessageHistory> {
    const { Message } = await this.models;

    return await Message.create(history);
  }

  async getMessage(id: string) {
    const { Message } = await this.models;

    return await Message.findByPk(id);
  }

  async getMessages(options: { filter: { [key: string]: any } }): Promise<MessageHistory[]> {
    const { Message } = await this.models;

    return await Message.findAll({ where: options.filter });
  }

  async reset(): Promise<void> {
    const { History } = await this.models;

    await History.sequelize?.truncate();
  }
}
