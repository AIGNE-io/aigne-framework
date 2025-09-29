import type { Emitter } from "strict-event-emitter";
import type { Context, ContextEventMap } from "../aigne/context.js";
import type { AFSStorage } from "./storage/type.js";

export interface AFSListOptions {
  filter?: {
    userId?: string;
    sessionId?: string;
  };
  recursive?: boolean;
  maxDepth?: number;
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
}

export interface AFSSearchOptions {
  limit?: number;
}

export interface AFSWriteEntryPayload extends Omit<AFSEntry, "id" | "path"> {}

export interface AFSModule {
  readonly moduleId: string;

  readonly path: string;

  onMount?(root: AFSRoot): void;

  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }>;

  read?(path: string): Promise<AFSEntry | undefined>;

  write?(path: string, content: AFSWriteEntryPayload): Promise<AFSEntry>;

  search?(path: string, query: string, options?: AFSSearchOptions): Promise<{ list: AFSEntry[] }>;
}

export type AFSRootEvents = ContextEventMap & {
  historyCreated: [{ context: Context; entry: AFSEntry }];
};

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {
  storage(module: AFSModule): AFSStorage;
}

export interface AFSEntry<T = any> {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  path: string;
  userId?: string | null;
  sessionId?: string | null;
  summary?: string | null;
  metadata?: Record<string, any> | null;
  linkTo?: string | null;
  content?: T;
}
