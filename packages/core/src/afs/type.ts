import type { PromiseOrValue } from "../utils/type-utils.js";

export interface AFSListOptions {
  recursive?: boolean;
  limit?: number;
  maxDepth?: number;
}

export interface AFSSearchOptions {
  limit?: number;
}

export interface AFSWriteOptions {
  generateFilename?: boolean | (() => PromiseOrValue<string>);
}

export interface AFSModule {
  list(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }>;

  read(path: string): Promise<AFSEntry | undefined>;

  write(
    path: string,
    content: Omit<AFSEntry, "path">,
    options?: AFSWriteOptions,
  ): Promise<AFSEntry>;

  search(path: string, query: string, options?: AFSSearchOptions): Promise<{ list: AFSEntry[] }>;
}

export interface AFSEntry<T = any> {
  path: string;
  userId?: string;
  sessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  summary?: string;
  metadata: Record<string, any>;
  content: T;
}
