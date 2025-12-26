import type { Emitter } from "strict-event-emitter";
import { type ZodType, z } from "zod";

export interface AFSListOptions {
  filter?: {
    agentId?: string;
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
  /**
   * Glob pattern to filter entries by path.
   * Examples: "*.ts", "**\/*.js", "src/**\/*.{ts,tsx}"
   */
  pattern?: string;
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

/**
 * View represents different projections of the same file
 * V1: Only language dimension is implemented
 * Future: format, policy, variant dimensions
 */
export interface View {
  language?: string; // Target language for translation (e.g., "en", "zh", "ja")
  // format?: string;     // Future: format conversion (e.g., "html", "pdf")
  // policy?: string;     // Future: content style policy (e.g., "technical", "marketing")
  // variant?: string;    // Future: content variant (e.g., "summary", "toc", "index")
}

/**
 * Wait strategy for view processing
 * - strict: Wait for view generation to complete before returning
 * - fallback: Return source immediately and trigger background generation
 */
export type WaitStrategy = "strict" | "fallback";

/**
 * View status in read result
 * Indicates whether the requested view was returned or fell back to source
 */
export interface ViewStatus {
  fallback?: boolean; // true = returned source content, view is being generated in background
}

export interface AFSReadOptions {
  view?: View;
  wait?: WaitStrategy;
  context?: any;
}

export interface AFSReadResult {
  data?: AFSEntry;
  message?: string;
  viewStatus?: ViewStatus;
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
  agentSucceed: [
    {
      agentId?: string;
      userId?: string;
      sessionId?: string;
      input: object;
      output: object;
      messages?: object[];
    },
  ];
  historyCreated: [{ entry: AFSEntry }];
};

export interface AFSRootListOptions extends AFSListOptions, AFSContextPreset {
  preset?: string;
}

export interface AFSRootListResult extends Omit<AFSListResult, "data"> {
  data: any;
}

export interface AFSRootSearchOptions extends AFSSearchOptions, AFSContextPreset {
  preset?: string;
}

export interface AFSRootSearchResult extends Omit<AFSSearchResult, "data"> {
  data: any;
}

export interface AFSRoot extends Emitter<AFSRootEvents>, AFSModule {
  list(path: string, options?: AFSRootListOptions): Promise<AFSRootListResult>;

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
  agentId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  summary?: string | null;
  description?: string | null;
  metadata?: AFSEntryMetadata | null;
  linkTo?: string | null;
  content?: T;
}

export const afsEntrySchema: ZodType<AFSEntry> = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  path: z.string(),
  userId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  linkTo: z.string().nullable().optional(),
  content: z.any().optional(),
});

export interface AFSContextPreset {
  /**
   * The view template for presenting the search results.
   */
  view?: string;

  select?: AFSContextPresetOptionAgent<{ path: string; query?: string }, { data: string[] }>;

  per?: AFSContextPresetOptionAgent<{ data: AFSEntry }, { data: unknown }>;

  dedupe?: AFSContextPresetOptionAgent<{ data: unknown[] }, { data: unknown }>;

  format?:
    | "default"
    | "simple-list"
    | "tree"
    | AFSContextPresetOptionAgent<{ data: unknown }, { data: unknown }>;
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

/**
 * AFSDriver interface for view transformation
 */
export interface AFSDriver {
  readonly name: string;
  readonly description?: string;

  /**
   * Declare which view dimensions this driver can handle
   */
  readonly capabilities: {
    dimensions: (keyof View)[];
  };

  /**
   * Check if this driver can handle the given view
   */
  canHandle(view: View): boolean;

  /**
   * Process and generate the view projection
   */
  process(
    module: AFSModule,
    path: string,
    view: View,
    options: {
      sourceEntry: AFSEntry;
      metadata: any;
      context: any;
    },
  ): Promise<{ data: AFSEntry; message?: string }>;

  /**
   * Optional: Called when driver is mounted to AFS
   */
  onMount?(root: AFSRoot): void;
}
