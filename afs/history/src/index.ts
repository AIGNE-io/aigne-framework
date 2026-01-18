import {
  type AFSAccessMode,
  type AFSDeleteOptions,
  type AFSDeleteResult,
  type AFSEntry,
  type AFSListOptions,
  type AFSListResult,
  type AFSModule,
  type AFSModuleClass,
  type AFSModuleLoadParams,
  type AFSReadOptions,
  type AFSReadResult,
  type AFSRoot,
  type AFSWriteEntryPayload,
  type AFSWriteOptions,
  type AFSWriteResult,
  accessModeSchema,
} from "@aigne/afs";
import { camelize, optionalize, zodParse } from "@aigne/afs-utils/zod/index.js";
import { v7 } from "@aigne/uuid";
import { createRouter } from "radix3";
import { joinURL } from "ufo";
import { z } from "zod";
import {
  type AFSStorage,
  AFSStorageSQLite,
  type AFSStorageSQLiteOptions,
  type EntryType,
  isAFSStorage,
  type Scope,
} from "./storage/index.js";

export * from "./storage/index.js";

export interface AFSHistoryOptions {
  storage?: AFSStorage | AFSStorageSQLiteOptions;
  /**
   * Access mode for this module.
   * @default "readwrite"
   */
  accessMode?: AFSAccessMode;
}

const afsStorageOptionsSchema = camelize(
  z.object({
    url: optionalize(z.string().describe("Database URL for storage")),
  }),
);

const afsHistoryOptionsSchema = camelize(
  z.object({
    storage: optionalize(z.union([z.custom((v) => isAFSStorage(v)), afsStorageOptionsSchema])),
    accessMode: accessModeSchema,
  }),
);

export class AFSHistory implements AFSModule {
  static schema() {
    return afsHistoryOptionsSchema;
  }

  static async load({ parsed }: AFSModuleLoadParams) {
    const valid = await AFSHistory.schema().parseAsync(parsed);
    return new AFSHistory(valid);
  }

  constructor(options?: AFSHistoryOptions) {
    zodParse(optionalize(afsHistoryOptionsSchema), options);

    this.storage = isAFSStorage(options?.storage)
      ? options.storage
      : new AFSStorageSQLite(this, options?.storage);
    this.accessMode = options?.accessMode ?? "readwrite";
  }

  readonly name: string = "history";

  readonly accessMode: AFSAccessMode;

  private storage: AFSStorage;

  private afs?: AFSRoot;

  private router = createRouter<{
    action: "list" | "read" | "create" | "delete";
    type: EntryType;
    scope: Scope;
  }>({
    routes: {
      "/by-session": { action: "list", type: "history", scope: "session" },
      "/by-session/:sessionId": { action: "list", type: "history", scope: "session" },
      "/by-session/:sessionId/new": { action: "create", type: "history", scope: "session" },
      "/by-session/:sessionId/@metadata/compact": {
        action: "list",
        type: "compact",
        scope: "session",
      },
      "/by-session/:sessionId/@metadata/compact/new": {
        action: "create",
        type: "compact",
        scope: "session",
      },
      "/by-session/:sessionId/@metadata/compact/:compactId": {
        action: "read",
        type: "compact",
        scope: "session",
      },
      "/by-session/:sessionId/@metadata/memory": {
        action: "list",
        type: "memory",
        scope: "session",
      },
      "/by-session/:sessionId/@metadata/memory/new": {
        action: "create",
        type: "memory",
        scope: "session",
      },
      "/by-session/:sessionId/@metadata/memory/:memoryId": {
        action: "read",
        type: "memory",
        scope: "session",
      },
      "/by-session/:sessionId/:entryId": { action: "read", type: "history", scope: "session" },
      "/by-user": { action: "list", type: "history", scope: "user" },
      "/by-user/:userId": { action: "list", type: "history", scope: "user" },
      "/by-user/:userId/new": { action: "create", type: "history", scope: "user" },
      "/by-user/:userId/@metadata/compact": { action: "list", type: "compact", scope: "user" },
      "/by-user/:userId/@metadata/compact/new": {
        action: "create",
        type: "compact",
        scope: "user",
      },
      "/by-user/:userId/@metadata/compact/:compactId": {
        action: "read",
        type: "compact",
        scope: "user",
      },
      "/by-user/:userId/@metadata/memory": { action: "list", type: "memory", scope: "user" },
      "/by-user/:userId/@metadata/memory/new": { action: "create", type: "memory", scope: "user" },
      "/by-user/:userId/@metadata/memory/:memoryId": {
        action: "read",
        type: "memory",
        scope: "user",
      },
      "/by-user/:userId/:entryId": { action: "read", type: "history", scope: "user" },
      "/by-agent": { action: "list", type: "history", scope: "agent" },
      "/by-agent/:agentId": { action: "list", type: "history", scope: "agent" },
      "/by-agent/:agentId/new": { action: "create", type: "history", scope: "agent" },
      "/by-agent/:agentId/@metadata/compact": { action: "list", type: "compact", scope: "agent" },
      "/by-agent/:agentId/@metadata/compact/new": {
        action: "create",
        type: "compact",
        scope: "agent",
      },
      "/by-agent/:agentId/@metadata/compact/:compactId": {
        action: "read",
        type: "compact",
        scope: "agent",
      },
      "/by-agent/:agentId/:entryId": { action: "read", type: "history", scope: "agent" },
    },
  });

  private rootEntries: AFSEntry[] = [
    {
      id: "by-session",
      path: "/by-session",
      description: "Retrieve history entries by session ID.",
    },
    {
      id: "by-user",
      path: "/by-user",
      description: "Retrieve history entries by user ID.",
    },
    {
      id: "by-agent",
      path: "/by-agent",
      description: "Retrieve history entries by agent ID.",
    },
  ];

  onMount(afs: AFSRoot): void {
    this.afs = afs;
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    if (path === "/") return { data: this.rootEntries };

    const match = this.router.lookup(path);
    if (!match || match.action !== "list") {
      return { data: [] };
    }

    const { type, scope } = match;
    const mergedFilter = {
      ...options?.filter,
      ...match.params,
    };

    const result = await this.storage.list({
      ...options,
      type,
      scope,
      filter: mergedFilter,
    });

    return {
      ...result,
      data: result.data.map((entry) => ({
        ...entry,
        path: this.normalizePath(entry, scope, type),
      })),
    };
  }

  async read(path: string, options?: AFSReadOptions): Promise<AFSReadResult> {
    const match = this.router.lookup(path);
    if (!match || match.action !== "read") return {};

    const { type, scope } = match;

    const entryId = match.params?.entryId ?? match.params?.compactId ?? match.params?.memoryId;
    if (!entryId) throw new Error(`Entry ID is required in the path to read ${type}.`);

    const mergedFilter = {
      ...options?.filter,
      ...match.params,
    };

    const data = await this.storage.read(entryId, {
      type,
      scope,
      filter: mergedFilter,
    });

    // Add virtual path prefix for entries
    return {
      data: data && {
        ...data,
        path: this.normalizePath(data, scope, type),
      },
    };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
    options: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    const id = v7();
    const match = this.router.lookup(path);

    if (!match || match.action !== "create") {
      throw new Error(
        "Can only write to paths with 'new' suffix: /by-{scope}/{scopeId}/new or /by-{scope}/{scopeId}/@metadata/{type}/new",
      );
    }

    const { type, scope } = match;

    // Validate that scope ID is provided in path params
    const scopeIdField = `${scope}Id`;
    const scopeIdValue = match.params?.[scopeIdField];
    if (!scopeIdValue) {
      throw new Error(`${scopeIdField} is required in the path to create ${type} entry.`);
    }

    const entry = await this.storage.create(
      {
        ...match.params,
        ...content,
        id,
        path: joinURL("/", type, id),
      },
      { type, scope },
    );

    // Emit event for history entries
    if (type === "history") {
      this.afs?.emit("historyCreated", { entry }, options);
    }

    return {
      data: {
        ...entry,
        path: this.normalizePath(entry, scope, type),
      },
    };
  }

  async delete(path: string, _options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    const match = this.router.lookup(path);
    if (!match || match.action !== "read") {
      throw new Error(`Cannot delete: path not found or not a valid entry path`);
    }

    const { type, scope } = match;

    const entryId = match.params?.entryId ?? match.params?.compactId ?? match.params?.memoryId;
    if (!entryId) throw new Error(`Entry ID is required in the path to delete ${type}.`);

    const result = await this.storage.delete(entryId, {
      type,
      scope,
      filter: match.params,
    });

    if (result.deletedCount === 0) {
      return {
        message: `No ${type} entry found with id ${entryId}`,
      };
    }

    return {
      message: `Deleted ${result.deletedCount} ${type} entry`,
    };
  }

  private normalizePath(entry: AFSEntry, scope: Scope, entryType?: EntryType): string {
    const scopeIdMap = {
      session: entry.sessionId,
      user: entry.userId,
      agent: entry.agentId,
    };

    const scopeId = scopeIdMap[scope];
    if (!scopeId) {
      throw new Error(`Cannot reset path for entry without ${scope} info.`);
    }

    const prefix = `by-${scope}`;

    // Build path based on entry type
    if (entryType === "compact") {
      return joinURL("/", prefix, scopeId, "@metadata/compact", entry.id);
    }
    if (entryType === "memory") {
      return joinURL("/", prefix, scopeId, "@metadata/memory", entry.id);
    }

    // Default: history entry
    return joinURL("/", prefix, scopeId, entry.id);
  }
}

const _typeCheck: AFSModuleClass<AFSHistory, AFSHistoryOptions> = AFSHistory;
