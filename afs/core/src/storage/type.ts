import type { SQL } from "@aigne/sqlite";
import type { AFSEntry, AFSModule } from "../type.js";

export interface AFSStorageCreatePayload extends Omit<AFSEntry, "id"> {}

export interface AFSStorageListOptions {
  filter?: {
    userId?: string;
    sessionId?: string;
  };
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
}

export interface AFSStorage {
  create(entry: AFSStorageCreatePayload): Promise<AFSEntry>;

  list(options?: AFSStorageListOptions): Promise<{ list: AFSEntry[] }>;

  read(path: string): Promise<AFSEntry | undefined>;
}

export type AFSStorageMigrations = { hash: string; sql: (module: AFSModule) => SQL[] };
