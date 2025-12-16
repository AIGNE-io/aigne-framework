import type { Emitter } from "strict-event-emitter";

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

  read?(path: string, options?: ReadOptions): Promise<{ result?: AFSEntry; message?: string }>;

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
 * Options for read operations with view support
 */
export interface ReadOptions {
  view?: View;
  wait?: WaitStrategy;
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
  ): Promise<{ result: AFSEntry; message?: string }>;

  /**
   * Optional: Called when driver is mounted to AFS
   */
  onMount?(root: AFSRoot): void;
}
