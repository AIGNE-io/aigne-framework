import type { AFSEntry, AFSModule } from "@aigne/afs";
import type { SQL } from "@aigne/sqlite";

export interface AFSStorageCreatePayload extends AFSEntry {}

export interface AFSStorageListOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
  };
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
}

export interface AFSStorageReadOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
  };
}

export interface AFSStorage {
  create(entry: AFSStorageCreatePayload): Promise<AFSEntry>;

  list(options?: AFSStorageListOptions): Promise<{ data: AFSEntry[] }>;

  read(id: string, options?: AFSStorageReadOptions): Promise<AFSEntry | undefined>;
}

export type AFSStorageMigrations = { hash: string; sql: (module: AFSModule) => SQL[] };
