import type { AFSEntry, AFSModule } from "@aigne/afs";
import type { SQL } from "@aigne/sqlite";

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

  list(options?: AFSStorageListOptions): Promise<{ data: AFSEntry[] }>;

  read(path: string): Promise<AFSEntry | undefined>;
}

export type AFSStorageMigrations = { hash: string; sql: (module: AFSModule) => SQL[] };
