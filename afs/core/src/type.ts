import type { Emitter } from "strict-event-emitter";
import { type ZodType, z } from "zod";

/**
 * Access mode for AFS modules and root.
 * - "readonly": Only read operations are allowed (list, read, search)
 * - "readwrite": All operations are allowed
 */
export type AFSAccessMode = "readonly" | "readwrite";

/**
 * Zod schema for access mode validation.
 * Can be reused across modules that support access mode configuration.
 */
export const accessModeSchema = z
  .enum(["readonly", "readwrite"])
  .describe("Access mode for this module")
  .optional();

export interface AFSOperationOptions {
  context?: any;
}

export interface AFSListOptions extends AFSOperationOptions {
  filter?: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
    before?: string;
    after?: string;
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
}

export interface AFSListResult {
  data: AFSEntry[];
  message?: string;
}

export interface AFSSearchOptions extends AFSOperationOptions {
  limit?: number;
  caseSensitive?: boolean;
}

export interface AFSSearchResult {
  data: AFSEntry[];
  message?: string;
}

export interface AFSReadOptions extends AFSOperationOptions {
  filter?: AFSListOptions["filter"];
}

export interface AFSReadResult {
  data?: AFSEntry;
  message?: string;
}

export interface AFSDeleteOptions extends AFSOperationOptions {
  recursive?: boolean;
}

export interface AFSDeleteResult {
  message?: string;
}

export interface AFSRenameOptions extends AFSOperationOptions {
  overwrite?: boolean;
}

export interface AFSRenameResult {
  message?: string;
}

export interface AFSWriteOptions extends AFSOperationOptions {
  append?: boolean;
}

export interface AFSWriteResult {
  data: AFSEntry;
  message?: string;
  context?: any;
}

export interface AFSWriteEntryPayload extends Omit<AFSEntry, "id" | "path"> {}

export interface AFSExecOptions extends AFSOperationOptions {}

export interface AFSExecResult {
  data: Record<string, any>;
}

export interface AFSModule {
  readonly name: string;

  readonly description?: string;

  /**
   * Access mode for this module.
   * - "readonly": Only read operations are allowed
   * - "readwrite": All operations are allowed
   * Default behavior is implementation-specific.
   */
  readonly accessMode?: AFSAccessMode;

  /**
   * Enable automatic agent skill scanning for this module.
   * When set to true, the system will scan this module for agent skills.
   * @default false
   */
  readonly agentSkills?: boolean;

  onMount?(root: AFSRoot): void;

  symlinkToPhysical?(path: string): Promise<void>;

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

/**
 * Parameters for loading a module from configuration.
 */
export interface AFSModuleLoadParams {
  /** Path to the configuration file */
  filepath: string;
  /** Parsed configuration object */
  parsed?: object;
}

/**
 * Interface for module classes that support schema validation and loading from configuration.
 * This describes the static part of a module class.
 *
 * @example
 * ```typescript
 * class MyModule implements AFSModule {
 *   static schema() { return mySchema; }
 *   static async load(params: AFSModuleLoadParams) { ... }
 *   // ...
 * }
 *
 * // Type check
 * const _check: AFSModuleClass<MyModule, MyModuleOptions> = MyModule;
 * ```
 */
export interface AFSModuleClass<T extends AFSModule = AFSModule, O extends object = object> {
  /** Returns the Zod schema for validating module configuration */
  schema(): ZodType<O>;

  /** Loads a module instance from configuration file path and parsed config */
  load(params: AFSModuleLoadParams): Promise<T>;

  /** Constructor */
  new (options: O): T;
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
  historyCreated: [{ entry: AFSEntry }, options: AFSOperationOptions];
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

  initializePhysicalPath(): Promise<string>;

  cleanupPhysicalPath(): Promise<void>;
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
  gitignored?: boolean;
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
