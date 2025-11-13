import { datetime, json, sqliteTable, text } from "@aigne/sqlite";
import { v7 } from "@aigne/uuid";
import type { AFSModule } from "../../type.js";

export const entriesTableName = (module: AFSModule): string => `Entries_${module.name}`;

export const entriesTable = (module: AFSModule) =>
  sqliteTable(entriesTableName(module), {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => v7()),
    createdAt: datetime("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    path: text("path").notNull(),
    userId: text("userId"),
    sessionId: text("sessionId"),
    summary: text("summary"),
    metadata: json<Record<string, unknown>>("metadata"),
    linkTo: text("linkTo"),
    content: json<any>("content"),
  });
