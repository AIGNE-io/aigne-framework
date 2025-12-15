import type { Emitter } from "strict-event-emitter";

export interface AFSListOptions {
  filter?: {
    userId?: string;
    sessionId?: string;
  };
  maxDepth?: number;
  limit?: number;
  orderBy?: [string, "asc" | "desc"][];
  maxChildren?: number;
  onOverflow?: "truncate";
  /**
   * Whether to disable .gitignore files when listing files.
   * @default false
   */
  disableGitignore?: boolean;
}

export interface AFSSearchOptions {
  limit?: number;
  caseSensitive?: boolean;
}

export interface AFSDeleteOptions {
  recursive?: boolean;
}

export interface AFSRenameOptions {
  overwrite?: boolean;
}

export interface AFSWriteOptions {
  append?: boolean;
}

export interface AFSWriteEntryPayload extends Omit<AFSEntry, "id" | "path"> {}

export interface AFSModule {
  readonly name: string;

  readonly description?: string;

  onMount?(root: AFSRoot): void;

  list?(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[]; message?: string }>;

  read?(path: string): Promise<{ result?: AFSEntry; message?: string }>;

  write?(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<{ result: AFSEntry; message?: string }>;

  delete?(path: string, options?: AFSDeleteOptions): Promise<{ message?: string }>;

  rename?(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<{ message?: string }>;

  search?(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }>;

  // TODO: options.context should be typed properly
  exec?(
    path: string,
    args: Record<string, any>,
    options: { context: any },
  ): Promise<{ result: Record<string, any> }>;
}

export type AFSRootEvents = {
  agentSucceed: [{ input: object; output: object }];
  historyCreated: [{ entry: AFSEntry }];
};

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {}

export interface AFSEntryMetadata extends Record<string, any> {
  execute?: {
    name: string;
    description?: string;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
  };
  childrenCount?: number;
  childrenTruncated?: boolean;
}

export interface AFSEntry<T = any> {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  path: string;
  userId?: string | null;
  sessionId?: string | null;
  summary?: string | null;
  description?: string | null;
  metadata?: AFSEntryMetadata | null;
  linkTo?: string | null;
  content?: T;
}
