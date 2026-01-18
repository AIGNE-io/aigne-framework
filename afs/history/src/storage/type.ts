import type { AFSEntry, AFSModule } from "@aigne/afs";
import type { SQL } from "@aigne/sqlite";

export interface AFSStorageCreatePayload extends AFSEntry {}

export interface AFSStorageTypeOptions {
  type?: EntryType;
  scope?: Scope;
}

export interface AFSStorageListOptions extends AFSStorageTypeOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
    before?: Date | string;
    after?: Date | string;
  };
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
}

export interface AFSStorageReadOptions extends AFSStorageTypeOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface AFSStorageDeleteOptions extends AFSStorageTypeOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
  };
}

export type EntryType = "history" | "compact" | "memory";

export type Scope = "session" | "user" | "agent";

export interface AFSStorageCreateOptions extends AFSStorageTypeOptions {}

export interface AFSStorage {
  create(entry: AFSStorageCreatePayload, options?: AFSStorageCreateOptions): Promise<AFSEntry>;

  list(options?: AFSStorageListOptions): Promise<{ data: AFSEntry[] }>;

  read(id: string, options?: AFSStorageReadOptions): Promise<AFSEntry | undefined>;

  delete(id: string, options?: AFSStorageDeleteOptions): Promise<{ deletedCount: number }>;
}

export function isAFSStorage(value: any): value is AFSStorage {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.create === "function" &&
    typeof value.list === "function" &&
    typeof value.read === "function" &&
    typeof value.delete === "function"
  );
}

export type AFSStorageMigrations = { hash: string; sql: (module: AFSModule) => SQL[] };
