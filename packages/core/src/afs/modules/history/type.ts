import type { AFSEntry } from "../../type.js";

export interface HistoryStorageCreateEntry extends Omit<AFSEntry, "id"> {}

export interface HistoryStorageListOptions {
  filter?: {
    userId?: string;
    sessionId?: string;
  };
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
}

export abstract class HistoryStorage {
  abstract create(entry: HistoryStorageCreateEntry): Promise<AFSEntry>;

  abstract list(options?: HistoryStorageListOptions): Promise<{ list: AFSEntry[] }>;

  abstract read(path: string): Promise<AFSEntry | undefined>;
}
