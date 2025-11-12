import type { Emitter } from "strict-event-emitter";
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

  readonly description?: string;

  onMount?(root: AFSRoot): void;

  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[]; message?: string }>;

  read?(path: string): Promise<{ result?: AFSEntry; message?: string }>;

  write?(
    path: string,
    content: AFSWriteEntryPayload,
  ): Promise<{ result: AFSEntry; message?: string }>;

  search?(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }>;

  // TODO: options.context should be typed properly
  execute?(
    path: string,
    args: Record<string, any>,
    options: { context: any },
  ): Promise<{ result: Record<string, any> }>;
}

export type AFSRootEvents = {
  agentSucceed: [{ input: object; output: object }];
  historyCreated: [{ entry: AFSEntry }];
};

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {
  storage(module: AFSModule): AFSStorage;
}

export interface AFSEntryMetadata extends Record<string, any> {
  execute?: {
    name: string;
    description?: string;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
  };
}

export interface AFSEntry<T = any> {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  path: string;
  userId?: string | null;
  sessionId?: string | null;
  summary?: string | null;
  metadata?: AFSEntryMetadata | null;
  linkTo?: string | null;
  content?: T;
}
