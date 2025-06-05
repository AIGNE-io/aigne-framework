import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuidv7 } from "uuid";

export const Trace = sqliteTable("Trace", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  rootId: text("rootId"),
  parentId: text("parentId"),
  name: text("name"),
  status: text("status"),
  startedAt: integer("startedAt"),
  endedAt: integer("endedAt"),
  latency: integer("latency"),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  userId: text("userId"),
  sessionId: text("sessionId"),
  metadata: text("metadata"),
});
