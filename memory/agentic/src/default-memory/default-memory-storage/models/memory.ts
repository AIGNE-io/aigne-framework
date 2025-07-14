import { datetime, json } from "@aigne/sqlite/type.js";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";

export const Memories = sqliteTable("Memories", {
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
  sessionId: text("sessionId"),
  content: json("content").notNull(),
});
