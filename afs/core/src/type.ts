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
  context?: any;
}

export interface AFSListResult {
  data: AFSEntry[];
  message?: string;
  context?: any;
}

export interface AFSSearchOptions {
  limit?: number;
  caseSensitive?: boolean;
  context?: any;
}

export interface AFSSearchResult {
  data: AFSEntry[];
  message?: string;
}

export type AFSReadOptions = object;

export interface AFSReadResult {
  data?: AFSEntry;
  message?: string;
  context?: any;
}

export interface AFSDeleteOptions {
  recursive?: boolean;
  context?: any;
}

export interface AFSDeleteResult {
  message?: string;
}

export interface AFSRenameOptions {
  overwrite?: boolean;
  context?: any;
}

export interface AFSRenameResult {
  message?: string;
}

export interface AFSWriteOptions {
  append?: boolean;
  context?: any;
}

export interface AFSWriteResult {
  data: AFSEntry;
  message?: string;
  context?: any;
}

export interface AFSWriteEntryPayload extends Omit<AFSEntry, "id" | "path"> {}

export interface AFSExecOptions {
  context: any;
}

export interface AFSExecResult {
  data: Record<string, any>;
}

export interface AFSModule {
  readonly name: string;

  readonly description?: string;

  onMount?(root: AFSRoot): void;

  list?(path: string, options?: AFSListOptions): Promise<AFSListResult>;

  read?(path: string, options?: AFSReadOptions): Promise<AFSReadResult>;

  write?(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<AFSWriteResult>;

  delete?(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult>;

  rename?(oldPath: string, newPath: string, options?: AFSRenameOptions): Promise<AFSRenameResult>;

  search?(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult>;

  // TODO: options.context should be typed properly
  exec?(path: string, args: Record<string, any>, options: AFSExecOptions): Promise<AFSExecResult>;
}

export type AFSRootEvents = {
  agentSucceed: [{ input: object; output: object }];
  historyCreated: [{ entry: AFSEntry }];
};

export interface AFSRootListOptionsWithListOptions extends AFSListOptions {
  format?: "list";
}

export interface AFSRootListOptionsWithTreeFormat extends AFSListOptions {
  format: "tree";
}

export type AFSRootListOptions =
  | AFSRootListOptionsWithListOptions
  | AFSRootListOptionsWithTreeFormat;

export interface AFSRootListResultWithListFormat extends AFSListResult {}

export interface AFSRootListResultWithTreeFormat extends Omit<AFSListResult, "data"> {
  data: string;
}

export type AFSRootListResult = AFSRootListResultWithListFormat | AFSRootListResultWithTreeFormat;

export interface AFSRootSearchOptionsNormal extends AFSSearchOptions {}

export interface AFSRootSearchOptionsWithPreset extends AFSSearchOptions {
  preset: string;
}

export type AFSRootSearchOptions = AFSRootSearchOptionsNormal | AFSRootSearchOptionsWithPreset;

export interface AFSRootSearchResultNormal extends AFSSearchResult {}

export interface AFSRootSearchResultWithPreset extends Omit<AFSSearchResult, "data"> {
  data: unknown;
}

export type AFSRootSearchResult = AFSRootSearchResultNormal | AFSRootSearchResultWithPreset;

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {
  list(
    path: string,
    options: AFSRootListOptionsWithTreeFormat,
  ): Promise<AFSRootListResultWithTreeFormat>;
  list(
    path: string,
    options?: AFSRootListOptionsWithListOptions,
  ): Promise<AFSRootListResultWithListFormat>;
  list(path: string, options?: AFSRootListOptions): Promise<AFSRootListResult>;

  search(
    path: string,
    query: string,
    options: AFSRootSearchOptionsWithPreset,
  ): Promise<AFSRootSearchResultWithPreset>;
  search(
    path: string,
    query: string,
    options?: AFSRootSearchOptionsNormal,
  ): Promise<AFSRootSearchResultNormal>;
  search(path: string, query: string, options: AFSRootSearchOptions): Promise<AFSRootSearchResult>;
}

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

export interface AFSContextPreset {
  /**
   * The view template for presenting the search results.
   */
  view?: string;

  select?: AFSContextPresetOptionAgent<{ path: string; query: string }, { data: string[] }>;

  per?: AFSContextPresetOptionAgent<{ data: AFSEntry }, { data: unknown }>;

  dedupe?: AFSContextPresetOptionAgent<{ data: unknown[] }, { data: unknown[] }>;
}

export interface AFSContextPresetOptionAgent<I = any, O = any> {
  invoke(input: I, options?: any): Promise<O>;
}

export interface AFSContext {
  search?: {
    presets?: Record<string, AFSContextPreset>;
  };
  list?: {
    presets?: Record<string, AFSContextPreset>;
  };
}
