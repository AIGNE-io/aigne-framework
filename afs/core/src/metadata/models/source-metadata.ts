import { index, integer, sqliteTable, text } from "@aigne/sqlite";

/**
 * Source metadata table schema
 */
export const sourceMetadataTable = sqliteTable(
  "source_metadata",
  {
    id: integer("id").notNull().primaryKey({ autoIncrement: true }),
    module: text("module").notNull(),
    path: text("path").notNull(),
    sourceRevision: text("source_revision").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    driversHint: text("drivers_hint"), // JSON array stored as text
    kind: text("kind"), // "doc" | "image" | "unknown" (hint for driver selection)
    attrsJson: text("attrs_json"), // JSON object for extended attributes (mime, size, width/height, etc.)
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    uniqueModulePath: index("unique_module_path").on(table.module, table.path),
  }),
);

export type SourceMetadataRow = typeof sourceMetadataTable.$inferSelect;
export type SourceMetadataInsert = typeof sourceMetadataTable.$inferInsert;
