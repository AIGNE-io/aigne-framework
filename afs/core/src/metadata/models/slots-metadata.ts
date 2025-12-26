import { integer, primaryKey, sqliteTable, text } from "@aigne/sqlite";

/**
 * Slots metadata table schema
 * Tracks image slots declared in documents
 */
export const slotsMetadataTable = sqliteTable(
  "afs_slots",
  {
    ownerPath: text("owner_path").notNull(),
    slotId: text("slot_id").notNull(),
    ownerRevision: text("owner_revision").notNull(),
    slotType: text("slot_type").notNull(), // v1: "image"
    desc: text("desc").notNull(), // prompt seed for image generation
    intentKey: text("intent_key").notNull(), // hash(normalize(desc)) or explicit key
    assetPath: text("asset_path").notNull(), // .afs/images/by-intent/<intentKey>
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ownerPath, table.slotId] }),
  }),
);

export type SlotsMetadataRow = typeof slotsMetadataTable.$inferSelect;
export type SlotsMetadataInsert = typeof slotsMetadataTable.$inferInsert;
