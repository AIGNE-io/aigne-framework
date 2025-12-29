import type { SQL } from "@aigne/sqlite";
import { sql } from "@aigne/sqlite";

/**
 * Initial migration: Create source_metadata, view_metadata, afs_slots, and afs_deps_meta tables
 */
export const init = {
  hash: "001-init",
  sql: (): SQL[] => [
    // Source metadata table
    sql`
CREATE TABLE IF NOT EXISTS source_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module TEXT NOT NULL,
  path TEXT NOT NULL,
  source_revision TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  drivers_hint TEXT,
  kind TEXT,
  attrs_json TEXT,
  created_at INTEGER NOT NULL
)`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS unique_module_path ON source_metadata(module, path)`,

    // View metadata table
    sql`
CREATE TABLE IF NOT EXISTS view_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module TEXT NOT NULL,
  path TEXT NOT NULL,
  view TEXT NOT NULL,
  state TEXT NOT NULL,
  derived_from TEXT NOT NULL,
  generated_at INTEGER,
  error TEXT,
  storage_path TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`,
    sql`CREATE INDEX IF NOT EXISTS idx_view_path ON view_metadata(path)`,
    sql`CREATE INDEX IF NOT EXISTS idx_view_state ON view_metadata(state)`,
    sql`CREATE INDEX IF NOT EXISTS idx_view_derived_from ON view_metadata(derived_from)`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS unique_module_path_view ON view_metadata(module, path, view)`,

    // Image slots table
    sql`
CREATE TABLE IF NOT EXISTS afs_slots (
  owner_path TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  owner_revision TEXT NOT NULL,
  slot_type TEXT NOT NULL,
  desc TEXT NOT NULL,
  intent_key TEXT NOT NULL,
  asset_path TEXT NOT NULL,
  slug TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_path, slot_id)
)`,
    sql`CREATE INDEX IF NOT EXISTS idx_slots_asset_path ON afs_slots(asset_path)`,
    sql`CREATE INDEX IF NOT EXISTS idx_slots_intent_key ON afs_slots(intent_key)`,

    // Dependencies metadata table
    sql`
CREATE TABLE IF NOT EXISTS afs_deps_meta (
  out_path TEXT NOT NULL,
  out_view_key TEXT NOT NULL,
  in_path TEXT NOT NULL,
  in_revision TEXT NOT NULL,
  role TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (out_path, out_view_key, in_path)
)`,
    sql`CREATE INDEX IF NOT EXISTS idx_deps_in_path ON afs_deps_meta(in_path)`,
    sql`CREATE INDEX IF NOT EXISTS idx_deps_out_path ON afs_deps_meta(out_path, out_view_key)`,
  ],
};
