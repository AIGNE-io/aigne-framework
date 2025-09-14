import type { Emitter } from "strict-event-emitter";
import type { ContextEventMap } from "../aigne/context.js";

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

export interface AFSModule {
  onMount?(root: AFSRoot, mountPath: string): void;

  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }>;

  read?(path: string): Promise<AFSEntry | undefined>;

  write?(path: string, content: Omit<AFSEntry, "path">): Promise<AFSEntry>;

  search?(path: string, query: string, options?: AFSSearchOptions): Promise<{ list: AFSEntry[] }>;
}

export type AFSRootEvents = ContextEventMap & {
  historyCreated: [AFSEntry];
};

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {}

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
