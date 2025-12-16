import type { SQL } from "@aigne/sqlite";
import { sql } from "@aigne/sqlite";

/**
 * Initial migration: Create source_metadata and view_metadata tables
 */
export const init = {
  hash: "001-init",
  sql: (): SQL[] => [
    // Source metadata table
    sql`
CREATE TABLE IF NOT EXISTS source_metadata (
  path TEXT PRIMARY KEY,
  source_revision TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  drivers_hint TEXT,
  created_at INTEGER NOT NULL
)`,
    // View metadata table
    sql`
CREATE TABLE IF NOT EXISTS view_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  view TEXT NOT NULL,
  state TEXT NOT NULL,
  derived_from TEXT NOT NULL,
  generated_at INTEGER,
  error TEXT,
  storage_path TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(path, view)
)`,
    // Indexes
    sql`CREATE INDEX IF NOT EXISTS idx_view_path ON view_metadata(path)`,
    sql`CREATE INDEX IF NOT EXISTS idx_view_state ON view_metadata(state)`,
    sql`CREATE INDEX IF NOT EXISTS idx_view_derived_from ON view_metadata(derived_from)`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS unique_path_view ON view_metadata(path, view)`,
  ],
};
