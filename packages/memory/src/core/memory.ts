import {
  Memorable,
  type MemoryActionItem,
  type MemoryActions,
  type MemoryRunner,
  type RunOptions,
  type RunnableResponse,
  type RunnableResponseStream,
  logger,
  objectToRunnableResponseStream,
} from "@aigne/core";
import { mkdir, writeFile } from "fs-extra";
import { joinURL } from "ufo";
import { stringify } from "yaml";

import nextId from "../lib/next-id";
import { SearchKitRetriever } from "../retriever/search-kit";
import { DefaultHistoryStore } from "../store/default-history-store";
import { loadConfig } from "./config";
import type { HistoryStore, Retriever, VectorStoreDocument } from "./type";

type MemoryRunnerCustomData<T> = { retriever: Retriever<T> };

export class Memory<
  T,
  I extends MemoryActions<T> = MemoryActions<T>,
> extends Memorable<T, MemoryRunnerCustomData<T>> {
  constructor(
    public options: {
      path: string;
      runner?: MemoryRunner<T, MemoryRunnerCustomData<T>>;
      retriever?: Retriever<T>;
      historyStore?: HistoryStore<T>;
    },
  ) {
    super();
  }

  get runner() {
    return this.options.runner;
  }

  private _init?: Promise<{
    retriever: Retriever<T>;
    historyStore: HistoryStore<T>;
  }>;

  private get init() {
    this._init ??= (async () => {
      const { path } = this.options;

      const configPath = joinURL(path, "config.yaml");

      const config = (await loadConfig(configPath)) ?? { id: nextId() };

      await mkdir(path, { recursive: true });
      await writeFile(configPath, stringify(config));

      const historyStore =
        this.options.historyStore ?? DefaultHistoryStore.load<T>({ path });
      const retriever =
        this.options.retriever ??
        SearchKitRetriever.load<T>({ id: config.id, path });

      return { retriever, historyStore };
    })();

    return this._init;
  }

  async add(
    messages: Extract<
      MemoryActions<T>,
      { action: "add" }
    >["inputs"]["messages"],
    options?: Extract<MemoryActions<T>, { action: "add" }>["inputs"]["options"],
  ): Promise<Extract<MemoryActions<T>, { action: "add" }>["outputs"]> {
    if (!this.runner) throw new Error("Runner is not defined");

    const { retriever, historyStore } = await this.init;

    const { userId, sessionId, agentId, metadata = {} } = options ?? {};

    const [{ actions }] = await Promise.all([
      this.runner.run({ ...options, messages, customData: { retriever } }),

      historyStore.addMessage({
        userId,
        sessionId,
        agentId,
        messages,
        metadata,
      }),
    ]);

    logger.debug("Extract memory actions", { actions });

    const results: MemoryActionItem<T>[] = [];

    for (const action of actions) {
      switch (action.event) {
        case "add": {
          const memory = await this.createMemory({
            userId,
            sessionId,
            agentId,
            memory: action.memory,
            metadata: { ...metadata, ...action.metadata },
          });

          results.push({
            id: memory.id,
            memory: action.memory,
            event: action.event,
          });
          break;
        }

        case "update": {
          await this.updateMemory({
            id: action.id,
            userId,
            sessionId,
            agentId,
            memory: action.memory,
            metadata: { ...metadata, ...action.metadata },
          });

          results.push({
            id: action.id,
            memory: action.memory,
            event: action.event,
            oldMemory: action.oldMemory,
          });
          break;
        }

        case "delete": {
          await this.deleteMemory(action.id);

          results.push({
            id: action.id,
            memory: action.memory,
            event: action.event,
          });
          break;
        }

        case "none":
          logger.debug("NOOP for Memory.");
          break;

        default:
          logger.warn("Unknown action", { action: (action as any).event });
          break;
      }
    }

    return { results };
  }

  async search(
    query: Extract<MemoryActions<T>, { action: "search" }>["inputs"]["query"],
    options?: Extract<
      MemoryActions<T>,
      { action: "search" }
    >["inputs"]["options"],
  ): Promise<Extract<MemoryActions<T>, { action: "search" }>["outputs"]> {
    const { retriever } = await this.init;

    const filter = {
      ...options?.filter,
      ...(options?.userId ? { userId: options.userId } : {}),
      ...(options?.sessionId ? { sessionId: options.sessionId } : {}),
      ...(options?.agentId ? { agentId: options.agentId } : {}),
    };

    const memories = await retriever.searchWithScore(query, options?.k || 100, {
      filter,
      sort: options?.sort,
    });

    return {
      results: memories.map(([memory, score]) => ({ ...memory, score })),
    };
  }

  async filter(
    options: Extract<
      MemoryActions<T>,
      { action: "filter" }
    >["inputs"]["options"],
  ): Promise<Extract<MemoryActions<T>, { action: "filter" }>["outputs"]> {
    const { retriever } = await this.init;

    const filter = {
      ...options?.filter,
      ...(options?.userId ? { userId: options.userId } : {}),
      ...(options?.sessionId ? { sessionId: options.sessionId } : {}),
      ...(options?.agentId ? { agentId: options.agentId } : {}),
    };

    const results = await retriever.list(options?.k || 1, {
      filter,
      sort: options?.sort,
    });

    return { results };
  }

  async get(
    memoryId: Extract<
      MemoryActions<T>,
      { action: "get" }
    >["inputs"]["memoryId"],
  ): Promise<Extract<MemoryActions<T>, { action: "get" }>["outputs"]> {
    const { retriever } = await this.init;

    const result = await retriever.get(memoryId);

    return { result };
  }

  async create(
    memory: Extract<MemoryActions<T>, { action: "create" }>["inputs"]["memory"],
    options?: Extract<
      MemoryActions<T>,
      { action: "create" }
    >["inputs"]["options"],
  ): Promise<Extract<MemoryActions<T>, { action: "create" }>["outputs"]> {
    const result = await this.createMemory({
      ...options,
      memory,
      metadata: options?.metadata ?? {},
    });
    return { result };
  }

  async update(
    memoryId: Extract<
      MemoryActions<T>,
      { action: "update" }
    >["inputs"]["memoryId"],
    memory: T,
  ): Promise<Extract<MemoryActions<T>, { action: "update" }>["outputs"]> {
    const result = await this.updateMemory({ id: memoryId, memory });
    return { result };
  }

  async delete(
    memoryId: Extract<
      MemoryActions<T>,
      { action: "delete" }
    >["inputs"]["filter"],
  ): Promise<Extract<MemoryActions<T>, { action: "delete" }>["outputs"]> {
    await this.deleteMemory(memoryId);
    return {};
  }

  async reset(): Promise<void> {
    const { retriever, historyStore } = await this.init;

    await Promise.all([retriever.reset(), historyStore.reset()]);
  }

  private async _run(input: I): Promise<I["outputs"]> {
    const { action, inputs } = input;

    switch (action) {
      case "add":
        return await this.add(inputs.messages, inputs.options);
      case "search":
        return await this.search(inputs.query, inputs.options);
      case "filter":
        return await this.filter(inputs.options);
      case "get":
        return await this.get(inputs.memoryId);
      case "create":
        return await this.create(inputs.memory, inputs.options);
      case "update":
        return await this.update(inputs.memoryId, inputs.memory);
      case "delete":
        return await this.delete(inputs.filter);
      default:
        throw new Error("Invalid action");
    }
  }

  async run(
    input: I,
    options: RunOptions & { stream: true },
  ): Promise<RunnableResponseStream<I["outputs"]>>;
  async run(
    input: I,
    options?: RunOptions & { stream?: false },
  ): Promise<I["outputs"]>;
  async run(
    input: I,
    options?: RunOptions,
  ): Promise<RunnableResponse<I["outputs"]>> {
    const result = await this._run(input);

    return options?.stream ? objectToRunnableResponseStream(result) : result;
  }

  private async createMemory(
    params: Omit<VectorStoreDocument<T>, "id" | "createdAt" | "updatedAt">,
  ) {
    const { retriever, historyStore } = await this.init;

    const memoryId = nextId();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const { userId, sessionId, agentId, memory, metadata } = params;

    const document: VectorStoreDocument<T> = {
      id: memoryId,
      userId,
      sessionId,
      agentId,
      createdAt,
      updatedAt,
      memory,
      metadata,
    };

    await Promise.all([
      retriever.insert(document),
      historyStore.addHistory({
        memoryId,
        newMemory: params.memory,
        event: "add",
      }),
    ]);

    return document;
  }

  private async updateMemory(
    params: Partial<VectorStoreDocument<T>> & { id: string },
  ) {
    const { retriever, historyStore } = await this.init;

    const originalMemory = await retriever.get(params.id);
    if (!originalMemory) throw new Error("Memory not found");

    const newMemory = {
      ...originalMemory,
      ...params,
      updatedAt: new Date().toISOString(),
      metadata: { ...originalMemory.metadata, ...params.metadata },
    };

    await Promise.all([
      retriever.update(newMemory),

      historyStore.addHistory({
        memoryId: params.id,
        oldMemory: originalMemory.memory,
        newMemory: params.memory,
        event: "update",
      }),
    ]);

    return newMemory;
  }

  private async deleteMemory(
    memoryIdOrFilter: string | string[] | { [key: string]: any },
  ) {
    const { retriever, historyStore } = await this.init;

    const memories = await retriever.delete(memoryIdOrFilter);

    await historyStore.addHistory(
      ...memories.map((m) => ({
        memoryId: m.id,
        oldMemory: m.memory,
        event: "delete" as const,
        isDeleted: true,
      })),
    );
  }
}
