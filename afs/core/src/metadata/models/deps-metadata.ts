import { integer, primaryKey, sqliteTable, text } from "@aigne/sqlite";

/**
 * Dependencies metadata table schema
 * Tracks dependencies between view outputs and their inputs
 */
export const depsMetadataTable = sqliteTable(
  "afs_deps_meta",
  {
    outPath: text("out_path").notNull(), // output artifact path
    outViewKey: text("out_view_key").notNull(), // output viewKey (normalized)
    inPath: text("in_path").notNull(), // input dependency path
    inRevision: text("in_revision").notNull(), // input sourceRevision at dependency time
    role: text("role").notNull(), // "owner-context" | "source" | "lexicon" | "policy"
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.outPath, table.outViewKey, table.inPath] }),
  }),
);

export type DepsMetadataRow = typeof depsMetadataTable.$inferSelect;
export type DepsMetadataInsert = typeof depsMetadataTable.$inferInsert;
