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
    componentId?: string;
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
    componentId?: string;
  };
}

export interface AFSStorageDeleteOptions extends AFSStorageTypeOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
    componentId?: string;
  };
}

export type EntryType = "history" | "compact" | "memory" | "component";

export type Scope = "session" | "user" | "agent" | "component";

export interface AFSStorageCreateOptions extends AFSStorageTypeOptions {}

export interface AFSStorage {
  create(entry: AFSStorageCreatePayload, options?: AFSStorageCreateOptions): Promise<AFSEntry>;

  list(options?: AFSStorageListOptions): Promise<{ data: AFSEntry[] }>;

  read(id: string, options?: AFSStorageReadOptions): Promise<AFSEntry | undefined>;

  delete(id: string, options?: AFSStorageDeleteOptions): Promise<{ deletedCount: number }>;
}

export type AFSStorageMigrations = { hash: string; sql: (module: AFSModule) => SQL[] };
