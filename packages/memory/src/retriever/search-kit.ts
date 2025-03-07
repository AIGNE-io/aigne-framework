import { type MemorySortOptions, isNonNullable, logger } from "@aigne/core";
import omit from "lodash/omit";
import { LRUCache } from "lru-cache";

import type { Retriever, VectorStoreDocument, VectorStoreSearchOptions } from "../core/type";

import type { DocumentOptions, Embedders, Hit, Index } from "@blocklet/search-kit-js";
import { DefaultVectorHistoryStore } from "../store/default-vector-history-store";

type SearchKit = typeof import("@blocklet/search-kit-js");

const fields = [
  "id",
  "createdAt",
  "updatedAt",
  "userId",
  "sessionId",
  "agentId",
  "memory",
  "metadata",
];
const searchableAttributes = [
  "id",
  "createdAt",
  "updatedAt",
  "userId",
  "sessionId",
  "agentId",
  "memory",
  "metadata",
];
const filterableAttributes = [
  "id",
  "createdAt",
  "updatedAt",
  "userId",
  "sessionId",
  "agentId",
  "memory",
  "metadata",
];
const sortableAttributes = [
  "id",
  "createdAt",
  "updatedAt",
  "userId",
  "sessionId",
  "agentId",
  "memory",
  "metadata",
];
const rankingRules = ["sort", "exactness", "words", "typo", "proximity", "attribute"];
const POST_SETTING = {
  searchableAttributes,
  filterableAttributes,
  sortableAttributes,
  rankingRules,
};

const documentTemplate = `
  A document info:
  {% if doc.id %}
    id: {{ doc.id }}
  {% endif %}
  {% if doc.memory %}
    with the following content: {{ doc.memory }}
  {% endif %}
  {% assign metadata = doc.metadata %}
  {% if metadata %}
    {% for key in metadata %}
      with metadata: {{ key[0] }}: {{ key[1] }}
    {% endfor %}
  {% endif %}
`;

const cache = new LRUCache<string, SearchKitRetriever<any>>({
  max: Number(process.env.AIGNE_MEMORY_SEARCH_KIT_RETRIEVER_CACHE_MAX) || 500,
  ttl: Number(process.env.AIGNE_MEMORY_SEARCH_KIT_RETRIEVER_CACHE_TTL) || 60e3,
});

export class SearchKitRetriever<T> implements Retriever<T> {
  static load<T>({ path, id }: { path: string; id: string }) {
    let store = cache.get(id);
    if (!store) {
      store = new SearchKitRetriever<T>({ id, path });
      cache.set(id, store);
    }
    return store as SearchKitRetriever<T>;
  }

  protected historyStore: DefaultVectorHistoryStore;

  constructor(public config: { id: string; path: string }) {
    this.historyStore = new DefaultVectorHistoryStore(this.config.path);
  }

  private _client?: import("@blocklet/search-kit-js").SearchKitClient;

  get client() {
    const { SearchKitClient } =
      // eslint-disable-next-line global-require
      require("@blocklet/search-kit-js") as SearchKit;

    this._client ??= new SearchKitClient();

    return this._client!;
  }

  private _index?: Promise<Index<VectorStoreDocument<T>>>;

  private embedders?: Embedders;

  get defaultEmbedder() {
    if (!this.embedders) return undefined;
    return Object.keys(this.embedders)[0];
  }

  get index() {
    this._index ??= (async () => {
      const index = this.client.index(this.config.id);

      const rowInfo = await index.getRawInfo().catch((error: any) => {
        logger.error("get index info error", { error });
      });

      if (!rowInfo?.uid) {
        const { taskUid } = await this.client.createIndex(this.config.id);
        await this.waitForTask(taskUid);

        await this.initIndexFromHistory(index);
      }

      await index.updateSettings(POST_SETTING);

      try {
        const { resolveRestEmbedders } =
          // eslint-disable-next-line global-require
          require("@blocklet/search-kit-js") as SearchKit;

        const embedders = resolveRestEmbedders({
          documentTemplate,
          distribution: { mean: 0.7, sigma: 0.3 },
        });
        const { taskUid } = await index.updateEmbedders(embedders);
        await this.waitForTask(taskUid);

        this.embedders = embedders;
      } catch (error) {
        logger.error("updateEmbedders error - downgrade to basic search.", {
          error,
        });
      }

      return index;
    })();

    return this._index;
  }

  private options: DocumentOptions = {
    primaryKey: "id",
  };

  private async initIndexFromHistory(index: Index<VectorStoreDocument<T>>, { size = 2000 } = {}) {
    // TODO: 分页处理，避免一次性查询过多数据
    const list = await this.historyStore.findAll({});

    for (let i = 0; i < list.length; i += size) {
      const docs = list.slice(i, i + size);
      await index.updateDocuments(docs, this.options);
    }
  }

  private async waitForTask(uid: number, { timeOutMs = 1000 * 60 * 10, intervalMs = 1000 } = {}) {
    return this.client.waitForTask(uid, { timeOutMs, intervalMs });
  }

  async get(id: string): Promise<VectorStoreDocument<T> | null> {
    const result = await (await this.index).getDocument(id);

    return result;
  }

  async insert(document: VectorStoreDocument<T>): Promise<void> {
    await this.historyStore.add(document).catch((e) => {
      logger.error("Error adding origin content", e);
    });

    const result = await (await this.index).updateDocuments([document], this.options);
    await this.waitForTask(result.taskUid);
  }

  async delete(
    idOrFilter: string | string[] | Record<string, any>,
  ): Promise<VectorStoreDocument<T>[]> {
    const memories =
      typeof idOrFilter === "string" || Array.isArray(idOrFilter)
        ? await this.historyStore.findAll({ id: idOrFilter })
        : await this.historyStore.findAll(idOrFilter);

    const ids = memories.map((i) => i.id);

    const result = await (await this.index).deleteDocuments(ids);
    await Promise.all([this.historyStore.delete({ id: ids }), this.waitForTask(result.taskUid)]);

    return memories;
  }

  async reset(): Promise<void> {
    const result = await (await this.index).deleteAllDocuments();
    await Promise.all([this.waitForTask(result.taskUid), this.historyStore.reset()]);
  }

  async update(document: VectorStoreDocument<T>): Promise<void> {
    await this.historyStore.update(document).catch((e) => {
      logger.error("Error updating origin content", e);
    });

    const result = await (await this.index).updateDocuments([document], this.options);
    await this.waitForTask(result.taskUid);
  }

  private getSort(sort?: MemorySortOptions) {
    if (!sort) return undefined;
    return (Array.isArray(sort) ? sort : [sort]).map((i) => `${i.field}:${i.direction}`);
  }

  private getFilter(filter?: Record<string, any>) {
    return filter
      ? Object.entries(filter)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              if (value.length === 0) return null;

              return `${key} IN [${value.map((v) => JSON.stringify(v)).join(",")}]`;
            }

            return `${key} = ${JSON.stringify(value)}`;
          })
          .filter(isNonNullable)
      : undefined;
  }

  async list(k: number, options?: VectorStoreSearchOptions): Promise<VectorStoreDocument<T>[]> {
    return this.search("", k, options);
  }

  async searchWithScore(
    query: string,
    k: number,
    options?: VectorStoreSearchOptions,
  ): Promise<[VectorStoreDocument<T>, number][]> {
    const result = await this.search(query, k, {
      ...options,
      searchKitOptions: {
        showRankingScore: true,
        showRankingScoreDetails: true,
        sort: options?.sort,
      },
    });
    return result.map((item: any) => [item, item._rankingScore]);
  }

  async search(
    query: string,
    k: number,
    options?: VectorStoreSearchOptions & { searchKitOptions?: object },
  ): Promise<VectorStoreDocument<T>[]> {
    const index = await this.index;

    const filter = this.getFilter(options?.filter);
    const sort = this.getSort(options?.sort);

    const result = (
      await index.search(query, {
        filter,
        limit: k,
        offset: 0,
        attributesToRetrieve: ["*"],
        // rankingScoreThreshold: 0.1,
        attributesToCrop: fields,
        cropLength: 10000,
        ...(this.defaultEmbedder && {
          hybrid: { embedder: this.defaultEmbedder, semanticRatio: 0.5 },
        }),
        ...options?.searchKitOptions,
        sort,
      })
    ).hits;

    return result.map(this.formatMemoryItem);
  }

  private formatMemoryItem(item: Hit<VectorStoreDocument<T>>): VectorStoreDocument<T> {
    return omit(item, [
      "_formatted",
      "_matchesPosition",
      "_rankingScore",
      "_rankingScoreDetails",
      "_federation",
    ]);
  }
}
