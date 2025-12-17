import { index, integer, sqliteTable, text } from "@aigne/sqlite";

/**
 * View metadata table schema
 */
export const viewMetadataTable = sqliteTable(
  "view_metadata",
  {
    id: integer("id").notNull().primaryKey({ autoIncrement: true }),
    module: text("module").notNull(),
    path: text("path").notNull(),
    view: text("view").notNull(), // JSON stringified View object
    state: text("state").notNull(), // 'ready' | 'stale' | 'generating' | 'failed'
    derivedFrom: text("derived_from").notNull(),
    generatedAt: integer("generated_at", { mode: "timestamp_ms" }),
    error: text("error"),
    storagePath: text("storage_path"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pathIdx: index("idx_view_path").on(table.path),
    stateIdx: index("idx_view_state").on(table.state),
    derivedFromIdx: index("idx_view_derived_from").on(table.derivedFrom),
    uniqueModulePathView: index("unique_module_path_view").on(table.module, table.path, table.view),
  }),
);

export type ViewMetadataRow = typeof viewMetadataTable.$inferSelect;
export type ViewMetadataInsert = typeof viewMetadataTable.$inferInsert;
