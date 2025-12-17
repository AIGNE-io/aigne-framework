import type { View } from "../type.js";

/**
 * View state
 * - ready: View is generated and up-to-date
 * - stale: View exists but is outdated (source has changed)
 * - generating: View is currently being generated
 * - failed: View generation failed
 */
export type ViewState = "ready" | "stale" | "generating" | "failed";

/**
 * Source-level metadata (per module + path)
 * Tracks the main content version
 */
export interface SourceMetadata {
  module: string;
  path: string;
  sourceRevision: string; // Content hash or mtime:size identifier
  updatedAt: Date;
  driversHint?: string[]; // Optional: driver names that may process this file
}

/**
 * View-level metadata (per module + path + view combination)
 * Tracks the state of each view projection
 */
export interface ViewMetadata {
  module: string;
  path: string;
  view: View;
  state: ViewState;
  derivedFrom: string; // sourceRevision at generation time
  generatedAt?: Date;
  error?: string; // Error message if state = 'failed'
  storagePath?: string; // Physical storage path (e.g., '.i18n/en/...')
}

/**
 * Metadata Store interface
 * Manages source and view metadata using SQLite
 */
export interface MetadataStore {
  // Source metadata operations
  getSourceMetadata(module: string, path: string): Promise<SourceMetadata | null>;
  setSourceMetadata(
    module: string,
    path: string,
    metadata: Omit<SourceMetadata, "module" | "path">,
  ): Promise<void>;
  deleteSourceMetadata(module: string, path: string): Promise<void>;

  // View metadata operations
  getViewMetadata(module: string, path: string, view: View): Promise<ViewMetadata | null>;
  setViewMetadata(
    module: string,
    path: string,
    view: View,
    metadata: Partial<ViewMetadata>,
  ): Promise<void>;
  listViewMetadata(module: string, path: string): Promise<ViewMetadata[]>;
  deleteViewMetadata(module: string, path: string, view?: View): Promise<void>;

  // Batch operations
  markViewsAsStale(module: string, path: string): Promise<void>;
  listStaleViews(): Promise<ViewMetadata[]>;
  listGeneratingViews(): Promise<ViewMetadata[]>;

  // Cleanup operations
  cleanupOrphanedViewMetadata(): Promise<void>;
  cleanupFailedViews(olderThan?: Date): Promise<void>;
}
