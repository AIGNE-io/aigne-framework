import type {
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSReadResult,
  AFSWriteEntryPayload,
  AFSWriteResult,
} from "@aigne/afs";
import { v7 } from "@aigne/uuid";
import { createRouter } from "radix3";
import { joinURL } from "ufo";
import {
  type AFSStorage,
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
    type: "root" | "list" | "detail";
    id: "new-history" | "by-session" | "by-user" | "by-agent";
  }>({
    routes: {
      "/new": { type: "root", id: "new-history" },
      "/by-session": { type: "root", id: "by-session" },
      "/by-session/:sessionId": { type: "list", id: "by-session" },
      "/by-session/:sessionId/:entryId": { type: "detail", id: "by-session" },
      "/by-user": { type: "root", id: "by-user" },
      "/by-user/:userId": { type: "list", id: "by-user" },
      "/by-user/:userId/:entryId": { type: "detail", id: "by-user" },
      "/by-agent": { type: "root", id: "by-agent" },
      "/by-agent/:agentId": { type: "list", id: "by-agent" },
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

    return { data: [] };
  }

  async read(path: string): Promise<AFSReadResult> {
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

    return {};
  }

  async write(path: string, content: AFSWriteEntryPayload): Promise<AFSWriteResult> {
    const match = this.router.lookup(path);
    if (match?.id !== "new-history") {
      throw new Error("Can only write to /new to create a new history entry.");
    }

    if (!content.sessionId) throw new Error("sessionId is required to create a history entry.");

    const id = v7();

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
