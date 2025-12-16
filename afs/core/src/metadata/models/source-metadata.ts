import { integer, sqliteTable, text } from "@aigne/sqlite";

/**
 * Source metadata table schema
 */
export const sourceMetadataTable = sqliteTable("source_metadata", {
  path: text("path").notNull().primaryKey(),
  sourceRevision: text("source_revision").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  driversHint: text("drivers_hint"), // JSON array stored as text
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type SourceMetadataRow = typeof sourceMetadataTable.$inferSelect;
export type SourceMetadataInsert = typeof sourceMetadataTable.$inferInsert;
