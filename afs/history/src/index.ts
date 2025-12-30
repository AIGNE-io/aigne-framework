import type {
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSReadOptions,
  AFSReadResult,
  AFSWriteEntryPayload,
  AFSWriteResult,
} from "@aigne/afs";
import { v7 } from "@aigne/uuid";
import { createRouter } from "radix3";
import { joinURL } from "ufo";
import {
  type AFSStorage,
  type CompactType,
  SharedAFSStorage,
  type SharedAFSStorageOptions,
} from "./storage/index.js";

export * from "./storage/index.js";

export interface AFSHistoryOptions {
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
}

export class AFSHistory implements AFSModule {
  constructor(options?: AFSHistoryOptions) {
    this.storage =
      options?.storage instanceof SharedAFSStorage
        ? options.storage.withModule(this)
        : new SharedAFSStorage(options?.storage).withModule(this);
  }

  readonly name: string = "history";

  private storage: AFSStorage;

  private router = createRouter<{
    type: "root" | "list" | "detail" | "compact" | "compact-detail";
    id: "new-history" | "by-session" | "by-user" | "by-agent";
  }>({
    routes: {
      "/new": { type: "root", id: "new-history" },
      "/by-session": { type: "root", id: "by-session" },
      "/by-session/:sessionId": { type: "list", id: "by-session" },
      "/by-session/:sessionId/@metadata/compact": { type: "compact", id: "by-session" },
      "/by-session/:sessionId/@metadata/compact/:compactId": {
        type: "compact-detail",
        id: "by-session",
      },
      "/by-session/:sessionId/:entryId": { type: "detail", id: "by-session" },
      "/by-user": { type: "root", id: "by-user" },
      "/by-user/:userId": { type: "list", id: "by-user" },
      "/by-user/:userId/@metadata/compact": { type: "compact", id: "by-user" },
      "/by-user/:userId/@metadata/compact/:compactId": { type: "compact-detail", id: "by-user" },
      "/by-user/:userId/:entryId": { type: "detail", id: "by-user" },
      "/by-agent": { type: "root", id: "by-agent" },
      "/by-agent/:agentId": { type: "list", id: "by-agent" },
      "/by-agent/:agentId/@metadata/compact": { type: "compact", id: "by-agent" },
      "/by-agent/:agentId/@metadata/compact/:compactId": { type: "compact-detail", id: "by-agent" },
      "/by-agent/:agentId/:entryId": { type: "detail", id: "by-agent" },
    },
  });

  private rootEntries: AFSEntry[] = [
    {
      id: "new-history",
      path: "/new",
      description:
        "Write to this path to create a new history entry, generating a UUID-based path.",
    },
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

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    if (path === "/") return { data: this.rootEntries };

    // Parse virtual path and extract filter conditions
    const match = this.router.lookup(path);

    // If path doesn't match any virtual path pattern, return empty
    if (!match) {
      return { data: [] };
    }

    const rootEntry = this.rootEntries.find((entry) => entry.path === `/${match.id}`);
    if (!rootEntry) return { data: [] };

    if (match.type === "root") {
      return { data: [rootEntry] };
    }

    const matchId = match.id;

    if (
      match.type === "list" &&
      (matchId === "by-session" || matchId === "by-user" || matchId === "by-agent")
    ) {
      // Merge virtual path filter with explicit filter options
      const mergedFilter = {
        ...options?.filter,
        ...match.params,
      };

      const result = await this.storage.list({
        ...options,
        filter: mergedFilter,
      });

      // Add virtual path prefix to each entry's path
      return {
        ...result,
        data: result.data.map((entry) => ({
          ...entry,
          path: this.normalizePath(entry, matchId),
        })),
      };
    }

    if (
      match.type === "compact" &&
      (matchId === "by-session" || matchId === "by-user" || matchId === "by-agent")
    ) {
      const compactType = this.getCompactType(matchId);
      const mergedFilter = {
        ...options?.filter,
        ...match.params,
      };

      const result = await this.storage.listCompact(compactType, {
        ...options,
        filter: mergedFilter,
      });

      return { data: result.data };
    }

    return { data: [] };
  }

  async read(path: string, options?: AFSReadOptions): Promise<AFSReadResult> {
    // Parse virtual path and extract filter conditions
    const match = this.router.lookup(path);
    if (!match) return {};

    const rootEntry = this.rootEntries.find((entry) => entry.path === `/${match.id}`);
    if (!rootEntry) return {};

    if (match.type === "root") {
      return { data: rootEntry };
    }

    if (
      match.type === "detail" &&
      (match.id === "by-session" || match.id === "by-user" || match.id === "by-agent")
    ) {
      const entryId = match.params?.entryId;
      if (!entryId) throw new Error("Entry ID is required in the path to read detail.");

      const data = await this.storage.read(entryId, {
        filter: match.params,
      });

      return {
        data: data && {
          ...data,
          path: this.normalizePath(data, match.id),
        },
      };
    }

    if (
      match.type === "compact-detail" &&
      (match.id === "by-session" || match.id === "by-user" || match.id === "by-agent")
    ) {
      const compactId = match.params?.compactId;
      if (!compactId) throw new Error("Compact ID is required in the path to read compact detail.");

      const compactType = this.getCompactType(match.id);
      const mergedFilter = {
        ...options?.filter,
        ...match.params,
      };

      const data = await this.storage.readCompact(compactType, compactId, {
        filter: mergedFilter,
      });

      return { data };
    }

    return {};
  }

  async write(path: string, content: AFSWriteEntryPayload): Promise<AFSWriteResult> {
    const id = v7();

    const match = this.router.lookup(path);

    if (match?.type === "compact") {
      const compactType = this.getCompactType(match.id);
      const entry = await this.storage.createCompact(compactType, {
        ...match.params,
        ...content,
        id,
        path: joinURL("/", compactType, id),
      });
      return { data: entry };
    }

    if (match?.id !== "new-history") {
      throw new Error("Can only write to /new or @metadata/compact paths.");
    }

    if (!content.sessionId) throw new Error("sessionId is required to create a history entry.");

    const entry = await this.storage.create({
      ...content,
      id,
      path: joinURL("/", id),
    });

    return {
      data: {
        ...entry,
        path: this.normalizePath(entry, "by-session"),
      },
    };
  }

  private getCompactType(id: "by-session" | "by-user" | "by-agent" | "new-history"): CompactType {
    const mapping: Record<string, CompactType> = {
      "by-session": "session",
      "by-user": "user",
      "by-agent": "agent",
    };

    const type = mapping[id];
    if (!type) throw new Error(`Invalid compact type for id: ${id}`);

    return type;
  }

  private normalizePath(entry: AFSEntry, type: "by-session" | "by-user" | "by-agent"): string {
    const [prefix, scopeId] =
      {
        "by-session": ["by-session", entry.sessionId],
        "by-user": ["by-user", entry.userId],
        "by-agent": ["by-agent", entry.agentId],
      }[type] || [];

    if (!prefix || !scopeId) {
      throw new Error(`Cannot reset path for entry without ${type} info.`);
    }

    return joinURL("/", prefix, scopeId, entry.id);
  }
}
